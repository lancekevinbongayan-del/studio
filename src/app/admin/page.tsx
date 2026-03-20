
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { generateSummaryReport } from '@/ai/flows/generate-summary-report';
import { 
  Search, 
  Clock, 
  TrendingUp,
  LogOut,
  Sparkles,
  Loader2,
  Activity,
  Filter,
  X,
  GraduationCap,
  LayoutDashboard,
  Users,
  BrainCircuit,
  CalendarCheck,
  BarChart3,
  Building2,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DEPARTMENTS, VISIT_REASONS_LIBRARY, VISIT_REASONS_DEAN } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [filterCollege, setFilterCollege] = useState('all');
  const [filterVisitorType, setFilterVisitorType] = useState('all');
  
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('stats');
  const logo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const visitsQuery = useMemoFirebase(() => {
    return query(collection(db, 'visits'), orderBy('checkInTime', 'desc'), limit(100));
  }, [db]);
  const { data: visitsData, isLoading: visitsLoading } = useCollection(visitsQuery);

  const sessionsQuery = useMemoFirebase(() => {
    return collection(db, 'user_sessions');
  }, [db]);
  const { data: sessionsData } = useCollection(sessionsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const allVisits = visitsData || [];
  const sessions = sessionsData || [];

  const filteredVisits = useMemo(() => {
    return allVisits.filter(v => {
      const matchReason = filterReason === 'all' || v.reason === filterReason;
      const matchCollege = filterCollege === 'all' || v.collegeDepartment === filterCollege;
      const matchVisitorType = filterVisitorType === 'all' || v.visitorType === filterVisitorType;
      const matchSearch = (v.visitorName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (v.visitorEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchReason && matchCollege && matchVisitorType && matchSearch;
    });
  }, [allVisits, filterReason, filterCollege, filterVisitorType, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: filteredVisits.length,
      active: sessions.length,
      day: filteredVisits.filter(v => {
        const visitDate = v.checkInTime ? new Date(v.checkInTime) : new Date();
        return visitDate.toDateString() === new Date().toDateString();
      }).length,
    };
  }, [filteredVisits, sessions.length]);

  const allReasons = Array.from(new Set([...VISIT_REASONS_LIBRARY, ...VISIT_REASONS_DEAN]));

  const handleLogout = async () => {
    if (user) {
      await deleteDoc(doc(db, 'user_sessions', user.uid)).catch(() => {});
    }
    await auth.signOut();
    router.push('/');
  };

  if (isUserLoading || visitsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-black tracking-widest text-primary uppercase animate-pulse">Establishing OpenShelf Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      <header className="bg-white border-b sticky top-0 z-50 px-8 py-5">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="bg-primary p-2.5 rounded-2xl shadow-lg">
              {logo && <Image src={logo.imageUrl} alt="Logo" width={32} height={32} className="invert brightness-0" />}
            </div>
            <div>
              <h1 className="text-2xl font-black font-headline text-primary tracking-tight">OpenShelf <span className="text-accent">Admin</span></h1>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Institutional Governance Console</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-primary">{user?.email}</p>
              <Badge variant="outline" className="text-[9px] h-5 border-accent text-accent bg-accent/5 font-black uppercase tracking-tighter">System Administrator</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="font-bold text-slate-500 hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-8 space-y-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="relative overflow-hidden group border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-8 px-8 pb-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Global Volume</p>
                  <h3 className="text-5xl font-black text-primary">{stats.total}</h3>
                </div>
                <div className="p-4 bg-primary/5 rounded-3xl group-hover:bg-primary/10 transition-colors">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-600 border-none font-bold text-[10px]">INFLUX STABLE</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden group border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-8 px-8 pb-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Active Staff</p>
                  <h3 className="text-5xl font-black text-primary">{stats.active}</h3>
                </div>
                <div className="p-4 bg-blue-500/5 rounded-3xl group-hover:bg-blue-500/10 transition-colors">
                  <Activity className="h-7 w-7 text-blue-500" />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Real-time Telemetry</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-8 px-8 pb-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Daily Intake</p>
                  <h3 className="text-5xl font-black text-primary">{stats.day}</h3>
                </div>
                <div className="p-4 bg-accent/5 rounded-3xl group-hover:bg-accent/10 transition-colors">
                  <Clock className="h-7 w-7 text-accent" />
                </div>
              </div>
              <div className="mt-8">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '65%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-8 px-8 pb-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Pending Queue</p>
                  <h3 className="text-5xl font-black text-primary">{allVisits.filter(v => v.status === 'waiting').length}</h3>
                </div>
                <div className="p-4 bg-purple-500/5 rounded-3xl group-hover:bg-purple-500/10 transition-colors">
                  <CalendarCheck className="h-7 w-7 text-purple-500" />
                </div>
              </div>
              <p className="mt-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Consultation Load</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <TabsList className="bg-white border p-1.5 rounded-2xl shadow-sm h-auto flex flex-wrap">
              <TabsTrigger value="stats" className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <LayoutDashboard className="h-4 w-4 mr-2" /> Live Monitor
              </TabsTrigger>
              <TabsTrigger value="dean-view" className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <GraduationCap className="h-4 w-4 mr-2" /> Dean's Queue
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <BrainCircuit className="h-4 w-4 mr-2" /> AI Synthesis
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3 w-full xl:w-auto">
              <div className="relative flex-1 xl:w-80">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search visitor registry..." 
                  className="pl-11 h-12 rounded-2xl bg-white border-none shadow-sm font-medium focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <TabsContent value="stats" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-white border-none shadow-sm overflow-hidden rounded-3xl">
              <div className="bg-slate-50/50 border-b px-8 py-6 flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Log Filters</span>
                </div>
                <Select value={filterReason} onValueChange={setFilterReason}>
                  <SelectTrigger className="w-48 h-10 rounded-xl bg-white border-slate-200 font-bold text-xs"><SelectValue placeholder="Reason for Visit" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Objectives</SelectItem>
                    {allReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterCollege} onValueChange={setFilterCollege}>
                  <SelectTrigger className="w-56 h-10 rounded-xl bg-white border-slate-200 font-bold text-xs"><SelectValue placeholder="Department/College" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Academic Units</SelectItem>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterVisitorType} onValueChange={setFilterVisitorType}>
                  <SelectTrigger className="w-40 h-10 rounded-xl bg-white border-slate-200 font-bold text-xs"><SelectValue placeholder="Visitor Role" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Cohorts</SelectItem>
                    <SelectItem value="student">Student Body</SelectItem>
                    <SelectItem value="employee">Staff & Faculty</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => { setFilterReason('all'); setFilterCollege('all'); setFilterVisitorType('all'); setSearchTerm(''); }} className="ml-auto font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors">
                  <X className="h-3 w-3 mr-1" /> Reset All
                </Button>
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/30">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="font-black text-slate-400 text-[10px] uppercase py-6 px-8 tracking-widest">Entry Timestamp</TableHead>
                      <TableHead className="font-black text-slate-400 text-[10px] uppercase px-8 tracking-widest">Identity</TableHead>
                      <TableHead className="font-black text-slate-400 text-[10px] uppercase text-center tracking-widest">Cohort</TableHead>
                      <TableHead className="font-black text-slate-400 text-[10px] uppercase px-8 tracking-widest">Academic Unit</TableHead>
                      <TableHead className="font-black text-slate-400 text-[10px] uppercase px-8 tracking-widest">Objective</TableHead>
                      <TableHead className="font-black text-slate-400 text-[10px] uppercase text-right px-8 tracking-widest">Authorization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map(visit => (
                      <TableRow key={visit.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                        <TableCell className="text-xs font-bold text-slate-400 px-8">
                          {visit.checkInTime ? format(new Date(visit.checkInTime), 'MMM d, HH:mm') : '—'}
                        </TableCell>
                        <TableCell className="px-8">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-xs shadow-sm">
                              {visit.visitorName?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-primary text-sm tracking-tight">{visit.visitorName}</span>
                              <span className="text-[10px] font-bold text-slate-400">{visit.visitorEmail}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center px-8">
                          <Badge variant={visit.visitorType === 'employee' ? 'default' : 'secondary'} className="rounded-lg text-[9px] uppercase font-black px-2 py-0.5">
                            {visit.visitorType || 'student'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-600 px-8">{visit.collegeDepartment}</TableCell>
                        <TableCell className="px-8">
                          <span className="bg-slate-100 px-3 py-1.5 rounded-xl font-black text-[10px] text-slate-700 uppercase tracking-tighter">{visit.reason}</span>
                        </TableCell>
                        <TableCell className="text-right px-8">
                           <Badge className={cn(
                             "capitalize font-bold text-[9px] px-3",
                             visit.status === 'completed' ? "bg-green-500" : visit.status === 'in-meeting' ? "bg-accent" : "bg-primary"
                           )}>
                            {visit.status || 'waiting'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredVisits.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center gap-4 text-slate-300">
                            <BarChart3 className="h-12 w-12 opacity-20" />
                            <p className="font-black text-xs uppercase tracking-widest">No matching logs identified</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="shadow-2xl border-none overflow-hidden rounded-[2.5rem]">
              <CardHeader className="flex flex-col md:flex-row items-center justify-between bg-primary text-white p-12 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent p-2 rounded-xl"><Sparkles className="h-6 w-6 text-white" /></div>
                    <CardTitle className="text-3xl font-headline font-black">AI Behavioral Synthesis</CardTitle>
                  </div>
                  <CardDescription className="text-primary-foreground/60 text-lg font-medium max-w-xl leading-relaxed">
                    Transforming raw facility logs into strategic administrative intelligence.
                  </CardDescription>
                </div>
                <Button onClick={async () => {
                  setGeneratingReport(true);
                  try {
                    const result = await generateSummaryReport({ visitLogs: JSON.stringify(filteredVisits.slice(0, 50)) });
                    setReport(result.summaryReport);
                  } catch {
                    toast({ variant: "destructive", title: "Synthesis Error", description: "The intelligence engine is currently recalibrating." });
                  } finally { setGeneratingReport(false); }
                }} disabled={generatingReport} className="bg-accent text-white hover:bg-accent/90 shadow-2xl h-16 px-10 rounded-2xl text-lg font-black tracking-tight w-full md:w-auto transition-transform active:scale-95">
                  {generatingReport ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <BrainCircuit className="h-6 w-6 mr-3" />}
                  Synthesize Analysis
                </Button>
              </CardHeader>
              <CardContent className="p-12">
                {report ? (
                  <div className="p-12 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-inner whitespace-pre-wrap font-medium text-lg leading-loose text-slate-800">
                    <div className="mb-8 flex items-center gap-2 text-accent font-black uppercase tracking-widest text-[11px]">
                       <BarChart3 className="h-5 w-5" /> Executive Summary Ready
                    </div>
                    {report}
                  </div>
                ) : (
                  <div className="text-center py-32 border-4 border-dashed rounded-[3rem] bg-slate-50/50 border-slate-200">
                    <BrainCircuit className="h-20 w-20 text-slate-200 mx-auto mb-6" />
                    <h4 className="text-2xl font-black text-slate-400 mb-3 font-headline">Intelligence Engine Standby</h4>
                    <p className="text-slate-400 max-w-sm mx-auto font-medium">Click synthesize to process observed data points and identify facility trends.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
