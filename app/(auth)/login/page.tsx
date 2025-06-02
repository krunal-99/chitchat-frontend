"use client";
import LoginForm from "@/sections/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-900">
          <div className="text-slate-600 dark:text-slate-400">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
