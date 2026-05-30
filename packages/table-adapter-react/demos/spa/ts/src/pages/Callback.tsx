import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { auth, takePkceHandshake } from '@/auth';
import { authConfig } from '@/config';

/**
 * OAuth callback page. Completes the authorization-code (PKCE) exchange using the
 * code verifier and state stashed before the redirect, then navigates home.
 */
export function Callback(): React.ReactElement {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  // StrictMode mounts effects twice in dev; guard so we only exchange once.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const { codeVerifier, state } = takePkceHandshake();

    const complete = async (): Promise<void> => {
      if (!codeVerifier) {
        setError('Missing login session. Please try signing in again.');
        return;
      }
      try {
        const result = await auth.exchangeCode({
          callbackUrl: window.location.href,
          redirectUri: authConfig.redirectUri,
          codeVerifier,
          state: state ?? undefined,
        });
        if (result.isSuccess) {
          navigate('/', { replace: true });
        } else {
          setError(result.error.description ?? result.error.message);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Login failed.');
      }
    };

    void complete();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-destructive">{error}</p>
          <button
            className="text-sm text-primary underline"
            onClick={() => navigate('/', { replace: true })}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground">Completing login...</p>
      </div>
    </div>
  );
}
