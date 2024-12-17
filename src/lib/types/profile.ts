export interface UpdateProfileData {
  name?: string;
  image?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
