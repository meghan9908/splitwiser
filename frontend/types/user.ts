export interface UserProfile {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  avatar?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdate {
  name?: string;
  imageUrl?: string;
  currency?: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message?: string;
}
