import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Shield } from 'lucide-react';

export default function ChairpersonLogin() {
  const [phone, setPhone] = useState('');
  const { login, loginStatus, loginError } = useInternetIdentity();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!phone) {
      return;
    }
    sessionStorage.setItem('selectedRole', 'Chairperson');
    sessionStorage.setItem('phoneNumber', phone);
    login();
  };

  const isLoading = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Chairperson Login</CardTitle>
          <CardDescription>Administrative access only</CardDescription>
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
