import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/auth';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to home with the return url
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
