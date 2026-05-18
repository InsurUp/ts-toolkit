/**
 * Local callback server for OAuth2 authorization code flow.
 * Starts a temporary HTTP server to receive the authorization code.
 */

export interface CallbackResult {
  code: string;
  state?: string;
  error?: string;
  errorDescription?: string;
}

/**
 * Start a local callback server and wait for the OAuth callback.
 * Returns the authorization code from the callback.
 */
export async function waitForCallback(port: number = 0): Promise<{
  result: Promise<CallbackResult>;
  url: string;
  stop: () => void;
}> {
  let resolveCallback: (result: CallbackResult) => void;
  let serverInstance: ReturnType<typeof Bun.serve> | null = null;

  const result = new Promise<CallbackResult>((resolve) => {
    resolveCallback = resolve;
  });

  // Success HTML page
  const successHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Authentication Successful</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      max-width: 400px;
    }
    .checkmark {
      width: 80px;
      height: 80px;
      background: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }
    .checkmark svg {
      width: 40px;
      height: 40px;
      stroke: white;
      stroke-width: 3;
    }
    h1 {
      color: #1f2937;
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
    }
    p {
      color: #6b7280;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="checkmark">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h1>Authentication Successful!</h1>
    <p>You can close this window and return to the CLI.</p>
  </div>
</body>
</html>
`;

  // Error HTML page
  const errorHtml = (error: string, description?: string) => `
<!DOCTYPE html>
<html>
<head>
  <title>Authentication Failed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    .container {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      max-width: 400px;
    }
    .error-icon {
      width: 80px;
      height: 80px;
      background: #ef4444;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }
    .error-icon svg {
      width: 40px;
      height: 40px;
      stroke: white;
      stroke-width: 3;
    }
    h1 {
      color: #1f2937;
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
    }
    p {
      color: #6b7280;
      margin: 0;
    }
    .error-detail {
      background: #fef2f2;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      color: #991b1b;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-icon">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h1>Authentication Failed</h1>
    <p>An error occurred during authentication.</p>
    <div class="error-detail">
      <strong>${error}</strong>
      ${description ? `<br/>${description}` : ''}
    </div>
  </div>
</body>
</html>
`;

  serverInstance = Bun.serve({
    port,
    fetch(req) {
      const url = new URL(req.url);

      // Handle callback path
      if (url.pathname === '/callback' || url.pathname === '/') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        if (error) {
          resolveCallback({
            code: '',
            state: state || undefined,
            error,
            errorDescription: errorDescription || undefined,
          });
          return new Response(errorHtml(error, errorDescription || undefined), {
            headers: { 'Content-Type': 'text/html' },
          });
        }

        if (code) {
          resolveCallback({
            code,
            state: state || undefined,
          });
          return new Response(successHtml, {
            headers: { 'Content-Type': 'text/html' },
          });
        }

        // No code or error - show waiting page
        return new Response('Waiting for authentication...', {
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      // Favicon request
      if (url.pathname === '/favicon.ico') {
        return new Response(null, { status: 204 });
      }

      return new Response('Not found', { status: 404 });
    },
  });

  const actualPort = serverInstance.port;
  const callbackUrl = `http://localhost:${actualPort}/callback`;

  const stop = () => {
    if (serverInstance) {
      serverInstance.stop();
      serverInstance = null;
    }
  };

  return {
    result,
    url: callbackUrl,
    stop,
  };
}
