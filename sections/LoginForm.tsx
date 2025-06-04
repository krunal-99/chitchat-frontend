"use client";
import { handleLogin } from "@/actions/serverActions";
import { login } from "@/store/authSlice";
import { handleError, handleSuccess } from "@/utils/utils";
import {
  LoginFormData,
  loginSchema,
  RegisterFormData,
} from "@/utils/validationSchema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useDispatch } from "react-redux";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const data: LoginFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    try {
      setIsLoading(true);
      const response = await handleLogin(result.data);
      if (response.status === "success") {
        handleSuccess("Logged in successfully");
        dispatch(login({ user: response.user, token: response.token }));
        router.push("/");
      } else {
        handleError(response.message);
        console.error("Login failed:", response.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-900 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl dark:bg-slate-800">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white">
            Welcome Back!
          </h1>
          <p className="mt-2 text-sm text-center text-slate-600 dark:text-slate-400">
            Sign in to continue to your chats.
          </p>
        </div>

        <form className="mt-8 space-y-6" noValidate onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-900 dark:text-white"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`mt-1 block w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border ${
                  errors.password
                    ? "border-red-500"
                    : "border-slate-300 dark:border-slate-600"
                } rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-900 dark:text-white`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 dark:text-slate-400 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <MdVisibilityOff size={20} />
                ) : (
                  <MdVisibility size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <button
              disabled={isLoading}
              type="submit"
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800 transition duration-150 ease-in-out cursor-pointer ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-sm text-center text-slate-600 dark:text-slate-400">
          Not a member?{" "}
          <Link
            href="/register"
            className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-500 dark:hover:text-sky-400"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
