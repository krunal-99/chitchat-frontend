"use client";
import { API_URL } from "@/constants/constants";
import { logout } from "@/store/authSlice";
import { RootState } from "@/store/ReduxProvider";
import { handleError } from "@/utils/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface PrivateRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<PrivateRouteProps> = ({
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
      if (!token || !isAuthenticated) {
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
  }, []);

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

export const AuthRoute: React.FC<PrivateRouteProps> = ({
  children,
  redirectTo = "/",
}) => {
  const router = useRouter();
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );
  const [isRedirecting, setIsRedirecting] = useState<boolean>(
    isAuthenticated && !!token
  );

  useEffect(() => {
    if (isAuthenticated && token) {
      setIsRedirecting(true);
      router.replace(redirectTo);
    } else {
      setIsRedirecting(false);
    }
  }, [isAuthenticated, token, router, redirectTo]);

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return <>{children}</>;
  }

  return null;
};
