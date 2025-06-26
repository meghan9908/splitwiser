from pydantic import BaseModel, Field, constr
from typing import Optional, List
from datetime import datetime

# Represents a member within a group
class Member(BaseModel):
    userId: str = Field(..., description="User ID of the member")
    role: str = Field(default="member", description="Role of the member in the group (admin or member)")
    joinedAt: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when the member joined")

# Schema for creating a new group
class GroupCreateRequest(BaseModel):
    name: constr(min_length=1, max_length=100) = Field(..., description="Name of the group")
    currency: str = Field(default="USD", description="Default currency for the group")
    imageUrl: Optional[str] = Field(default=None, description="URL for the group's image")

# Schema for the response when a group is created
class GroupCreateResponse(BaseModel):
    id: str = Field(..., alias="_id", description="Unique ID of the group")
    name: str
    currency: str
    imageUrl: Optional[str] = None
    joinCode: str = Field(..., description="Short code to join the group")
    createdBy: str = Field(..., description="User ID of the creator")
    createdAt: datetime
    members: List[Member] # Creator is added as the first admin member

    model_config = {"populate_by_name": True}


# Schema for updating group metadata
class GroupUpdateRequest(BaseModel):
    name: Optional[constr(min_length=1, max_length=100)] = Field(default=None, description="New name of the group")
    currency: Optional[str] = Field(default=None, description="New default currency for the group")
    imageUrl: Optional[str] = Field(default=None, description="New URL for the group's image")

# Schema for the detailed group response (including members)
class GroupResponse(BaseModel):
    id: str = Field(..., alias="_id", description="Unique ID of the group")
    name: str
    currency: str
    imageUrl: Optional[str] = None
    joinCode: str = Field(..., description="Short code to join the group")
    createdBy: str = Field(..., description="User ID of the creator")
    members: List[Member]
    createdAt: datetime
    updatedAt: datetime

    model_config = {"populate_by_name": True}

# Schema for listing groups (summary view)
class GroupListResponse(BaseModel):
    id: str = Field(..., alias="_id", description="Unique ID of the group")
    name: str
    currency: str
    imageUrl: Optional[str] = None
    member_count: int = Field(..., description="Number of members in the group")
    # Potentially add a field for user's role in this group if listing groups for a specific user

    model_config = {"populate_by_name": True}


# Schema for joining a group using a join code
class GroupJoinRequest(BaseModel):
    joinCode: str = Field(..., description="The join code for the group")

# Schema for the response after successfully joining a group
class GroupJoinResponse(GroupResponse): # Inherits all fields from GroupResponse
    pass

# Schema for listing members of a group
class GroupMemberResponse(Member):
    # We might want to add more user details here like name, image by looking up the user_id
    userName: Optional[str] = Field(default=None, description="Name of the member (denormalized)")
    userImageUrl: Optional[str] = Field(default=None, description="Image URL of the member (denormalized)")


# Schema for updating a member's role
class MemberUpdateRequest(BaseModel):
    role: str = Field(..., description="New role for the member (admin or member)")

# Schema for generic success response
class SuccessResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
