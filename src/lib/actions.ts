"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { prisma } from "./prisma";
import {
  AuthResponse,
  LoginData,
  RegisterData,
  UpdatePasswordData,
  UpdateProfileData,
  User,
} from "./types";
import {
  hashPassword,
  PasswordError,
  validateAndVerifyPassword,
  verifyPassword,
} from "./utils/password";
import { saveImageToLocal } from "./utils/upload";
import {
  loginSchema,
  registerSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from "./validations/auth";

export const login = async (data: LoginData): Promise<User> => {
  try {
    const { email, password } = loginSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };

    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(Date.now() + thirtyDays);

    const cookieStore = await cookies();
    cookieStore.set("user", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: expirationDate,
    });

    return userData;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<User> => {
  try {
    const { email, password, name } = registerSchema.parse(data);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        image: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete("user");
  redirect("/login");
};

export const getUser = async (): Promise<User | null> => {
  const userCookie = (await cookies()).get("user");

  if (!userCookie?.value) {
    return null;
  }

  try {
    const userData = JSON.parse(userCookie.value);
    if (!userData || typeof userData !== "object") {
      return null;
    }
    return userData as User;
  } catch {
    return null;
  }
};

export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  try {
    const validatedData = updateProfileSchema.parse(data);

    const user = await getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: validatedData.name === "" ? null : validatedData.name,
        image: validatedData.image === "" ? null : validatedData.image,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    const userData: User = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      image: updatedUser.image,
    };

    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(Date.now() + thirtyDays);

    const cookieStore = await cookies();
    cookieStore.set("user", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: expirationDate,
    });

    return userData;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
};

export const updatePassword = async (
  data: UpdatePasswordData
): Promise<AuthResponse> => {
  try {
    const validatedData = updatePasswordSchema.parse(data);

    const user = await getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      throw new Error("User not found");
    }

    try {
      await validateAndVerifyPassword(
        validatedData.currentPassword,
        dbUser.password,
        validatedData.newPassword,
        validatedData.confirmPassword
      );
      const hashedPassword = await hashPassword(validatedData.newPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof PasswordError) {
        throw error;
      }
      throw new Error("Failed to update password");
    }
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
};

export const uploadImage = async (
  file: File,
  userId: string
): Promise<string> => {
  if (!file) {
    throw new Error("No file provided");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB");
  }

  return await saveImageToLocal(file, userId);
};
