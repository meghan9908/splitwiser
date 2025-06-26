import pytest
import pytest_asyncio
from unittest.mock import patch, AsyncMock, MagicMock
from bson import ObjectId
from datetime import datetime, timezone, timedelta # Added timedelta

from app.group.service import GroupService, group_service
from app.group.schemas import GroupCreateRequest, GroupUpdateRequest, Member
from app.database import get_database # For patching target
from mongomock_motor import AsyncMongoMockClient # For typing, if needed

# To use mongomock for service tests, we'd typically patch get_database
# at the point where the service module imports it.
# Example: @patch('app.group.service.get_database', new_callable=AsyncMongoMockClient)

@pytest_asyncio.fixture
async def mock_db_client():
    # This fixture provides a fresh mock client for each test function if needed,
    # but often we mock the get_database() call directly in tests or fixtures.
    return AsyncMongoMockClient()

@pytest_asyncio.fixture
async def mock_db_instance(mock_db_client):
    # This provides a mock database instance from the client.
    return mock_db_client["test_db_groups_service"]

@pytest.fixture
def service_instance():
    return GroupService()

@pytest.mark.asyncio
async def test_create_group(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        user_id = str(ObjectId())
        group_data = GroupCreateRequest(name="Test Group", currency="USD")

        # Mock generate_unique_join_code to return a fixed code
        with patch.object(service_instance, 'generate_unique_join_code', AsyncMock(return_value="UNIQUE")) as mock_join_code:
            created_group = await service_instance.create_group(group_data, user_id)

            assert created_group is not None
            assert created_group["name"] == "Test Group"
            assert created_group["currency"] == "USD"
            assert created_group["joinCode"] == "UNIQUE"
            assert created_group["createdBy"] == user_id
            assert len(created_group["members"]) == 1
            assert created_group["members"][0]["userId"] == user_id
            assert created_group["members"][0]["role"] == "admin"
            mock_join_code.assert_called_once()

            # Verify database call
            db_group = await mock_db_instance.groups.find_one({"name": "Test Group"})
            assert db_group is not None
            assert db_group["joinCode"] == "UNIQUE"

@pytest.mark.asyncio
async def test_generate_unique_join_code(service_instance: GroupService, mock_db_instance):
     with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        # Mock _is_join_code_unique to control its behavior
        # First call returns False (code exists), second returns True (code is unique)
        with patch.object(service_instance, '_is_join_code_unique', AsyncMock(side_effect=[False, True])) as mock_is_unique:
            # Mock _generate_join_code to return predictable codes
            with patch.object(service_instance, '_generate_join_code', MagicMock(side_effect=["CODE1", "CODE2"])) as mock_generate:
                join_code = await service_instance.generate_unique_join_code()
                assert join_code == "CODE2"
                assert mock_generate.call_count == 2
                assert mock_is_unique.call_count == 2
                mock_is_unique.assert_any_call("CODE1")
                mock_is_unique.assert_any_call("CODE2")

@pytest.mark.asyncio
async def test_get_group_by_id_member_exists(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        user_id_obj = ObjectId()
        user_id_str = str(user_id_obj)
        group_id_obj = ObjectId()
        group_id_str = str(group_id_obj)

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj,
            "name": "Test Group",
            "currency": "USD",
            "createdBy": ObjectId(),
            "joinCode": "XYZ123",
            "members": [{"userId": user_id_obj, "role": "member", "joinedAt": datetime.now(timezone.utc)}],
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        })

        group = await service_instance.get_group_by_id(group_id_str, user_id_str)
        assert group is not None
        assert group["_id"] == group_id_str
        assert group["name"] == "Test Group"

@pytest.mark.asyncio
async def test_get_group_by_id_user_not_member(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        user_id_str = str(ObjectId()) # This user is NOT in the group members list
        other_user_id_obj = ObjectId()
        group_id_obj = ObjectId()
        group_id_str = str(group_id_obj)

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj,
            "name": "Test Group",
            "members": [{"userId": other_user_id_obj, "role": "member", "joinedAt": datetime.now(timezone.utc)}],
            "createdBy": ObjectId(), "joinCode": "XYZ123", "createdAt": datetime.now(timezone.utc), "updatedAt": datetime.now(timezone.utc)
        })

        group = await service_instance.get_group_by_id(group_id_str, user_id_str)
        assert group is None # User is not a member, so should not retrieve group

@pytest.mark.asyncio
async def test_get_groups_for_user(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        user_id_obj = ObjectId()
        user_id_str = str(user_id_obj)

        group1_id = ObjectId()
        group2_id = ObjectId()
        other_group_id = ObjectId() # User is not part of this group

        await mock_db_instance.groups.insert_many([
            {"_id": group1_id, "name": "Group 1", "members": [{"userId": user_id_obj, "role": "admin"}], "createdBy": user_id_obj, "currency": "USD", "joinCode": "G1"},
            {"_id": group2_id, "name": "Group 2", "members": [{"userId": user_id_obj, "role": "member"}], "createdBy": ObjectId(), "currency": "EUR", "joinCode": "G2"},
            {"_id": other_group_id, "name": "Group 3", "members": [{"userId": ObjectId(), "role": "member"}], "createdBy": ObjectId(), "currency": "GBP", "joinCode": "G3"},
        ])

        groups = await service_instance.get_groups_for_user(user_id_str)
        assert len(groups) == 2
        group_names = {g["name"] for g in groups}
        assert "Group 1" in group_names
        assert "Group 2" in group_names
        # Check member_count (added in service logic)
        for g in groups:
            assert "member_count" in g
            if g["_id"] == str(group1_id):
                assert g["member_count"] == 1


@pytest.mark.asyncio
async def test_update_group_metadata_admin_success(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        admin_user_id_obj = ObjectId()
        admin_user_id_str = str(admin_user_id_obj)
        group_id_obj = ObjectId()
        group_id_str = str(group_id_obj)

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj,
            "name": "Original Name",
            "currency": "USD",
            "createdBy": admin_user_id_obj,
            "members": [{"userId": admin_user_id_obj, "role": "admin", "joinedAt": datetime.now(timezone.utc)}],
            "createdAt": datetime.now(timezone.utc) - timedelta(seconds=1), # Ensure createdAt is in the past
            "updatedAt": datetime.now(timezone.utc) - timedelta(seconds=1) # Ensure updatedAt is also in the past initially
        })

        updates = GroupUpdateRequest(name="Updated Name", currency="EUR")
        updated_group = await service_instance.update_group_metadata(group_id_str, updates, admin_user_id_str)

        assert updated_group is not None
        assert updated_group["name"] == "Updated Name"
        assert updated_group["currency"] == "EUR"
        assert updated_group["_id"] == group_id_str
        assert updated_group["updatedAt"] > updated_group["createdAt"]

        db_group = await mock_db_instance.groups.find_one({"_id": group_id_obj})
        assert db_group["name"] == "Updated Name"

@pytest.mark.asyncio
async def test_update_group_metadata_not_admin_fails(service_instance: GroupService, mock_db_instance):
    from fastapi import HTTPException
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        member_user_id_obj = ObjectId()
        member_user_id_str = str(member_user_id_obj)
        group_id_obj = ObjectId()
        group_id_str = str(group_id_obj)

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Original Name", "currency": "USD",
            "members": [{"userId": member_user_id_obj, "role": "member"}] # User is only a member
        })

        updates = GroupUpdateRequest(name="Updated Name")
        with pytest.raises(HTTPException) as exc_info:
            await service_instance.update_group_metadata(group_id_str, updates, member_user_id_str)
        assert exc_info.value.status_code == 403

@pytest.mark.asyncio
async def test_delete_group_admin_success(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        admin_user_id_obj = ObjectId()
        admin_user_id_str = str(admin_user_id_obj)
        group_id_obj = ObjectId()
        group_id_str = str(group_id_obj)

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Group to Delete",
            "members": [{"userId": admin_user_id_obj, "role": "admin"}]
        })

        deleted = await service_instance.delete_group(group_id_str, admin_user_id_str)
        assert deleted is True
        assert await mock_db_instance.groups.count_documents({"_id": group_id_obj}) == 0

@pytest.mark.asyncio
async def test_delete_group_not_admin_fails(service_instance: GroupService, mock_db_instance):
    from fastapi import HTTPException
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        member_user_id_str = str(ObjectId())
        group_id_obj = ObjectId()
        group_id_str = str(group_id_obj)

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Group",
            "members": [{"userId": ObjectId(member_user_id_str), "role": "member"}]
        })

        with pytest.raises(HTTPException) as exc_info:
            await service_instance.delete_group(group_id_str, member_user_id_str)
        assert exc_info.value.status_code == 403
        assert await mock_db_instance.groups.count_documents({"_id": group_id_obj}) == 1


@pytest.mark.asyncio
async def test_join_group_by_code_success(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        user_id_obj = ObjectId()
        user_id_str = str(user_id_obj)
        group_id_obj = ObjectId()

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Joinable Group", "joinCode": "JOINME1",
            "members": [{"userId": ObjectId(), "role": "admin"}] # Original member
        })

        joined_group = await service_instance.join_group_by_code("JOINME1", user_id_str)
        assert joined_group is not None
        assert any(m["userId"] == user_id_str and m["role"] == "member" for m in joined_group["members"])

        db_group = await mock_db_instance.groups.find_one({"_id": group_id_obj})
        assert len(db_group["members"]) == 2


@pytest.mark.asyncio
async def test_join_group_by_code_already_member(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        user_id_obj = ObjectId()
        user_id_str = str(user_id_obj)
        group_id_obj = ObjectId()

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Group", "joinCode": "JOINME2",
            "members": [{"userId": user_id_obj, "role": "member"}] # User already a member
        })

        # Depending on implementation, this might raise an error or just return the group
        # Current service implementation returns the group.
        group = await service_instance.join_group_by_code("JOINME2", user_id_str)
        assert group is not None
        db_group = await mock_db_instance.groups.find_one({"_id": group_id_obj})
        assert len(db_group["members"]) == 1 # No new member added

@pytest.mark.asyncio
async def test_join_group_by_code_not_found(service_instance: GroupService, mock_db_instance):
    from fastapi import HTTPException
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        user_id_str = str(ObjectId())
        with pytest.raises(HTTPException) as exc_info:
            await service_instance.join_group_by_code("NONEXISTENTCODE", user_id_str)
        assert exc_info.value.status_code == 404

@pytest.mark.asyncio
async def test_leave_group_success(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        user_id_obj = ObjectId()
        user_id_str = str(user_id_obj)
        group_id_obj = ObjectId()

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Group to Leave",
            "members": [
                {"userId": user_id_obj, "role": "member"},
                {"userId": ObjectId(), "role": "admin"} # Another admin exists
            ]
        })

        left = await service_instance.leave_group(str(group_id_obj), user_id_str)
        assert left is True
        db_group = await mock_db_instance.groups.find_one({"_id": group_id_obj})
        assert not any(m["userId"] == user_id_obj for m in db_group["members"])
        assert len(db_group["members"]) == 1

@pytest.mark.asyncio
async def test_leave_group_sole_admin_with_other_members_fails(service_instance: GroupService, mock_db_instance):
    from fastapi import HTTPException
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        admin_user_id_obj = ObjectId()
        admin_user_id_str = str(admin_user_id_obj)
        group_id_obj = ObjectId()

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Test Group",
            "members": [
                {"userId": admin_user_id_obj, "role": "admin"},
                {"userId": ObjectId(), "role": "member"} # Another member exists
            ]
        })

        with pytest.raises(HTTPException) as exc_info:
            await service_instance.leave_group(str(group_id_obj), admin_user_id_str)
        assert exc_info.value.status_code == 400
        assert "You are the only admin" in exc_info.value.detail

@pytest.mark.asyncio
async def test_leave_group_sole_admin_no_other_members_success(service_instance: GroupService, mock_db_instance):
    # If the sole admin is the only member, they should be able to leave.
    # The group might then be empty and could be auto-deleted (current service doesn't auto-delete yet).
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        admin_user_id_obj = ObjectId()
        admin_user_id_str = str(admin_user_id_obj)
        group_id_obj = ObjectId()

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Emptying Group",
            "members": [{"userId": admin_user_id_obj, "role": "admin"}]
        })

        left = await service_instance.leave_group(str(group_id_obj), admin_user_id_str)
        assert left is True
        db_group = await mock_db_instance.groups.find_one({"_id": group_id_obj})
        assert not db_group["members"] # Members list should be empty

@pytest.mark.asyncio
async def test_list_group_members_success(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        requesting_user_id_obj = ObjectId()
        requesting_user_id_str = str(requesting_user_id_obj)
        member1_id_obj = ObjectId()
        member2_id_obj = ObjectId()
        group_id_obj = ObjectId()
        group_id_str = str(group_id_obj)

        await mock_db_instance.users.insert_many([
            {"_id": requesting_user_id_obj, "name": "Requesting User", "avatar": "req_avatar.png"},
            {"_id": member1_id_obj, "name": "Member One", "avatar": "m1_avatar.png"},
            {"_id": member2_id_obj, "name": "Member Two", "avatar": "m2_avatar.png"},
        ])

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Member List Group",
            "members": [
                {"userId": requesting_user_id_obj, "role": "admin"},
                {"userId": member1_id_obj, "role": "member"},
                {"userId": member2_id_obj, "role": "member"},
            ]
        })

        members_list = await service_instance.list_group_members(group_id_str, requesting_user_id_str)
        assert len(members_list) == 3

        member_names = {m["userName"] for m in members_list}
        assert "Requesting User" in member_names
        assert "Member One" in member_names
        assert "Member Two" in member_names

        for m in members_list:
            assert "userImageUrl" in m
            if m["userId"] == str(requesting_user_id_obj):
                assert m["userImageUrl"] == "req_avatar.png"


@pytest.mark.asyncio
async def test_update_member_role_success(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        admin_user_id_obj = ObjectId()
        admin_user_id_str = str(admin_user_id_obj)
        member_to_update_id_obj = ObjectId()
        member_to_update_id_str = str(member_to_update_id_obj)
        group_id_obj = ObjectId()
        group_id_str = str(group_id_obj)

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Role Update Group",
            "members": [
                {"userId": admin_user_id_obj, "role": "admin"},
                {"userId": member_to_update_id_obj, "role": "member"},
            ]
        })

        updated = await service_instance.update_member_role(group_id_str, member_to_update_id_str, "admin", admin_user_id_str)
        assert updated is True

        db_group = await mock_db_instance.groups.find_one({"_id": group_id_obj})
        updated_member = next(m for m in db_group["members"] if m["userId"] == member_to_update_id_obj)
        assert updated_member["role"] == "admin"

@pytest.mark.asyncio
async def test_update_member_role_demote_self_not_sole_admin(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        admin1_id_obj = ObjectId()
        admin1_id_str = str(admin1_id_obj)
        admin2_id_obj = ObjectId() # Another admin
        group_id_obj = ObjectId()
        group_id_str = str(group_id_obj)

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Demotion Group",
            "members": [
                {"userId": admin1_id_obj, "role": "admin"},
                {"userId": admin2_id_obj, "role": "admin"},
            ]
        })
        # Admin1 demotes themselves
        updated = await service_instance.update_member_role(group_id_str, admin1_id_str, "member", admin1_id_str)
        assert updated is True
        db_group = await mock_db_instance.groups.find_one({"_id": group_id_obj})
        demoted_member = next(m for m in db_group["members"] if m["userId"] == admin1_id_obj)
        assert demoted_member["role"] == "member"

@pytest.mark.asyncio
async def test_update_member_role_demote_self_sole_admin_fails(service_instance: GroupService, mock_db_instance):
    from fastapi import HTTPException
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        admin_user_id_obj = ObjectId()
        admin_user_id_str = str(admin_user_id_obj)
        group_id_obj = ObjectId()
        group_id_str = str(group_id_obj)

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Sole Admin Group",
            "members": [{"userId": admin_user_id_obj, "role": "admin"}]
        })

        with pytest.raises(HTTPException) as exc_info:
            await service_instance.update_member_role(group_id_str, admin_user_id_str, "member", admin_user_id_str)
        assert exc_info.value.status_code == 400
        assert "Cannot demote the only admin" in exc_info.value.detail


@pytest.mark.asyncio
async def test_remove_member_from_group_success(service_instance: GroupService, mock_db_instance):
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        admin_user_id_obj = ObjectId()
        admin_user_id_str = str(admin_user_id_obj)
        member_to_remove_id_obj = ObjectId()
        member_to_remove_id_str = str(member_to_remove_id_obj)
        group_id_obj = ObjectId()
        group_id_str = str(group_id_obj)

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Remove Member Group",
            "members": [
                {"userId": admin_user_id_obj, "role": "admin"},
                {"userId": member_to_remove_id_obj, "role": "member"},
            ]
        })

        removed = await service_instance.remove_member_from_group(group_id_str, member_to_remove_id_str, admin_user_id_str)
        assert removed is True

        db_group = await mock_db_instance.groups.find_one({"_id": group_id_obj})
        assert not any(m["userId"] == member_to_remove_id_obj for m in db_group["members"])
        assert len(db_group["members"]) == 1


@pytest.mark.asyncio
async def test_remove_member_from_group_admin_tries_to_remove_self_fails(service_instance: GroupService, mock_db_instance):
    from fastapi import HTTPException
    with patch('app.group.service.get_database', return_value=mock_db_instance) as mock_get_db:
        admin_user_id_obj = ObjectId()
        admin_user_id_str = str(admin_user_id_obj)
        group_id_obj = ObjectId()
        group_id_str = str(group_id_obj)

        await mock_db_instance.groups.insert_one({
            "_id": group_id_obj, "name": "Admin Self-Remove Group",
            "members": [{"userId": admin_user_id_obj, "role": "admin"}]
        })

        with pytest.raises(HTTPException) as exc_info:
            await service_instance.remove_member_from_group(group_id_str, admin_user_id_str, admin_user_id_str)
        assert exc_info.value.status_code == 400
        assert "Admins cannot remove themselves" in exc_info.value.detail

        db_group = await mock_db_instance.groups.find_one({"_id": group_id_obj})
        assert len(db_group["members"]) == 1 # Admin should still be there
