import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirect?: string;
}

const ProtectedRoute = ({ children, redirect = "/" }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuthStore();

  // If we are still fetching the user from `/me`, show a loading state
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  // If no user, redirect to login page
  if (!user) {
    return <Navigate to={redirect} replace />;
  }

  // If user exists, render the children OR the Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
