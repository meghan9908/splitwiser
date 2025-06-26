import string
import random
from fastapi import HTTPException, status
from app.database import get_database
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.group.schemas import Member, GroupCreateRequest, GroupUpdateRequest

class GroupService:
    def __init__(self):
        pass

    def get_db(self):
        return get_database()

    def _generate_join_code(self, length: int = 6) -> str:
        """Generates a random alphanumeric join code."""
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

    async def _is_join_code_unique(self, join_code: str) -> bool:
        """Checks if the join code is unique in the database."""
        db = self.get_db()
        existing_group = await db.groups.find_one({"joinCode": join_code})
        return existing_group is None

    async def generate_unique_join_code(self, length: int = 6) -> str:
        """Generates a unique join code."""
        join_code = self._generate_join_code(length)
        while not await self._is_join_code_unique(join_code):
            join_code = self._generate_join_code(length)
        return join_code

    def _transform_group_document(self, group: dict) -> Optional[dict]:
        if not group:
            return None

        # Ensure members are transformed correctly
        transformed_members = []
        if "members" in group and group["members"]:
            for member_data in group["members"]:
                member = Member(
                    userId=str(member_data.get("userId")),
                    role=member_data.get("role", "member"),
                    joinedAt=member_data.get("joinedAt", datetime.now(timezone.utc))
                )
                transformed_members.append(member.model_dump(by_alias=True))

        return {
            "_id": str(group["_id"]),
            "name": group.get("name"),
            "currency": group.get("currency", "USD"),
            "imageUrl": group.get("imageUrl"),
            "joinCode": group.get("joinCode"),
            "createdBy": str(group.get("createdBy")),
            "members": transformed_members,
            "createdAt": group.get("createdAt"),
            "updatedAt": group.get("updatedAt") or group.get("createdAt"),
        }

    async def create_group(self, group_data: GroupCreateRequest, user_id: str) -> Optional[dict]:
        db = self.get_db()
        join_code = await self.generate_unique_join_code()

        now = datetime.now(timezone.utc)

        creator_as_member = Member(userId=user_id, role="admin", joinedAt=now)

        new_group_data = {
            "name": group_data.name,
            "currency": group_data.currency,
            "imageUrl": group_data.imageUrl,
            "createdBy": ObjectId(user_id),
            "joinCode": join_code,
            "members": [creator_as_member.model_dump(by_alias=True)],
            "createdAt": now,
            "updatedAt": now,
        }

        result = await db.groups.insert_one(new_group_data)
        created_group = await db.groups.find_one({"_id": result.inserted_id})
        return self._transform_group_document(created_group)

    async def get_group_by_id(self, group_id: str, user_id: str) -> Optional[dict]:
        db = self.get_db()
        group = await db.groups.find_one({
            "_id": ObjectId(group_id),
            "members.userId": ObjectId(user_id) # Ensure user is a member
        })
        return self._transform_group_document(group)

    async def get_groups_for_user(self, user_id: str) -> List[dict]:
        db = self.get_db()
        groups_cursor = db.groups.find({"members.userId": ObjectId(user_id)})
        groups = []
        async for group in groups_cursor:
            transformed_group = self._transform_group_document(group)
            # For list view, we might want a summary, e.g., member_count
            if transformed_group:
                transformed_group["member_count"] = len(transformed_group.get("members", []))
                groups.append(transformed_group)
        return groups

    async def update_group_metadata(self, group_id: str, updates: GroupUpdateRequest, user_id: str) -> Optional[dict]:
        db = self.get_db()

        # Ensure user is an admin of the group
        group = await db.groups.find_one({
            "_id": ObjectId(group_id),
            "members": {"$elemMatch": {"userId": ObjectId(user_id), "role": "admin"}}
        })
        if not group:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not an admin of this group or group not found")

        update_data = updates.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided")

        update_data["updatedAt"] = datetime.now(timezone.utc)

        result = await db.groups.find_one_and_update(
            {"_id": ObjectId(group_id)},
            {"$set": update_data},
            return_document=True
        )
        return self._transform_group_document(result)

    async def delete_group(self, group_id: str, user_id: str) -> bool:
        db = self.get_db()
        # Ensure user is an admin of the group
        group = await db.groups.find_one({
            "_id": ObjectId(group_id),
            "members": {"$elemMatch": {"userId": ObjectId(user_id), "role": "admin"}}
        })
        if not group:
            # This also handles the case where the group doesn't exist
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not an admin of this group or group not found")

        # TODO: Add logic to check for unsettled expenses before deleting (as per docs)
        # This might involve calling another service (Expense Service)

        result = await db.groups.delete_one({"_id": ObjectId(group_id)})
        return result.deleted_count == 1

    async def join_group_by_code(self, join_code: str, user_id: str) -> Optional[dict]:
        db = self.get_db()
        group = await db.groups.find_one({"joinCode": join_code})
        if not group:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group with this join code not found")

        # Check if user is already a member
        user_object_id = ObjectId(user_id)
        if any(member["userId"] == user_object_id for member in group.get("members", [])):
            # User is already a member, return the group details
            # Or raise an error if preferred:
            # raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already a member of this group")
            return self._transform_group_document(group)

        new_member = Member(userId=user_id, role="member", joinedAt=datetime.now(timezone.utc))

        updated_group = await db.groups.find_one_and_update(
            {"_id": group["_id"]},
            {"$addToSet": {"members": new_member.model_dump(by_alias=True)}, "$set": {"updatedAt": datetime.now(timezone.utc)}},
            return_document=True
        )
        return self._transform_group_document(updated_group)

    async def leave_group(self, group_id: str, user_id: str) -> bool:
        db = self.get_db()
        user_object_id = ObjectId(user_id)

        group = await db.groups.find_one({"_id": ObjectId(group_id), "members.userId": user_object_id})
        if not group:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or user is not a member")

        # TODO: Implement check for unsettled balances before leaving (as per docs)
        # This would involve calling Expense Service. For now, we allow leaving.
        # if await self.has_unsettled_balances(group_id, user_id):
        #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have unsettled balances in this group.")

        # Prevent admin from leaving if they are the only admin
        admins = [m for m in group.get("members", []) if m["role"] == "admin"]
        if len(admins) == 1 and admins[0]["userId"] == user_object_id:
            # If there are other members, promote one or prevent leaving
            # For now, prevent leaving if user is the sole admin and other members exist
            if len(group.get("members", [])) > 1:
                 raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are the only admin. Please assign another admin before leaving or delete the group.")
            # If only member, group will be auto-deleted or handled differently by delete logic

        result = await db.groups.update_one(
            {"_id": ObjectId(group_id)},
            {"$pull": {"members": {"userId": user_object_id}}, "$set": {"updatedAt": datetime.now(timezone.utc)}}
        )

        # Optional: If group becomes empty after leaving, consider deleting it
        # updated_group_doc = await db.groups.find_one({"_id": ObjectId(group_id)})
        # if updated_group_doc and not updated_group_doc.get("members"):
        #     await db.groups.delete_one({"_id": ObjectId(group_id)})
        #     return True # User successfully left, and group was auto-deleted

        return result.modified_count == 1

    async def list_group_members(self, group_id: str, requesting_user_id: str) -> List[dict]:
        db = self.get_db()
        group = await db.groups.find_one({
            "_id": ObjectId(group_id),
            "members.userId": ObjectId(requesting_user_id) # Ensure requester is a member
        })
        if not group:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or you are not a member")

        # We need to enrich member data with user names and image URLs
        # This requires fetching user details from the users collection
        member_details_list = []
        if "members" in group and group["members"]:
            user_ids = [member["userId"] for member in group["members"]]
            users_cursor = db.users.find({"_id": {"$in": user_ids}})
            users_map = {str(user["_id"]): user async for user in users_cursor}

            for member_data in group["members"]:
                user_info = users_map.get(str(member_data["userId"]))
                # Ensure userId is string for Pydantic model
                member_data_for_model = member_data.copy()
                member_data_for_model["userId"] = str(member_data_for_model["userId"])

                member_dict = Member(**member_data_for_model).model_dump() # Uses Pydantic model for structure
                if user_info:
                    member_dict["userName"] = user_info.get("name")
                    member_dict["userImageUrl"] = user_info.get("avatar") # Assuming 'avatar' field in user schema
                member_details_list.append(member_dict)

        return member_details_list

    async def update_member_role(self, group_id: str, member_to_update_id: str, new_role: str, admin_user_id: str) -> bool:
        db = self.get_db()
        admin_object_id = ObjectId(admin_user_id)
        member_to_update_object_id = ObjectId(member_to_update_id)

        if new_role not in ["admin", "member"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role specified.")

        # Check if the requesting user is an admin of the group
        group = await db.groups.find_one({
            "_id": ObjectId(group_id),
            "members": {"$elemMatch": {"userId": admin_object_id, "role": "admin"}}
        })
        if not group:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not an admin or group not found.")

        # Ensure the member to update is actually in the group
        member_exists = any(str(m["userId"]) == member_to_update_id for m in group.get("members", []))
        if not member_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member to update not found in this group.")

        # Prevent admin from demoting themselves if they are the only admin
        if admin_object_id == member_to_update_object_id and new_role == "member":
            admins = [m for m in group.get("members", []) if m["role"] == "admin"]
            if len(admins) == 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot demote the only admin of the group.")

        result = await db.groups.update_one(
            {"_id": ObjectId(group_id), "members.userId": member_to_update_object_id},
            {"$set": {"members.$.role": new_role, "updatedAt": datetime.now(timezone.utc)}}
        )
        return result.modified_count == 1

    async def remove_member_from_group(self, group_id: str, member_to_remove_id: str, admin_user_id: str) -> bool:
        db = self.get_db()
        admin_object_id = ObjectId(admin_user_id)
        member_to_remove_object_id = ObjectId(member_to_remove_id)

        # Check if the requesting user is an admin of the group
        group = await db.groups.find_one({
            "_id": ObjectId(group_id),
            "members": {"$elemMatch": {"userId": admin_object_id, "role": "admin"}}
        })
        if not group:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not an admin or group not found.")

        # Ensure the member to remove is actually in the group
        member_to_remove_data = next((m for m in group.get("members", []) if m["userId"] == member_to_remove_object_id), None)
        if not member_to_remove_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member to remove not found in this group.")

        # Admin cannot remove themselves using this endpoint; they should use "leave group"
        if admin_object_id == member_to_remove_object_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admins cannot remove themselves. Use 'leave group' endpoint.")

        # TODO: Check for unsettled balances for the member being removed (as per docs)
        # if await self.has_unsettled_balances(group_id, member_to_remove_id):
        #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Member has unsettled balances.")

        result = await db.groups.update_one(
            {"_id": ObjectId(group_id)},
            {"$pull": {"members": {"userId": member_to_remove_object_id}}, "$set": {"updatedAt": datetime.now(timezone.utc)}}
        )
        return result.modified_count == 1

group_service = GroupService()
