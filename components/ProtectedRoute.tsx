"use client";
import { API_URL } from "@/constants/constants";
import { logout } from "@/store/authSlice";
import { RootState } from "@/store/ReduxProvider";
import { handleError } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/login",
}) => {
  const router = useRouter();
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );

  const dispatch = useDispatch();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        handleError("Please login to continue.");
        router.push(redirectTo);
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Token verification failed");
        }

        setIsVerifying(false);
      } catch (error) {
        console.error("Token verification error:", error);
        dispatch(logout());
        handleError("Session expired. Please login again.");
        router.push(redirectTo);
        setIsVerifying(false);
      }
    };
    verifyToken();
  }, [dispatch, router, redirectTo, token]);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
export const AuthRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/",
}) => {
  const router = useRouter();
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated && token) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, token, router, redirectTo]);

  if (!isAuthenticated || !token) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
    </div>
  );
};
