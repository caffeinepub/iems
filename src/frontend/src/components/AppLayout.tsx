import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, User, Bell } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import AppInfoDialog from './AppInfoDialog';
import { useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { clear } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleProfileClick = () => {
    navigate({ to: '/profile' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header 
        className="border-b bg-card relative overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/generated/iems-header-bg.dim_1600x400.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="absolute inset-0 bg-card/90 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <img
              src="/assets/generated/iems-logo.dim_512x512.png"
              alt="IEMS Logo"
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-xl font-bold">IEMS</h1>
              <p className="text-xs text-muted-foreground">Education Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AppInfoDialog />
            <Button variant="ghost" size="icon" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleProfileClick}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      <main className="flex-1 bg-muted/20">
        {children}
      </main>

      <footer className="border-t bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} IEMS. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
