
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { collection, addDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { Library, GraduationCap, Clock, CheckCircle2, LogOut, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DEPARTMENTS, VISIT_REASONS_LIBRARY, VISIT_REASONS_DEAN } from '@/lib/mock-data';

export default function VisitorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const [department, setDepartment] = useState('');
  const [reason, setReason] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const logo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
      return;
    }
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setUserData(snap.data());
      });
    }
  }, [user, isUserLoading, router, db]);

  const handleCheckIn = async (type: 'Library' | 'Dean') => {
    if (!department || !reason || (type === 'Dean' && !idNumber)) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'visits'), {
        userId: user!.uid,
        collegeDepartment: department,
        reason,
        checkInTime: new Date().toISOString(),
        status: type === 'Library' ? 'completed' : 'waiting',
        studentEmployeeId: type === 'Dean' ? idNumber : null,
      });
      
      setCheckedIn(true);
      toast({
        title: type === 'Library' ? "Welcome!" : "Queued",
        description: "Your visit has been logged successfully.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not log visit. Please try again.",
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

  if (isUserLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (checkedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
          <h2 className="text-3xl font-bold font-headline">Visit Logged!</h2>
          <Button onClick={() => setCheckedIn(false)} className="w-full">Check-in another visit</Button>
          <Button variant="ghost" onClick={handleLogout} className="w-full">Sign Out</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-0.5 rounded-full overflow-hidden">
              {logo && <Image src={logo.imageUrl} alt="Logo" width={32} height={32} />}
            </div>
            <h1 className="text-xl font-bold">LibTrack Portal</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-12 space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-primary mb-2">Check-in</h2>
          <p className="text-muted-foreground">Welcome, {userData?.fullName || user?.email}</p>
        </div>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid grid-cols-2 h-14 bg-white border mb-8 p-1 rounded-xl">
            <TabsTrigger value="library" className="text-lg"><Library className="mr-2" /> Library</TabsTrigger>
            <TabsTrigger value="dean" className="text-lg"><GraduationCap className="mr-2" /> Dean's Office</TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <Card className="border-t-4 border-t-primary">
              <CardHeader><CardTitle>Library Access</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <Select onValueChange={setDepartment} value={department}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                <Select onValueChange={setReason} value={reason}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select Reason" /></SelectTrigger>
                  <SelectContent>{VISIT_REASONS_LIBRARY.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={() => handleCheckIn('Library')} className="w-full h-14 text-xl font-bold" disabled={submitting}>
                  {submitting ? "Processing..." : "Submit Check-in"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dean">
            <Card className="border-t-4 border-t-accent">
              <CardHeader><CardTitle>Dean's Office Log</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <Input placeholder="Student/Employee ID" value={idNumber} onChange={e => setIdNumber(e.target.value)} className="h-12" />
                <Select onValueChange={setDepartment} value={department}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                <Select onValueChange={setReason} value={reason}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select Purpose" /></SelectTrigger>
                  <SelectContent>{VISIT_REASONS_DEAN.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={() => handleCheckIn('Dean')} className="w-full h-14 text-xl font-bold bg-accent" disabled={submitting}>
                  {submitting ? "Processing..." : "Request Appointment"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
