import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCallerUserProfile, useGetMessages } from '../hooks/useQueries';
import { Bell, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { AlertCircle } from 'lucide-react';

export default function DashboardNonTeaching() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: messages, isLoading } = useGetMessages();
  const isOnline = useOnlineStatus();

  return (
    <div className="space-y-6 p-6">
      {!isOnline && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are currently offline. Messages may not be up to date.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-3xl font-bold">Welcome, {profile?.name}</h1>
        <p className="text-muted-foreground">Non-Teaching Staff Dashboard</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notices & Announcements
          </CardTitle>
          <CardDescription>Important messages and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading messages...</p>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">From: {message.sender}</p>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(Number(message.timestamp)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No messages available</p>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This is a view-only dashboard. Contact your administrator for any updates or changes.
        </AlertDescription>
      </Alert>
    </div>
  );
}
