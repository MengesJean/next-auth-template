"use client";

import {
  getUser,
  updatePassword,
  updateProfile,
  uploadImage,
} from "@/lib/actions";
import { User } from "@/lib/types";
import {
  updatePasswordSchema,
  updateProfileSchema,
} from "@/lib/validations/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { ZodError } from "zod";

const EditProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUser();
      if (!userData) {
        router.push("/login");
        return;
      }
      setUser(userData);
      setImagePreview(userData.image);
    };
    loadUser();
  }, [router]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setProfileError("Image size should be less than 5MB");
        e.target.value = "";
        return;
      }

      if (!file.type.startsWith("image/")) {
        setProfileError("Please upload an image file");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(user?.image || null);
    }
  };

  const handleProfileSubmit = async (formData: FormData) => {
    try {
      setProfileError("");
      setProfileSuccess(false);

      if (!user) {
        throw new Error("User not found");
      }

      const name = formData.get("name") as string;
      const imageFile = formData.get("image") as File;

      let imageUrl = user.image;
      if (imageFile && imageFile.size > 0) {
        try {
          imageUrl = await uploadImage(imageFile, user.id);
        } catch (error) {
          throw new Error(
            error instanceof Error ? error.message : "Failed to upload image"
          );
        }
      }

      const validatedData = updateProfileSchema.parse({
        name,
        image: imageUrl,
      });

      await updateProfile(validatedData);
      setProfileSuccess(true);
      router.refresh();
      router.push("/profile");
    } catch (error) {
      if (error instanceof ZodError) {
        setProfileError(error.errors[0].message);
        return;
      }
      setProfileError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  const handlePasswordSubmit = async (formData: FormData) => {
    try {
      setPasswordError("");
      setPasswordSuccess(false);

      const data = {
        currentPassword: formData.get("currentPassword") as string,
        newPassword: formData.get("newPassword") as string,
        confirmPassword: formData.get("confirmPassword") as string,
      };

      const validatedData = updatePasswordSchema.parse(data);
      await updatePassword(validatedData);
      setPasswordSuccess(true);

      // Reset form
      const form = document.getElementById("password-form") as HTMLFormElement;
      form?.reset();
    } catch (error) {
      if (error instanceof ZodError) {
        setPasswordError(error.errors[0].message);
        return;
      }
      setPasswordError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Profile Form */}
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h2>
          <form action={handleProfileSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={user.name || ""}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Profile Picture
              </label>
              {imagePreview && (
                <div className="mb-4">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF
              </p>
            </div>

            {profileError && (
              <p className="text-red-500 text-sm">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-green-500 text-sm">
                Profile updated successfully!
              </p>
            )}
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Change Password
          </h2>
          <form
            id="password-form"
            action={handlePasswordSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-green-500 text-sm">
                Password updated successfully!
              </p>
            )}
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
