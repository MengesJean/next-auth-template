import { getUser } from "@/lib/actions";
import Link from "next/link";

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to Auth Next.js
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            A complete authentication system built with Next.js 14, Server
            Actions, and Prisma.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {user ? (
              <Link
                href="/profile"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                View Profile
              </Link>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
