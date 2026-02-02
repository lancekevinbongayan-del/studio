"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { store } from '@/lib/store';
import { DEPARTMENTS, VISIT_REASONS_LIBRARY, VISIT_REASONS_DEAN } from '@/lib/mock-data';
import { Library, GraduationCap, Clock, CheckCircle2, LogOut } from 'lucide-react';

export default function VisitorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = store.getCurrentUser();
  const [department, setDepartment] = useState('');
  const [reason, setReason] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'Visitor') {
      router.push('/');
    }
    if (user?.department) setDepartment(user.department);
  }, [user, router]);

  const handleCheckIn = (type: 'Library' | 'Dean') => {
    if (!department || !reason || (type === 'Dean' && !idNumber)) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      store.addVisit({
        userId: user!.id,
        userName: user!.name,
        userEmail: user!.email,
        department,
        reason,
        timestamp: new Date().toISOString(),
        status: type === 'Library' ? 'Completed' : 'Waiting',
        type,
        idNumber: type === 'Dean' ? idNumber : undefined,
      });
      
      setSubmitting(false);
      setCheckedIn(true);
      toast({
        title: type === 'Library' ? "Welcome to NEU Library!" : "Appointment Queued",
        description: type === 'Library' 
          ? "Your visit has been logged successfully." 
          : "Your appointment is now waiting for the Dean's review.",
      });
    }, 1200);
  };

  const handleLogout = () => {
    store.setCurrentUser(null);
    router.push('/');
  };

  if (checkedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 animate-in zoom-in-95 duration-500">
          <div className="mx-auto bg-green-100 text-green-600 p-4 rounded-full w-fit">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-headline">Visit Logged!</h2>
            <p className="text-muted-foreground text-lg">Thank you for visiting NEU. Your data helps us improve our facility services.</p>
          </div>
          <Button onClick={() => setCheckedIn(false)} className="w-full h-12 text-lg">Check-in another visit</Button>
          <Button variant="ghost" onClick={handleLogout} className="w-full text-muted-foreground">Sign Out</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Library className="h-6 w-6" />
            <h1 className="text-xl font-bold font-headline">LibTrack Visitor Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Welcome, <strong>{user?.name}</strong></span>
            <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold font-headline text-primary">Visitor Check-in</h2>
          <p className="text-muted-foreground text-lg">Select a facility to check-in and provide details for your visit.</p>
        </div>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid grid-cols-2 h-14 bg-white shadow-sm border mb-8 p-1 rounded-xl">
            <TabsTrigger value="library" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg font-medium rounded-lg">
              <Library className="mr-2 h-5 w-5" /> Library
            </TabsTrigger>
            <TabsTrigger value="dean" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-lg font-medium rounded-lg">
              <GraduationCap className="mr-2 h-5 w-5" /> Dean's Office
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="animate-in fade-in slide-in-from-left-4 duration-300">
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>Library Access Form</CardTitle>
                <CardDescription>Fill this out to enter the campus library facilities.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dept">College Department</Label>
                    <Select onValueChange={setDepartment} value={department}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Visit</Label>
                    <Select onValueChange={setReason} value={reason}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select Reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {VISIT_REASONS_LIBRARY.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={() => handleCheckIn('Library')} 
                  className="w-full h-14 text-xl font-bold bg-primary hover:bg-primary/90 mt-4"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Submit Check-in"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dean" className="animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="border-t-4 border-t-accent">
              <CardHeader>
                <CardTitle>Dean's Office Log</CardTitle>
                <CardDescription>Request an appointment or submit an inquiry for the Dean.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="id-num">Student/Employee ID</Label>
                    <Input 
                      id="id-num" 
                      placeholder="e.g. 2023-00001" 
                      value={idNumber} 
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept-dean">College Department</Label>
                    <Select onValueChange={setDepartment} value={department}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason-dean">Purpose of Visit</Label>
                    <Select onValueChange={setReason} value={reason}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select Purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {VISIT_REASONS_DEAN.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={() => handleCheckIn('Dean')} 
                  className="w-full h-14 text-xl font-bold bg-accent hover:bg-accent/90 text-white mt-4"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Request Appointment"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-500 mt-1" />
          <div className="text-sm text-blue-800">
            <p className="font-bold">Privacy Note:</p>
            <p>Your visit data is stored securely and used only for library analytics and administrative purposes. Auto-timestamping is applied to all entries.</p>
          </div>
        </div>
      </main>
    </div>
  );
}