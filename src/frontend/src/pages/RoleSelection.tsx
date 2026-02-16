import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, Briefcase } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    navigate({ to: '/login', search: { role } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <img
            src="/assets/generated/iems-logo.dim_512x512.png"
            alt="IEMS Logo"
            className="h-24 w-24 mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold mb-2">IEMS</h1>
          <p className="text-xl text-muted-foreground">Integrated Education Management System</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Select Your Role</CardTitle>
            <CardDescription>Choose your role to continue to login</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6 p-6">
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-4 p-8 hover:bg-primary/5 hover:border-primary transition-all"
              onClick={() => handleRoleSelect('Student')}
            >
              <GraduationCap className="h-16 w-16 text-primary" />
              <div className="text-center">
                <div className="font-semibold text-lg mb-1">Student / Parent</div>
                <div className="text-sm text-muted-foreground">View attendance, homework, and fees</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-4 p-8 hover:bg-primary/5 hover:border-primary transition-all"
              onClick={() => handleRoleSelect('Teacher')}
            >
              <Users className="h-16 w-16 text-primary" />
              <div className="text-center">
                <div className="font-semibold text-lg mb-1">Teacher</div>
                <div className="text-sm text-muted-foreground">Manage classes, attendance, and homework</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-4 p-8 hover:bg-primary/5 hover:border-primary transition-all"
              onClick={() => handleRoleSelect('NonTeachingStaff')}
            >
              <Briefcase className="h-16 w-16 text-primary" />
              <div className="text-center">
                <div className="font-semibold text-lg mb-1">Non-Teaching Staff</div>
                <div className="text-sm text-muted-foreground">View notices and announcements</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="link" onClick={() => navigate({ to: '/chairperson-login' })}>
            Chairperson Login
          </Button>
        </div>
      </div>
    </div>
  );
}
