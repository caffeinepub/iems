import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGetCallerUserProfile, useMarkAttendance, useAddHomework, useGetHomework } from '../hooks/useQueries';
import { BookOpen, CheckSquare, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { AlertCircle } from 'lucide-react';
import type { HomeworkEntry } from '../backend';

export default function DashboardTeacher() {
  const { data: profile } = useGetCallerUserProfile();
  const isOnline = useOnlineStatus();
  const markAttendance = useMarkAttendance();
  const addHomework = useAddHomework();
  
  // Mock class ID - in real app, this would come from teacher assignments
  const classId = 'class-1';
  const { data: currentHomework } = useGetHomework(classId);
  
  const [studentPhone, setStudentPhone] = useState('');
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [homeworkDescription, setHomeworkDescription] = useState('');
  const [homeworkDueDate, setHomeworkDueDate] = useState('');

  const handleMarkAttendance = async (present: boolean) => {
    if (!studentPhone) return;
    try {
      await markAttendance.mutateAsync({ classId, studentPhone, present });
      setStudentPhone('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAddHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkTitle || !homeworkDescription || !homeworkDueDate) return;
    
    const entry: HomeworkEntry = {
      title: homeworkTitle,
      description: homeworkDescription,
      dueDate: homeworkDueDate,
    };
    
    try {
      await addHomework.mutateAsync({ classId, entry });
      setHomeworkTitle('');
      setHomeworkDescription('');
      setHomeworkDueDate('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6 p-6">
      {!isOnline && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are currently offline. Attendance marking and homework updates are disabled.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-3xl font-bold">Welcome, {profile?.name}</h1>
        <p className="text-muted-foreground">Teacher Dashboard</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              My Classes
            </CardTitle>
            <CardDescription>Classes assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-3 border rounded-lg">
                <p className="font-semibold">Class 1</p>
                <p className="text-sm text-muted-foreground">Form Teacher</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Mark Attendance
            </CardTitle>
            <CardDescription>Mark attendance for your class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentPhone">Student Phone Number</Label>
                <Input
                  id="studentPhone"
                  placeholder="+1234567890"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  disabled={!isOnline || markAttendance.isPending}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleMarkAttendance(true)}
                  disabled={!isOnline || !studentPhone || markAttendance.isPending}
                  className="flex-1"
                >
                  Mark Present
                </Button>
                <Button
                  onClick={() => handleMarkAttendance(false)}
                  disabled={!isOnline || !studentPhone || markAttendance.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  Mark Absent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Homework Management
          </CardTitle>
          <CardDescription>Add homework for your class</CardDescription>
        </CardHeader>
        <CardContent>
          {currentHomework && (
            <Alert className="mb-4">
              <AlertDescription>
                <strong>Current Homework:</strong> {currentHomework.title} - Due: {currentHomework.dueDate}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleAddHomework} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Homework Title</Label>
              <Input
                id="title"
                placeholder="Enter homework title"
                value={homeworkTitle}
                onChange={(e) => setHomeworkTitle(e.target.value)}
                disabled={!isOnline || addHomework.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter homework description"
                value={homeworkDescription}
                onChange={(e) => setHomeworkDescription(e.target.value)}
                disabled={!isOnline || addHomework.isPending}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={homeworkDueDate}
                onChange={(e) => setHomeworkDueDate(e.target.value)}
                disabled={!isOnline || addHomework.isPending}
              />
            </div>
            
            <Button type="submit" disabled={!isOnline || addHomework.isPending}>
              {addHomework.isPending ? 'Adding...' : 'Add Homework'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
