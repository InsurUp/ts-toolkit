import { NavLink } from 'react-router';
import { useAuth } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

const THEME_KEY = 'insurup-demo-theme';

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function Header() {
  const { isAuthenticated, login, logout } = useAuth();
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 flex h-14 items-center">
        <div className="mr-4 flex">
          <NavLink to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">InsurUp SDK Demo</span>
          </NavLink>
          {isAuthenticated && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <NavLink
                to="/customers"
                className={({ isActive }) =>
                  isActive
                    ? 'text-foreground'
                    : 'text-foreground/60 transition-colors hover:text-foreground'
                }
              >
                Customers
              </NavLink>
              <NavLink
                to="/policies"
                className={({ isActive }) =>
                  isActive
                    ? 'text-foreground'
                    : 'text-foreground/60 transition-colors hover:text-foreground'
                }
              >
                Policies
              </NavLink>
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <NavLink to="/profile">Profile</NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => void login()}>Login</Button>
          )}
        </div>
      </div>
    </header>
  );
}
