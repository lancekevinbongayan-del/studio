
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
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
    }
  }, [user, isUserLoading, router]);

  const handleCheckIn = async (type: 'Library' | 'Dean') => {
    if (!fullName || !email || !department || !reason || (type === 'Dean' && !idNumber)) {
      toast({ variant: "destructive", title: "Information Required", description: "Please ensure all mandatory fields are correctly populated." });
      return;
    }

    if (!email.toLowerCase().endsWith('@neu.edu.ph')) {
      toast({ variant: "destructive", title: "Institutional Error", description: "Only verified @neu.edu.ph accounts are authorized for entry." });
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
      toast({ title: "Check-in Successful", description: "Your visit has been officially registered with OpenShelf." });
    } catch (err) {
      toast({ variant: "destructive", title: "Submission Failed", description: "A network error occurred while synchronizing your log." });
    } finally {
      setSubmitting(false);
    }
  };

  if (isUserLoading) return <div className="min-h-screen flex flex-col items-center justify-center gap-6"><Loader2 className="animate-spin h-12 w-12 text-primary" /><p className="text-sm font-black tracking-widest uppercase">Validating Identity...</p></div>;

  if (checkedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="max-w-xl w-full text-center p-16 space-y-10 animate-in zoom-in-95 duration-500 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[3rem]">
          <div className="h-32 w-32 bg-green-500/10 rounded-full flex items-center justify-center mx-auto ring-[16px] ring-green-500/5">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black font-headline text-primary tracking-tight">Welcome to NEU Library!</h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-sm mx-auto">Your visit to <strong>{department}</strong> has been successfully recorded in the OpenShelf system.</p>
          </div>
          <div className="pt-6 space-y-4">
            <Button onClick={() => { setCheckedIn(false); setReason(''); }} className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">Log Another Visit</Button>
            <Button variant="ghost" onClick={() => auth.signOut().then(() => router.push('/'))} className="w-full h-16 text-slate-400 font-black uppercase tracking-widest text-xs">End Session & Sign Out</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-primary text-white p-8 shadow-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="bg-white p-1.5 rounded-2xl shadow-inner">
              {logo && <Image src={logo.imageUrl} alt="Logo" width={36} height={36} />}
            </div>
            <div>
               <h1 className="text-2xl font-black font-headline tracking-tighter">OpenShelf <span className="text-accent">Portal</span></h1>
               <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-50">Identification Management</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => auth.signOut().then(() => router.push('/'))} className="h-11 px-6 rounded-xl bg-white/10 hover:bg-white/20 border-none text-white font-bold">
            <LogOut className="h-4 w-4 mr-2" /> Exit Portal
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-8 py-16 space-y-16">
        <div className="text-center space-y-6">
          <Badge variant="outline" className="px-5 py-1.5 border-accent text-accent bg-accent/5 font-black text-[10px] uppercase tracking-[0.3em] rounded-full">Institutional Identity Verification</Badge>
          <h2 className="text-5xl font-black text-primary font-headline tracking-tighter sm:text-6xl">Digital Check-in</h2>
          <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">Please provide your academic credentials to proceed with facility entry.</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <div className="h-2.5 bg-primary" />
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-2xl font-black font-headline flex items-center gap-4">
              <div className="bg-primary/5 p-3 rounded-2xl text-primary"><User className="h-6 w-6" /></div>
              Primary Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-6 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-[11px] font-black uppercase tracking-widest text-slate-400">Legal Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="Juan A. Dela Cruz" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner focus-visible:ring-2 focus-visible:ring-primary font-bold px-6"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="visitorEmail" className="text-[11px] font-black uppercase tracking-widest text-slate-400">Institutional Email (@neu.edu.ph)</Label>
                <Input 
                  id="visitorEmail" 
                  type="email" 
                  placeholder="username@neu.edu.ph" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner focus-visible:ring-2 focus-visible:ring-primary font-bold px-6"
                />
              </div>
            </div>

            <div className="space-y-6">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Academic Classification</Label>
              <RadioGroup 
                defaultValue="student" 
                value={visitorType} 
                onValueChange={(v) => setVisitorType(v as 'student' | 'employee')}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <div className={`flex items-center space-x-3 border-4 p-6 rounded-[2rem] transition-all cursor-pointer ${visitorType === 'student' ? 'border-primary bg-primary/5' : 'border-slate-50 bg-slate-50'}`}>
                  <RadioGroupItem value="student" id="student" className="hidden" />
                  <Label htmlFor="student" className="flex items-center gap-4 cursor-pointer font-black text-primary w-full text-lg">
                    <div className="bg-white p-3 rounded-2xl shadow-md"><GraduationCap className="h-6 w-6" /></div>
                    Current Student
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 border-4 p-6 rounded-[2rem] transition-all cursor-pointer ${visitorType === 'employee' ? 'border-accent bg-accent/5' : 'border-slate-50 bg-slate-50'}`}>
                  <RadioGroupItem value="employee" id="employee" className="hidden" />
                  <Label htmlFor="employee" className="flex items-center gap-4 cursor-pointer font-black text-accent w-full text-lg">
                    <div className="bg-white p-3 rounded-2xl shadow-md"><Briefcase className="h-6 w-6" /></div>
                    Academic Staff
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid grid-cols-2 h-20 bg-white border border-slate-200 p-2.5 rounded-[2.5rem] shadow-xl mb-16">
            <TabsTrigger value="library" className="text-lg font-black gap-4 rounded-[1.8rem] data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Library className="h-6 w-6" /> NEU Library
            </TabsTrigger>
            <TabsTrigger value="dean" className="text-lg font-black gap-4 rounded-[1.8rem] data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
              <Building2 className="h-6 w-6" /> Dean's Office
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
              <div className="bg-primary/5 px-10 py-8 flex items-center justify-between border-b border-primary/10">
                <div>
                   <CardTitle className="text-2xl font-black font-headline text-primary">Library Session</CardTitle>
                   <CardDescription className="font-bold text-slate-500 mt-1">Research, independent study, or facility usage.</CardDescription>
                </div>
                <Sparkles className="h-10 w-10 text-primary/20" />
              </div>
              <CardContent className="p-12 space-y-10">
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Academic Department</Label>
                  <Select onValueChange={setDepartment} value={department}>
                    <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none text-lg font-black px-8 focus:ring-2 focus:ring-primary"><SelectValue placeholder="Select Academic Unit" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{DEPARTMENTS.map(d => <SelectItem key={d} value={d} className="rounded-xl font-bold py-3">{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Objective for Visit</Label>
                  <Select onValueChange={setReason} value={reason}>
                    <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none text-lg font-black px-8 focus:ring-2 focus:ring-primary"><SelectValue placeholder="Select Primary Objective" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{VISIT_REASONS_LIBRARY.map(r => <SelectItem key={r} value={r} className="rounded-xl font-bold py-3">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={() => handleCheckIn('Library')} className="w-full h-20 text-2xl font-black rounded-[2rem] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01]" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin h-8 w-8" /> : <>Log Library Session <ChevronRight className="ml-2 h-8 w-8" /></>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dean" className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
              <div className="bg-accent/5 px-10 py-8 flex items-center justify-between border-b border-accent/10">
                <div>
                   <CardTitle className="text-2xl font-black font-headline text-accent">Office Appointment</CardTitle>
                   <CardDescription className="font-bold text-slate-500 mt-1">Consultations and administrative inquiries.</CardDescription>
                </div>
                <Building2 className="h-10 w-10 text-accent/20" />
              </div>
              <CardContent className="p-12 space-y-10">
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{visitorType === 'student' ? 'Student Registration Number' : 'Employee Identification'}</Label>
                  <Input placeholder="20XX-XXXXX" value={idNumber} onChange={e => setIdNumber(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-none font-black text-xl px-8 shadow-inner tracking-widest" />
                </div>
                <div className="space-y-3">
                   <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Academic Department</Label>
                  <Select onValueChange={setDepartment} value={department}>
                    <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none text-lg font-black px-8 focus:ring-2 focus:ring-accent"><SelectValue placeholder="Select Academic Unit" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{DEPARTMENTS.map(d => <SelectItem key={d} value={d} className="rounded-xl font-bold py-3">{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Consultation Nature</Label>
                  <Select onValueChange={setReason} value={reason}>
                    <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none text-lg font-black px-8 focus:ring-2 focus:ring-accent"><SelectValue placeholder="Select Consultation Purpose" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{VISIT_REASONS_DEAN.map(r => <SelectItem key={r} value={r} className="rounded-xl font-bold py-3">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={() => handleCheckIn('Dean')} className="w-full h-20 text-2xl font-black bg-accent hover:bg-accent/90 text-white rounded-[2rem] shadow-2xl shadow-accent/20 transition-all hover:scale-[1.01]" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin h-8 w-8" /> : <>Request Appointment <ChevronRight className="ml-2 h-8 w-8" /></>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
