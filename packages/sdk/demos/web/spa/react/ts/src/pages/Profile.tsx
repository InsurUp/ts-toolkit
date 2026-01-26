import { useAuthContext } from "react-oauth2-code-pkce";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Clock, LogOut } from "lucide-react";

export function Profile() {
  const { token, idTokenData, logOut } = useAuthContext();

  // Parse token claims if available
  const claims = idTokenData as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          View your account information and session details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your profile details from the identity provider.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {typeof claims?.name === "string" && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Name:</span>
                <span>{claims.name}</span>
              </div>
            )}
            {typeof claims?.email === "string" && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span>{String(claims.email)}</span>
              </div>
            )}
            {claims?.email_verified !== undefined && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Email Verified:</span>
                <Badge variant={claims.email_verified ? "default" : "secondary"}>
                  {claims.email_verified ? "Yes" : "No"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session
            </CardTitle>
            <CardDescription>Current authentication session details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-medium">Status:</span>{" "}
              <Badge variant="default">Authenticated</Badge>
            </div>
            {typeof claims?.iat === "number" && (
              <div>
                <span className="font-medium">Issued At:</span>{" "}
                <span className="text-muted-foreground">
                  {new Date(claims.iat * 1000).toLocaleString()}
                </span>
              </div>
            )}
            {typeof claims?.exp === "number" && (
              <div>
                <span className="font-medium">Expires:</span>{" "}
                <span className="text-muted-foreground">
                  {new Date(claims.exp * 1000).toLocaleString()}
                </span>
              </div>
            )}
            <div className="pt-4">
              <Button variant="destructive" onClick={() => logOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {token && (
        <Card>
          <CardHeader>
            <CardTitle>Access Token</CardTitle>
            <CardDescription>
              The current access token (truncated for display).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="block p-4 bg-muted rounded-md text-sm break-all">
              {token.slice(0, 50)}...{token.slice(-20)}
            </code>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
