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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { Library, GraduationCap, CheckCircle2, LogOut, Loader2, User, Briefcase, Sparkles, Building2, ChevronRight } from 'lucide-react';
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
        title: "Validation Incomplete",
        description: "Please ensure all mandatory fields are populated.",
      });
      return;
    }

    if (!email.endsWith('@neu.edu.ph')) {
      toast({
        variant: "destructive",
        title: "Institutional Error",
        description: "Only @neu.edu.ph accounts are authorized for entry.",
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
        title: "Entry Logged",
        description: "Your visit has been successfully registered with OpenShelf.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "An error occurred while synchronizing your check-in.",
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

  if (isUserLoading) return <div className="min-h-screen flex flex-col items-center justify-center space-y-4"><Loader2 className="animate-spin h-10 w-10 text-primary" /><p className="text-sm font-medium">Validating Identity...</p></div>;

  if (checkedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-10 space-y-8 animate-in zoom-in-95 duration-500 border-none shadow-2xl">
          <div className="h-24 w-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-500/5">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold font-headline text-primary">Check-in Verified</h2>
            <p className="text-muted-foreground leading-relaxed">Your visit to the <strong>{department}</strong> has been officially recorded in the OpenShelf system.</p>
          </div>
          <div className="pt-4 space-y-4">
            <Button onClick={() => {
              setCheckedIn(false);
              setReason('');
            }} className="w-full h-14 text-lg rounded-xl shadow-lg">Submit New Log</Button>
            <Button variant="ghost" onClick={handleLogout} className="w-full h-14 text-muted-foreground font-semibold">Sign Out & Exit</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-primary text-white p-6 shadow-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-xl shadow-inner">
              {logo && <Image src={logo.imageUrl} alt="Logo" width={32} height={32} />}
            </div>
            <div>
               <h1 className="text-xl font-extrabold font-headline tracking-tight">OpenShelf <span className="text-accent">Portal</span></h1>
               <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Visitor Identification Service</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout} className="h-9 px-4 rounded-lg bg-white/10 hover:bg-white/20 border-none text-white">
            <LogOut className="h-4 w-4 mr-2" /> End Session
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="px-4 py-1 border-accent text-accent bg-accent/5 font-bold text-[10px] uppercase tracking-widest">Authorized Access Only</Badge>
          <h2 className="text-4xl font-extrabold text-primary font-headline sm:text-5xl">Digital Check-in</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Please confirm your institutional identity to proceed with your visit logging.</p>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <div className="h-2 bg-primary" />
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-headline flex items-center gap-3">
              <div className="bg-primary/5 p-2 rounded-xl text-primary"><User className="h-5 w-5" /></div>
              Primary Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Legal Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="e.g. Juan A. Dela Cruz" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)}
                  className="h-12 rounded-xl bg-slate-50 border-none shadow-inner focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitorEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Institutional Email Address</Label>
                <Input 
                  id="visitorEmail" 
                  type="email" 
                  placeholder="username@neu.edu.ph" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-slate-50 border-none shadow-inner focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Institutional Role</Label>
              <RadioGroup 
                defaultValue="student" 
                value={visitorType} 
                onValueChange={(v) => setVisitorType(v as 'student' | 'employee')}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className={`flex items-center space-x-3 border-2 p-4 rounded-2xl transition-all cursor-pointer ${visitorType === 'student' ? 'border-primary bg-primary/5' : 'border-slate-100'}`}>
                  <RadioGroupItem value="student" id="student" className="hidden" />
                  <Label htmlFor="student" className="flex items-center gap-3 cursor-pointer font-bold text-primary w-full">
                    <div className="bg-white p-2 rounded-lg shadow-sm"><GraduationCap className="h-5 w-5" /></div>
                    Current Student
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 border-2 p-4 rounded-2xl transition-all cursor-pointer ${visitorType === 'employee' ? 'border-accent bg-accent/5' : 'border-slate-100'}`}>
                  <RadioGroupItem value="employee" id="employee" className="hidden" />
                  <Label htmlFor="employee" className="flex items-center gap-3 cursor-pointer font-bold text-accent w-full">
                    <div className="bg-white p-2 rounded-lg shadow-sm"><Briefcase className="h-5 w-5" /></div>
                    Academic Staff
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid grid-cols-2 h-16 bg-white border-none p-2 rounded-2xl shadow-lg mb-12">
            <TabsTrigger value="library" className="text-base font-bold gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Library className="h-5 w-5" /> NEU Library
            </TabsTrigger>
            <TabsTrigger value="dean" className="text-base font-bold gap-3 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
              <Building2 className="h-5 w-5" /> Dean's Office
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
              <div className="bg-primary/5 px-8 py-6 flex items-center justify-between border-b">
                <div>
                   <CardTitle className="text-xl font-headline text-primary">Library Log</CardTitle>
                   <CardDescription className="font-medium">Registration for research, study, or asset use.</CardDescription>
                </div>
                <Sparkles className="h-8 w-8 text-primary/20" />
              </div>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Designated College Department</Label>
                  <Select onValueChange={setDepartment} value={department}>
                    <SelectTrigger className="h-14 rounded-xl bg-slate-50 border-none text-base font-semibold"><SelectValue placeholder="Select Department" /></SelectTrigger>
                    <SelectContent className="rounded-xl">{DEPARTMENTS.map(d => <SelectItem key={d} value={d} className="rounded-lg">{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Objective of Visit</Label>
                  <Select onValueChange={setReason} value={reason}>
                    <SelectTrigger className="h-14 rounded-xl bg-slate-50 border-none text-base font-semibold"><SelectValue placeholder="Select Objective" /></SelectTrigger>
                    <SelectContent className="rounded-xl">{VISIT_REASONS_LIBRARY.map(r => <SelectItem key={r} value={r} className="rounded-lg">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={() => handleCheckIn('Library')} className="w-full h-16 text-xl font-extrabold rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-100" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" /> : <>Complete Check-in <ChevronRight className="ml-2 h-6 w-6" /></>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dean" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
              <div className="bg-accent/5 px-8 py-6 flex items-center justify-between border-b">
                <div>
                   <CardTitle className="text-xl font-headline text-accent">Office Appointment</CardTitle>
                   <CardDescription className="font-medium text-slate-600">Administrative inquiries and dean consultations.</CardDescription>
                </div>
                <Building2 className="h-8 w-8 text-accent/20" />
              </div>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{visitorType === 'student' ? 'Student Registration Number' : 'Employee ID Number'}</Label>
                  <Input placeholder="20XX-XXXXX" value={idNumber} onChange={e => setIdNumber(e.target.value)} className="h-14 rounded-xl bg-slate-50 border-none font-mono text-lg shadow-inner" />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Designated College Department</Label>
                  <Select onValueChange={setDepartment} value={department}>
                    <SelectTrigger className="h-14 rounded-xl bg-slate-50 border-none text-base font-semibold"><SelectValue placeholder="Select Department" /></SelectTrigger>
                    <SelectContent className="rounded-xl">{DEPARTMENTS.map(d => <SelectItem key={d} value={d} className="rounded-lg">{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nature of Consultation</Label>
                  <Select onValueChange={setReason} value={reason}>
                    <SelectTrigger className="h-14 rounded-xl bg-slate-50 border-none text-base font-semibold"><SelectValue placeholder="Select Purpose" /></SelectTrigger>
                    <SelectContent className="rounded-xl">{VISIT_REASONS_DEAN.map(r => <SelectItem key={r} value={r} className="rounded-lg">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={() => handleCheckIn('Dean')} className="w-full h-16 text-xl font-extrabold bg-accent hover:bg-accent/90 text-white rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-100" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" /> : <>Request Consultation <ChevronRight className="ml-2 h-6 w-6" /></>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}