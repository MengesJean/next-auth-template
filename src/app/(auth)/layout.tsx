import { getUser } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (user) {
    redirect("/profile");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome to Auth Next.js
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              A complete authentication system built with Next.js 14
            </p>
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Image/Pattern */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="absolute inset-0 bg-grid-white/[0.2] bg-[length:20px_20px]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="space-y-6 text-center max-w-2xl px-8">
            <h2 className="text-3xl font-bold">Secure Authentication System</h2>
            <p className="text-lg">
              Built with Next.js 14, Server Actions, Prisma, and modern security
              practices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
