"use server";

import { prisma } from "@/lib/prisma";
import { LoginData, RegisterData, User } from "@/lib/types";
import { hashPassword, verifyPassword } from "@/lib/utils/password";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

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
