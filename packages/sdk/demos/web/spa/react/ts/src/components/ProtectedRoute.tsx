import { useAuthContext } from "react-oauth2-code-pkce";
import { Navigate, Outlet, useLocation } from "react-router";

export function ProtectedRoute() {
  const { token, loginInProgress } = useAuthContext();
  const location = useLocation();

  if (loginInProgress) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    // Redirect to home with the return url
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
