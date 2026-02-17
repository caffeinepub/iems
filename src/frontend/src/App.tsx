import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import RoleSelection from './pages/RoleSelection';
import PhoneOtpLogin from './pages/PhoneOtpLogin';
import ChairpersonLogin from './pages/ChairpersonLogin';
import ProfileCompletion from './pages/ProfileCompletion';
import DashboardStudentParent from './pages/DashboardStudentParent';
import DashboardTeacher from './pages/DashboardTeacher';
import DashboardChairperson from './pages/DashboardChairperson';
import DashboardNonTeaching from './pages/DashboardNonTeaching';
import Profile from './pages/Profile';
import AppLayout from './components/AppLayout';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  if (isInitializing || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    window.location.hash = '#/';
    return null;
  }

  if (isFetched && userProfile === null) {
    window.location.hash = '#/profile-completion';
    return null;
  }

  return <>{children}</>;
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RoleSelection,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: PhoneOtpLogin,
});

const chairpersonLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chairperson-login',
  component: ChairpersonLogin,
});

const profileCompletionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile-completion',
  component: ProfileCompletion,
});

const dashboardStudentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/student',
  component: () => (
    <AuthGate>
      <AppLayout>
        <DashboardStudentParent />
      </AppLayout>
    </AuthGate>
  ),
});

const dashboardTeacherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/teacher',
  component: () => (
    <AuthGate>
      <AppLayout>
        <DashboardTeacher />
      </AppLayout>
    </AuthGate>
  ),
});

const dashboardChairpersonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/chairperson',
  component: () => (
    <AuthGate>
      <AppLayout>
        <DashboardChairperson />
      </AppLayout>
    </AuthGate>
  ),
});

const dashboardNonTeachingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/non-teaching',
  component: () => (
    <AuthGate>
      <AppLayout>
        <DashboardNonTeaching />
      </AppLayout>
    </AuthGate>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <AuthGate>
      <AppLayout>
        <Profile />
      </AppLayout>
    </AuthGate>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  chairpersonLoginRoute,
  profileCompletionRoute,
  dashboardStudentRoute,
  dashboardTeacherRoute,
  dashboardChairpersonRoute,
  dashboardNonTeachingRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
