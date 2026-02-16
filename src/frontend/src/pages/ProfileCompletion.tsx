import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Profile } from '../backend';

export default function ProfileCompletion() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const saveProfile = useSaveCallerUserProfile();
  const navigate = useNavigate();

  const role = sessionStorage.getItem('selectedRole') || 'Student';
  const phone = sessionStorage.getItem('phoneNumber') || '';

  useEffect(() => {
    if (!phone) {
      navigate({ to: '/' });
    }
  }, [phone, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!address.trim()) {
      setError('Address is required');
      return;
    }

    const profile: Profile = {
      name: name.trim(),
      phone,
      address: address.trim(),
      role,
    };

    try {
      await saveProfile.mutateAsync(profile);
      
      // Navigate to appropriate dashboard
      const dashboardMap: Record<string, string> = {
        Student: '/dashboard/student',
        Teacher: '/dashboard/teacher',
        Chairperson: '/dashboard/chairperson',
        NonTeachingStaff: '/dashboard/non-teaching',
      };
      
      navigate({ to: dashboardMap[role] || '/dashboard/student' });
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Please provide your details to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={role} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saveProfile.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={saveProfile.isPending}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
