"use client";
import RegisterForm from "@/sections/RegisterForm";
import Link from "next/link";
export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-900 p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-2xl dark:bg-slate-800">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white">
            Create Your Account
          </h1>
          <p className="mt-1 text-sm text-center text-slate-600 dark:text-slate-400">
            Join our chat community today!
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-sm text-center text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-500 dark:hover:text-sky-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
