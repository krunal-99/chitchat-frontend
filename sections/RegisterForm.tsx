import { handleRegister } from "@/actions/serverActions";
import Input from "@/components/Input";
import ProfileLabel from "@/components/ProfileLabel";
import { formFields } from "@/constants/constants";
import { uploadImageToCloudinary } from "@/utils/uploadImageToCloudinary";
import { handleError, handleSuccess } from "@/utils/utils";
import {
  RegisteredUserData,
  RegisterFormData,
  registerSchema,
} from "@/utils/validationSchema";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const RegisterForm = () => {
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const router = useRouter();

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    const formData = new FormData(event.currentTarget);
    const data: RegisterFormData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirm-password") as string,
      profilePicture: selectedFile as File,
    };
    const result = registerSchema.safeParse(data);
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
      const imageUrl = await uploadImageToCloudinary(
        result.data.profilePicture
      );
      const registeredData: RegisteredUserData = {
        username: result.data.username,
        email: result.data.email,
        password: result.data.password,
        profilePicture: imageUrl,
      };
      const response = await handleRegister(registeredData);
      if (response.status === "success") {
        handleSuccess("Registration successful!");
        router.push("/login");
      } else {
        handleError(response.message);
        console.error("Registration failed:", response.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleProfilePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  return (
    <form className="mt-6 space-y-6" noValidate onSubmit={handleFormSubmit}>
      <div className="flex flex-col items-center space-y-2">
        <label
          htmlFor="profile-picture-upload"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Profile Picture
        </label>
        <div className="relative">
          <input
            type="file"
            id="profile-picture-upload"
            name="profile-picture"
            accept="image/png, image/jpeg, image/gif"
            onChange={handleProfilePictureChange}
            className="hidden"
          />
          <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-300 dark:border-slate-600 transition-colors">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
                width={300}
                height={300}
              />
            ) : (
              <div className="text-center p-2">
                <svg
                  className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 transition-colors"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 transition-colors">
                  Add photo
                </p>
              </div>
            )}
          </div>
          <ProfileLabel />
        </div>
        {errors.profilePicture && (
          <p className="text-xs text-red-600 mt-1">{errors.profilePicture}</p>
        )}
      </div>
      {formFields.map((field) => (
        <Input
          key={field}
          name={field}
          error={errors[field as keyof RegisterFormData]}
        />
      ))}
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
        <label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            name="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            className={`mt-1 block w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border ${
              errors.confirmPassword
                ? "border-red-500"
                : "border-slate-300 dark:border-slate-600"
            } rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-900 dark:text-white`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 dark:text-slate-400 cursor-pointer"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirmPassword ? (
              <MdVisibilityOff size={20} />
            ) : (
              <MdVisibility size={20} />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
        )}
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800 transition duration-150 ease-in-out cursor-pointer ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Creating your account..." : "Create Account"}
        </button>
      </div>
    </form>
  );
};
export default RegisterForm;
