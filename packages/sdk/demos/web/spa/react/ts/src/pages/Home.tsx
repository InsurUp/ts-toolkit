import { useAuthContext } from 'react-oauth2-code-pkce';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Shield } from 'lucide-react';

export function Home() {
  const { token, login, loginInProgress } = useAuthContext();
  const navigate = useNavigate();
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <Shield className="h-16 w-16 text-primary mb-6" />
        <h1 className="text-4xl font-bold tracking-tight mb-4">InsurUp SDK Demo</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          A React SPA demonstrating the InsurUp SDK for insurance platform integration.
        </p>
        <Button size="lg" onClick={() => login()} disabled={loginInProgress}>
          {loginInProgress ? 'Signing in...' : 'Sign in to get started'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the InsurUp SDK Demo. Explore customers and policies.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate('/customers')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              View and manage customer records. Create new customers, search, and filter.
            </CardDescription>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate('/policies')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Browse insurance policies. View details, coverage, and status information.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
