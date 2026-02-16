import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetMessages } from '../hooks/useQueries';
import { X, Bell } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { AlertCircle } from 'lucide-react';

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { data: messages, isLoading } = useGetMessages();
  const isOnline = useOnlineStatus();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {!isOnline && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are offline. Messages may not be current.
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading messages...</p>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={index} className="p-3 border rounded-lg bg-muted/30">
                  <p className="font-semibold text-sm mb-1">From: {message.sender}</p>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(Number(message.timestamp)).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No messages</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
