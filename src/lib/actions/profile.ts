"use server";

import { prisma } from "@/lib/prisma";
import {
  AuthResponse,
  UpdatePasswordData,
  UpdateProfileData,
  User,
} from "@/lib/types";
import {
  hashPassword,
  PasswordError,
  validateAndVerifyPassword,
} from "@/lib/utils/password";
import { saveImageToLocal } from "@/lib/utils/upload";
import {
  updatePasswordSchema,
  updateProfileSchema,
} from "@/lib/validations/auth";
import { cookies } from "next/headers";
import { ZodError } from "zod";
import { getUser } from "./auth";

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
