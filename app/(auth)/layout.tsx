import { AuthRoute } from "@/components/ProtectedRoute";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <AuthRoute>{children}</AuthRoute>;
};

export default AuthLayout;
