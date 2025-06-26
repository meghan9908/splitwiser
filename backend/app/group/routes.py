from fastapi import APIRouter, Depends, HTTPException, status, Path, Body
from typing import List, Dict, Any

from app.group.schemas import (
    GroupCreateRequest, GroupCreateResponse, GroupResponse, GroupListResponse,
    GroupUpdateRequest, GroupJoinRequest, GroupJoinResponse,
    GroupMemberResponse, MemberUpdateRequest, SuccessResponse
)
from app.group.service import group_service
from app.dependencies import get_current_user # Assuming this dependency handles auth and returns user dict

router = APIRouter(prefix="/groups", tags=["Groups"])

@router.post("", response_model=GroupCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_new_group(
    group_data: GroupCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a new group. The creator automatically becomes an admin member.
    """
    user_id = current_user["_id"]
    created_group = await group_service.create_group(group_data, user_id)
    if not created_group:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create group")
    # The service method should return data that fits GroupCreateResponse, including the _id
    # Ensure the 'id' field is populated correctly if Pydantic uses alias '_id'
    return GroupCreateResponse(**created_group)


@router.get("", response_model=List[GroupListResponse])
async def list_user_groups(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    List all groups the current user belongs to.
    """
    user_id = current_user["_id"]
    groups = await group_service.get_groups_for_user(user_id)
    return groups # Assumes service returns list of dicts matching GroupListResponse structure


@router.get("/{group_id}", response_model=GroupResponse)
async def get_group_details(
    group_id: str = Path(..., description="The ID of the group to retrieve"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get detailed information for a specific group, including its members.
    User must be a member of the group.
    """
    user_id = current_user["_id"]
    group = await group_service.get_group_by_id(group_id, user_id)
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or user not a member")
    return GroupResponse(**group)


@router.patch("/{group_id}", response_model=GroupResponse)
async def update_group_info(
    group_id: str = Path(..., description="The ID of the group to update"),
    group_updates: GroupUpdateRequest = Body(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update a group's metadata (name, currency, image_url).
    Only group admins can perform this action.
    """
    user_id = current_user["_id"]
    try:
        updated_group = await group_service.update_group_metadata(group_id, group_updates, user_id)
        if not updated_group: # Should not happen if service raises exceptions correctly
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or update failed")
        return GroupResponse(**updated_group)
    except HTTPException as e:
        raise e # Re-raise specific HTTPExceptions from service
    except Exception as e:
        # Generic server error if something unexpected happens
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{group_id}", response_model=SuccessResponse)
async def delete_existing_group(
    group_id: str = Path(..., description="The ID of the group to delete"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Delete a group. Only group admins can perform this action.
    (Future: Add check for unsettled expenses)
    """
    user_id = current_user["_id"]
    try:
        deleted = await group_service.delete_group(group_id, user_id)
        if not deleted: # Service should raise HTTPException if not found or not admin
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or deletion failed")
        return SuccessResponse(message="Group deleted successfully")
    except HTTPException as e:
        raise e


@router.post("/join", response_model=GroupJoinResponse)
async def join_group_with_code(
    join_request: GroupJoinRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Join an existing group using a joinCode.
    """
    user_id = current_user["_id"]
    try:
        group = await group_service.join_group_by_code(join_request.joinCode, user_id)
        if not group: # Should be handled by exceptions in service
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Failed to join group")
        return GroupJoinResponse(**group)
    except HTTPException as e:
        raise e


@router.post("/{group_id}/leave", response_model=SuccessResponse)
async def leave_current_group(
    group_id: str = Path(..., description="The ID of the group to leave"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Leave a group.
    (Future: Add check for unsettled balances. Prevent sole admin from leaving if other members exist.)
    """
    user_id = current_user["_id"]
    try:
        left = await group_service.leave_group(group_id, user_id)
        if not left: # Service should raise specific exceptions
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to leave group")
        return SuccessResponse(message="Successfully left the group")
    except HTTPException as e:
        raise e

@router.get("/{group_id}/members", response_model=List[GroupMemberResponse])
async def list_group_members_api(
    group_id: str = Path(..., description="The ID of the group whose members to list"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    List all members of a specific group. User must be a member of the group.
    """
    user_id = current_user["_id"] # Requesting user's ID
    try:
        members = await group_service.list_group_members(group_id, user_id)
        return members # Service returns a list of dicts/models matching GroupMemberResponse
    except HTTPException as e:
        raise e


@router.patch("/{group_id}/members/{member_id}", response_model=SuccessResponse)
async def update_group_member_role(
    group_id: str = Path(..., description="The ID of the group"),
    member_id: str = Path(..., description="The ID of the member whose role is to be updated"),
    role_update: MemberUpdateRequest = Body(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Change a member's role within a group (e.g., from member to admin).
    Only group admins can perform this action.
    An admin cannot demote themselves if they are the only admin.
    """
    admin_user_id = current_user["_id"]
    try:
        updated = await group_service.update_member_role(group_id, member_id, role_update.role, admin_user_id)
        if not updated:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update member role")
        return SuccessResponse(message=f"Member {member_id} role updated to {role_update.role}")
    except HTTPException as e:
        raise e


@router.delete("/{group_id}/members/{member_id}", response_model=SuccessResponse)
async def remove_member_from_group_api(
    group_id: str = Path(..., description="The ID of the group"),
    member_id: str = Path(..., description="The ID of the member to remove"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Remove a member from a group. Only group admins can perform this action.
    Admins cannot remove themselves using this endpoint (use /leave instead).
    (Future: Add check for unsettled balances for the member being removed.)
    """
    admin_user_id = current_user["_id"]
    try:
        removed = await group_service.remove_member_from_group(group_id, member_id, admin_user_id)
        if not removed:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to remove member")
        return SuccessResponse(message=f"Member {member_id} removed from group {group_id}")
    except HTTPException as e:
        raise e
