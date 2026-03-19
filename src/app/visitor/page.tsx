"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { Library, GraduationCap, CheckCircle2, LogOut, Loader2, User, Briefcase } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DEPARTMENTS, VISIT_REASONS_LIBRARY, VISIT_REASONS_DEAN } from '@/lib/mock-data';

export default function VisitorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [visitorType, setVisitorType] = useState<'student' | 'employee'>('student');
  const [department, setDepartment] = useState('');
  const [reason, setReason] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const logo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
      return;
    }
  }, [user, isUserLoading, router]);

  const handleCheckIn = async (type: 'Library' | 'Dean') => {
    if (!fullName || !email || !department || !reason || (type === 'Dean' && !idNumber)) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill in all required fields to proceed.",
      });
      return;
    }

    if (!email.endsWith('@neu.edu.ph')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please use your institutional email (@neu.edu.ph).",
      });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'visits'), {
        userId: user!.uid,
        visitorName: fullName,
        visitorEmail: email,
        visitorType,
        collegeDepartment: department,
        reason,
        checkInTime: new Date().toISOString(),
        status: type === 'Library' ? 'completed' : 'waiting',
        studentEmployeeId: type === 'Dean' ? idNumber : null,
      });
      
      setCheckedIn(true);
      toast({
        title: type === 'Library' ? "Check-in Successful!" : "Added to Queue",
        description: "Thank you for visiting. Your log has been recorded.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "We couldn't log your visit. Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (user) {
      deleteDoc(doc(db, 'user_sessions', user.uid));
    }
    await auth.signOut();
    router.push('/');
  };

  if (isUserLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  if (checkedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 animate-in zoom-in-95 duration-300">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-headline text-primary">Check-in Complete!</h2>
            <p className="text-muted-foreground">Your visit to the {department} has been logged.</p>
          </div>
          <div className="pt-4 space-y-3">
            <Button onClick={() => {
              setCheckedIn(false);
              setReason('');
            }} className="w-full h-12">New Visit Log</Button>
            <Button variant="ghost" onClick={handleLogout} className="w-full h-12">Finish and Sign Out</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-0.5 rounded-full overflow-hidden flex items-center justify-center">
              {logo && <Image src={logo.imageUrl} alt="Logo" width={32} height={32} />}
            </div>
            <h1 className="text-xl font-bold font-headline">LibTrack Visitor Portal</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Exit
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-primary font-headline">Quick Check-in</h2>
          <p className="text-muted-foreground">Please provide your institutional details to log your visit.</p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Visitor Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="Juan Dela Cruz" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitorEmail">Institutional Email (@neu.edu.ph)</Label>
                <Input 
                  id="visitorEmail" 
                  type="email" 
                  placeholder="j.delacruz@neu.edu.ph" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>I am a:</Label>
              <RadioGroup 
                defaultValue="student" 
                value={visitorType} 
                onValueChange={(v) => setVisitorType(v as 'student' | 'employee')}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1 hover:bg-slate-50 transition-colors cursor-pointer">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="flex items-center gap-2 cursor-pointer font-medium">
                    <GraduationCap className="h-4 w-4 text-primary" /> Student
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1 hover:bg-slate-50 transition-colors cursor-pointer">
                  <RadioGroupItem value="employee" id="employee" />
                  <Label htmlFor="employee" className="flex items-center gap-2 cursor-pointer font-medium">
                    <Briefcase className="h-4 w-4 text-accent" /> Employee (Teacher/Staff)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid grid-cols-2 h-14 bg-white border mb-8 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="library" className="text-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Library className="h-5 w-5" /> Library
            </TabsTrigger>
            <TabsTrigger value="dean" className="text-lg gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <GraduationCap className="h-5 w-5" /> Dean's Office
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="animate-in fade-in duration-300">
            <Card className="border-t-4 border-t-primary shadow-md">
              <CardHeader>
                <CardTitle>Library Access Log</CardTitle>
                <CardDescription>Quick entry for research and study sessions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Your College Department</Label>
                  <Select onValueChange={setDepartment} value={department}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Select Department" /></SelectTrigger>
                    <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Reason for Visit</Label>
                  <Select onValueChange={setReason} value={reason}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Select Reason" /></SelectTrigger>
                    <SelectContent>{VISIT_REASONS_LIBRARY.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={() => handleCheckIn('Library')} className="w-full h-14 text-xl font-bold gap-2" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" /> : "Submit Check-in"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dean" className="animate-in fade-in duration-300">
            <Card className="border-t-4 border-t-accent shadow-md">
              <CardHeader>
                <CardTitle>Dean's Office Appointment</CardTitle>
                <CardDescription>Request a meeting or submit inquiries to the Dean's desk.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{visitorType === 'student' ? 'Student ID Number' : 'Employee ID Number'}</Label>
                  <Input placeholder="202X-XXXXX" value={idNumber} onChange={e => setIdNumber(e.target.value)} className="h-12 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Your College Department</Label>
                  <Select onValueChange={setDepartment} value={department}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Select Department" /></SelectTrigger>
                    <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Purpose of Visit</Label>
                  <Select onValueChange={setReason} value={reason}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Select Purpose" /></SelectTrigger>
                    <SelectContent>{VISIT_REASONS_DEAN.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={() => handleCheckIn('Dean')} className="w-full h-14 text-xl font-bold bg-accent hover:bg-accent/90 text-accent-foreground gap-2" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" /> : "Request Appointment"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
