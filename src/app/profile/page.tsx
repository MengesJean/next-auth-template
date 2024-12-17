import { getUser } from "@/lib/actions";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header/Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />

          {/* Profile Content */}
          <div className="relative px-4 sm:px-6 lg:px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-8 flex justify-between items-end">
              <div className="flex items-end">
                <div className="relative h-32 w-32 rounded-full ring-4 ring-white overflow-hidden bg-white">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Profile picture"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                      <span className="text-4xl text-gray-500">
                        {user.name?.[0]?.toUpperCase() ||
                          user.email[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-6 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name || "No name set"}
                  </h1>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <Link
                href="/profile/edit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Edit Profile
              </Link>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 gap-6 max-w-2xl">
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Profile Information
                </h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.name || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Member since
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date().toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Link
                    href="/profile/edit"
                    className="block w-full text-left px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Update Profile Information
                  </Link>
                  <Link
                    href="/profile/edit#password"
                    className="block w-full text-left px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Change Password
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
