import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGetCallerUserProfile, useUpdateProfile, useUndoProfile } from '../hooks/useQueries';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Profile as ProfileType } from '../backend';

export default function Profile() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const updateProfile = useUpdateProfile();
  const undoProfile = useUndoProfile();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [lastUpdatePhone, setLastUpdatePhone] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAddress(profile.address);
    }
  }, [profile]);

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

    if (!profile) return;

    const updatedProfile: ProfileType = {
      ...profile,
      name: name.trim(),
      address: address.trim(),
    };

    try {
      await updateProfile.mutateAsync(updatedProfile);
      setLastUpdatePhone(profile.phone);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleUndo = async () => {
    if (!lastUpdatePhone) return;
    try {
      await undoProfile.mutateAsync(lastUpdatePhone);
      setLastUpdatePhone('');
    } catch (err: any) {
      setError(err.message || 'Failed to undo changes');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Profile not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>View and edit your profile information</CardDescription>
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
              <Input id="role" value={profile.role} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={profile.phone} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateProfile.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={updateProfile.isPending}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              {lastUpdatePhone && (
                <Button type="button" variant="outline" onClick={handleUndo} disabled={undoProfile.isPending}>
                  {undoProfile.isPending ? 'Undoing...' : 'Undo Last Change'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
