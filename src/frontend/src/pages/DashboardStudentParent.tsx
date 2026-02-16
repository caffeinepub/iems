import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetCallerUserProfile, useGetAttendance, useGetHomework, useGetFees } from '../hooks/useQueries';
import { CheckCircle, XCircle, BookOpen, DollarSign, Printer } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { AlertCircle } from 'lucide-react';

export default function DashboardStudentParent() {
  const { data: profile } = useGetCallerUserProfile();
  const isOnline = useOnlineStatus();
  
  // Mock class ID - in real app, this would come from profile
  const classId = 'class-1';
  const studentPhone = profile?.phone || '';
  
  const { data: attendance, isLoading: attendanceLoading } = useGetAttendance(classId, studentPhone);
  const { data: homework, isLoading: homeworkLoading } = useGetHomework(classId);
  const { data: fees, isLoading: feesLoading } = useGetFees(studentPhone);

  const handlePrintId = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6">
      {!isOnline && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are currently offline. Some information may not be up to date.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profile?.name}</h1>
          <p className="text-muted-foreground">Student Dashboard</p>
        </div>
        <Button onClick={handlePrintId} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print ID Card
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {attendance ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Attendance
            </CardTitle>
            <CardDescription>Today's attendance status</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <Badge variant={attendance ? 'default' : 'destructive'} className="text-lg">
                {attendance ? 'Present' : 'Absent'}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Homework
            </CardTitle>
            <CardDescription>Current assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {homeworkLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : homework ? (
              <div className="space-y-2">
                <p className="font-semibold">{homework.title}</p>
                <p className="text-sm text-muted-foreground">{homework.description}</p>
                <p className="text-xs text-muted-foreground">Due: {homework.dueDate}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No homework assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Fees
            </CardTitle>
            <CardDescription>Fee status</CardDescription>
          </CardHeader>
          <CardContent>
            {feesLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : fees ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold">${Number(fees.amount)}</p>
                <Badge
                  variant={
                    fees.status === 'paid'
                      ? 'default'
                      : fees.status === 'advance'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {fees.status.toUpperCase()}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No fee information</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="print:block hidden">
        <CardHeader className="text-center">
          <img
            src="/assets/generated/iems-logo.dim_512x512.png"
            alt="IEMS Logo"
            className="h-16 w-16 mx-auto mb-2"
          />
          <CardTitle>Student ID Card</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-xl font-bold">{profile?.name}</p>
          <p className="text-muted-foreground">{profile?.phone}</p>
          <p className="text-sm">{profile?.address}</p>
          <p className="text-xs text-muted-foreground mt-4">Class: {classId}</p>
        </CardContent>
      </Card>
    </div>
  );
}
