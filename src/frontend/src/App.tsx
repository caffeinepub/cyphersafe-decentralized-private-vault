import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import VaultLocked from './components/VaultLocked';
import ScanningAnimation from './components/ScanningAnimation';
import ProfileSetup from './components/ProfileSetup';
import SplashScreen from './components/SplashScreen';
import NotesApp from './components/NotesApp';
import OurStory from './components/OurStory';
import QuickGuide from './components/QuickGuide';
import Settings from './components/Settings';
import DataOwnershipTerms from './components/DataOwnershipTerms';
import WelcomePopup from './components/WelcomePopup';
import Header from './components/Header';
import Footer from './components/Footer';
import SecureNoteViewPage from './components/SecureNoteViewPage';

// Layout component that includes Header and Footer
function Layout() {
  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

// Minimal layout for secure view (no header/footer)
function SecureViewLayout() {
  return (
    <div className="flex-1 flex flex-col">
      <Outlet />
    </div>
  );
}

// Create root route
const rootRoute = createRootRoute({
  component: Layout,
});

// Create secure view root (separate from main app)
const secureViewRootRoute = createRootRoute({
  component: SecureViewLayout,
});

// Create notepad route (main dashboard)
const notepadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: NotesApp,
});

// Create our story route
const ourStoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/our-story',
  component: OurStory,
});

// Create quick guide route
const quickGuideRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/quick-guide',
  component: QuickGuide,
});

// Create settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

// Create data ownership & terms route
const dataOwnershipTermsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/data-ownership-terms',
  component: DataOwnershipTerms,
});

// Create secure note view route (public, no auth required)
const secureNoteViewRoute = createRoute({
  getParentRoute: () => secureViewRootRoute,
  path: '/s/$shareId',
  component: SecureNoteViewPage,
});

// Create routers
const mainRouteTree = rootRoute.addChildren([
  notepadRoute,
  ourStoryRoute,
  quickGuideRoute,
  settingsRoute,
  dataOwnershipTermsRoute,
]);

const secureViewRouteTree = secureViewRootRoute.addChildren([
  secureNoteViewRoute,
]);

// Determine which router to use based on path
function getActiveRouter() {
  const path = window.location.pathname;
  if (path.startsWith('/s/')) {
    return createRouter({ routeTree: secureViewRouteTree });
  }
  return createRouter({ routeTree: mainRouteTree });
}

// Main App component
function AppContent() {
  const { identity, isInitializing, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [showScanningAnimation, setShowScanningAnimation] = useState(false);
  const [hasShownScanning, setHasShownScanning] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [router] = useState(() => getActiveRouter());

  const isAuthenticated = !!identity;
  const isSecureViewRoute = window.location.pathname.startsWith('/s/');

  // Skip auth flow for secure view routes
  useEffect(() => {
    if (isSecureViewRoute) {
      setIsLocked(false);
      setShowSplash(false);
      setShowScanningAnimation(false);
    }
  }, [isSecureViewRoute]);

  // Reset lock state when user is not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isSecureViewRoute) {
      setIsLocked(true);
      setHasShownScanning(false);
      setShowSplash(true);
      setShowWelcomePopup(false);
    }
  }, [isAuthenticated, isSecureViewRoute]);

  // Show scanning animation when login starts
  useEffect(() => {
    if (loginStatus === 'logging-in' && !hasShownScanning && !isSecureViewRoute) {
      setShowScanningAnimation(true);
      setHasShownScanning(true);
    }
  }, [loginStatus, hasShownScanning, isSecureViewRoute]);

  // Unlock vault immediately when authentication succeeds
  useEffect(() => {
    if (loginStatus === 'success' && isAuthenticated && !isSecureViewRoute) {
      setIsLocked(false);
      setShowScanningAnimation(false);
    }
  }, [loginStatus, isAuthenticated, isSecureViewRoute]);

  // Fail-safe: Unlock vault if authenticated but still locked after initialization
  useEffect(() => {
    if (isAuthenticated && isLocked && !showScanningAnimation && !isInitializing && !isSecureViewRoute) {
      setIsLocked(false);
    }
  }, [isAuthenticated, isLocked, showScanningAnimation, isInitializing, isSecureViewRoute]);

  // 2-second fallback timeout to hide scanning animation and unlock vault
  useEffect(() => {
    if (showScanningAnimation && isAuthenticated && !isSecureViewRoute) {
      const fallbackTimer = setTimeout(() => {
        setShowScanningAnimation(false);
        setIsLocked(false);
      }, 2000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [showScanningAnimation, isAuthenticated, isSecureViewRoute]);

  // Show welcome popup for first-time users after splash screen
  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile && userProfile.isFirstTimeUser && !showSplash && !isSecureViewRoute) {
      setShowWelcomePopup(true);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile, showSplash, isSecureViewRoute]);

  // For secure view routes, render directly without auth checks
  if (isSecureViewRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <RouterProvider router={router} />
        <Toaster />
      </div>
    );
  }

  // Show scanning animation overlay during login
  if (showScanningAnimation) {
    return <ScanningAnimation />;
  }

  // Show vault locked screen if locked
  if (isLocked) {
    return <VaultLocked />;
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className={`min-h-screen flex flex-col bg-background text-foreground transition-all duration-700 ${!isLocked ? 'blur-0 opacity-100' : 'blur-lg opacity-50'}`}>
      {isInitializing ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent neon-glow"></div>
            <p className="mt-4 text-muted-foreground">Initializing...</p>
          </div>
        </div>
      ) : showProfileSetup ? (
        <div className="flex-1 flex items-center justify-center">
          <ProfileSetup />
        </div>
      ) : showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <>
          <RouterProvider router={router} />
          {showWelcomePopup && userProfile && (
            <WelcomePopup
              userName={userProfile.name}
              onClose={() => setShowWelcomePopup(false)}
            />
          )}
        </>
      )}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AppContent />
    </ThemeProvider>
  );
}
