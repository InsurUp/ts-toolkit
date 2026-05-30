import { useAuth } from '@/auth';
import { Navigate, Outlet, useLocation } from 'react-router';

export function ProtectedRoute(): React.ReactElement {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
