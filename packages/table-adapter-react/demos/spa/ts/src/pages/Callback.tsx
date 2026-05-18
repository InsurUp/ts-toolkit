import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthContext } from 'react-oauth2-code-pkce';

/**
 * OAuth callback page.
 * The AuthProvider handles the token exchange automatically.
 * This page just redirects to home after auth completes.
 */
export function Callback(): React.ReactElement {
  const navigate = useNavigate();
  const { loginInProgress } = useAuthContext();

  useEffect(() => {
    if (!loginInProgress) {
      navigate('/', { replace: true });
    }
  }, [loginInProgress, navigate]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground">Completing login...</p>
      </div>
    </div>
  );
}
