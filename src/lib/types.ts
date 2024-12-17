export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateProfileData {
  name?: string;
  image?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
}
