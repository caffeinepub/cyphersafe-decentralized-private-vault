import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, LogIn, Menu, BookOpen, HelpCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleNavigate = (path: string) => {
    navigate({ to: path });
    setIsMenuOpen(false);
  };

  return (
    <header className="border-b border-primary/30 bg-black/50 backdrop-blur-md sticky top-0 z-50 neon-border-bottom">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 justify-center flex-1 lg:justify-start">
          <div className="logo-container">
            <img 
              src="/assets/generated/heart-shield-logo-circular-transparent.dim_200x200.png" 
              alt="CypherSafe Logo" 
              className="w-14 h-14 rounded-full logo-pulse-glow"
            />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-primary cyber-font neon-text">CypherSafe</h1>
            <p className="text-xs text-primary/60 cyber-font tracking-wide">Your Privacy, Our Heartbeat</p>
          </div>
        </div>
        <div className="flex items-center gap-4 absolute right-4 lg:relative lg:right-0">
          {isAuthenticated && userProfile && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, <span className="text-primary font-medium">{userProfile.name}</span>
            </span>
          )}
          {isAuthenticated && (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-primary/50 hover:border-primary neon-border"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="glass-card border-primary/30 neon-border bg-black/95">
                <SheetHeader>
                  <SheetTitle className="text-primary cyber-font neon-text">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <Button
                    onClick={() => handleNavigate('/our-story')}
                    variant="ghost"
                    className="justify-start gap-3 text-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <BookOpen className="w-5 h-5" />
                    Our Story
                  </Button>
                  <Button
                    onClick={() => handleNavigate('/quick-guide')}
                    variant="ghost"
                    className="justify-start gap-3 text-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <HelpCircle className="w-5 h-5" />
                    Quick Guide
                  </Button>
                  <Button
                    onClick={() => handleNavigate('/settings')}
                    variant="ghost"
                    className="justify-start gap-3 text-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Button>
                  <div className="border-t border-primary/20 my-4" />
                  <Button
                    onClick={handleAuth}
                    variant="ghost"
                    className="justify-start gap-3 text-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-destructive"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
          {!isAuthenticated && (
            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant="default"
              className="gap-2 rounded-full px-6 bg-primary hover:bg-primary/90 neon-glow-button"
            >
              {disabled ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Login
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
