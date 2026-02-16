import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function PhoneOtpLogin() {
  const [phone, setPhone] = useState('');
  const { login, loginStatus, loginError } = useInternetIdentity();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const role = searchParams.get('role') || 'Student';

  const handleLogin = () => {
    if (!phone) {
      return;
    }
    // Store role in sessionStorage for profile completion
    sessionStorage.setItem('selectedRole', role);
    sessionStorage.setItem('phoneNumber', phone);
    login();
  };

  const isLoading = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <img
            src="/assets/generated/iems-logo.dim_512x512.png"
            alt="IEMS Logo"
            className="h-16 w-16 mx-auto mb-4"
          />
          <CardTitle className="text-2xl">Login as {role}</CardTitle>
          <CardDescription>Enter your phone number to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button className="w-full" onClick={handleLogin} disabled={!phone || isLoading}>
            {isLoading ? 'Logging in...' : 'Continue with Internet Identity'}
          </Button>

          <Button variant="outline" className="w-full" onClick={() => navigate({ to: '/' })} disabled={isLoading}>
            Back to Role Selection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
