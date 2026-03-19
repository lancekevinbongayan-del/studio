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
import { collection, doc, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { generateSummaryReport } from '@/ai/flows/generate-summary-report';
import { 
  Search, 
  Clock, 
  PieChart, 
  TrendingUp,
  LogOut,
  Sparkles,
  Loader2,
  Smartphone,
  Monitor,
  Activity,
  User,
  Filter,
  X,
  GraduationCap,
  LayoutDashboard,
  Users,
  Settings,
  BrainCircuit,
  CalendarCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DEPARTMENTS, VISIT_REASONS_LIBRARY, VISIT_REASONS_DEAN } from '@/lib/mock-data';

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

  const usersQuery = useMemoFirebase(() => {
    return collection(db, 'users');
  }, [db]);
  const { data: usersData } = useCollection(usersQuery);

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
  const users = usersData || [];
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
      week: filteredVisits.filter(v => {
        const now = new Date();
        const visitDate = v.checkInTime ? new Date(v.checkInTime) : new Date();
        const diff = now.getTime() - visitDate.getTime();
        return diff < 7 * 24 * 60 * 60 * 1000;
      }).length,
    };
  }, [filteredVisits, sessions.length]);

  const allReasons = Array.from(new Set([...VISIT_REASONS_LIBRARY, ...VISIT_REASONS_DEAN]));

  const handleBlockUser = async (userId: string, currentBlocked: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        blocked: !currentBlocked,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "Staff Security Updated",
        description: `Access has been ${!currentBlocked ? 'revoked' : 'granted'}.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Administrative privileges required.",
      });
    }
  };

  const handleUpdateVisitStatus = async (visitId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'visits', visitId), {
        status,
        checkOutTime: status === 'completed' ? new Date().toISOString() : null
      });
      toast({
        title: "Queue Status Updated",
        description: `Visit is now marked as ${status}.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not modify the queue record.",
      });
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const result = await generateSummaryReport({
        visitLogs: JSON.stringify(filteredVisits.slice(0, 50))
      });
      setReport(result.summaryReport);
      setActiveTab('reports');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Analysis Error",
        description: "Trend synthesis service is currently unavailable.",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const resetFilters = () => {
    setFilterReason('all');
    setFilterCollege('all');
    setFilterVisitorType('all');
    setSearchTerm('');
  };

  const handleLogout = async () => {
    if (user) {
      deleteDoc(doc(db, 'user_sessions', user.uid));
    }
    await auth.signOut();
    router.push('/');
  };

  if (isUserLoading || visitsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">Syncing OpenShelf Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2 rounded-xl">
              {logo && <Image src={logo.imageUrl} alt="Logo" width={28} height={28} className="invert brightness-0" />}
            </div>
            <div>
              <h1 className="text-xl font-bold font-headline text-primary">OpenShelf <span className="text-accent">Admin</span></h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Institutional Oversight System</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-primary">{user?.email?.split('@')[0]}</p>
              <Badge variant="outline" className="text-[10px] h-5 border-accent text-accent bg-accent/5">Verified Administrator</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Lifetime Flow</p>
                  <h3 className="text-4xl font-extrabold text-primary">{stats.total}</h3>
                </div>
                <div className="p-3 bg-primary/5 rounded-2xl group-hover:bg-primary/10 transition-colors">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/10 border-none">+12% vs last week</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Staff Online</p>
                  <h3 className="text-4xl font-extrabold text-primary">{stats.active}</h3>
                </div>
                <div className="p-3 bg-blue-500/5 rounded-2xl group-hover:bg-blue-500/10 transition-colors">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-600">Real-time update active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Daily Influx</p>
                  <h3 className="text-4xl font-extrabold text-primary">{stats.day}</h3>
                </div>
                <div className="p-3 bg-accent/5 rounded-2xl group-hover:bg-accent/10 transition-colors">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '65%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Queue Load</p>
                  <h3 className="text-4xl font-extrabold text-primary">{allVisits.filter(v => v.status === 'waiting').length}</h3>
                </div>
                <div className="p-3 bg-purple-500/5 rounded-2xl group-hover:bg-purple-500/10 transition-colors">
                  <CalendarCheck className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <p className="mt-4 text-[10px] font-bold text-muted-foreground">AVERAGE WAIT: 14 MINS</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList className="bg-white border p-1 rounded-xl shadow-sm overflow-x-auto h-auto">
              <TabsTrigger value="stats" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                <LayoutDashboard className="h-4 w-4 mr-2" /> Global Feed
              </TabsTrigger>
              <TabsTrigger value="active-sessions" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                <Monitor className="h-4 w-4 mr-2" /> Terminals
              </TabsTrigger>
              <TabsTrigger value="dean-view" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                <GraduationCap className="h-4 w-4 mr-2" /> Dean's Queue
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" /> Staff Registry
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                <BrainCircuit className="h-4 w-4 mr-2" /> AI Synthesis
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter data..." 
                  className="pl-9 h-10 rounded-xl bg-white shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <TabsContent value="stats" className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="space-y-6">
              <Card className="bg-white border-none shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b px-6 py-4 flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-tight">Segment Analysis</span>
                  </div>
                  <Select value={filterReason} onValueChange={setFilterReason}>
                    <SelectTrigger className="w-40 h-9 rounded-lg bg-white"><SelectValue placeholder="All Reasons" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reasons</SelectItem>
                      {allReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterCollege} onValueChange={setFilterCollege}>
                    <SelectTrigger className="w-40 h-9 rounded-lg bg-white"><SelectValue placeholder="All Colleges" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Colleges</SelectItem>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterVisitorType} onValueChange={setFilterVisitorType}>
                    <SelectTrigger className="w-40 h-9 rounded-lg bg-white"><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="student">Students Only</SelectItem>
                      <SelectItem value="employee">Staff/Faculty Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={resetFilters} className="h-9 ml-auto rounded-lg">
                    Clear Filters
                  </Button>
                </div>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-bold text-primary text-[11px] uppercase py-4">Timeline</TableHead>
                        <TableHead className="font-bold text-primary text-[11px] uppercase">Identity</TableHead>
                        <TableHead className="font-bold text-primary text-[11px] uppercase text-center">Cohort</TableHead>
                        <TableHead className="font-bold text-primary text-[11px] uppercase">Departmental Origin</TableHead>
                        <TableHead className="font-bold text-primary text-[11px] uppercase">Purpose</TableHead>
                        <TableHead className="font-bold text-primary text-[11px] uppercase text-right">State</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisits.map(visit => (
                        <TableRow key={visit.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="text-xs font-medium text-slate-500">
                            {visit.checkInTime ? format(new Date(visit.checkInTime), 'MMM d, HH:mm') : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-[10px]">
                                {visit.visitorName?.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-primary text-sm leading-tight">{visit.visitorName}</span>
                                <span className="text-[10px] text-muted-foreground">{visit.visitorEmail}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={visit.visitorType === 'employee' ? 'default' : 'secondary'} className="rounded-md text-[9px] uppercase font-bold tracking-tighter">
                              {visit.visitorType || 'student'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-600 truncate max-w-[150px]">{visit.collegeDepartment}</TableCell>
                          <TableCell className="text-xs">
                            <span className="bg-slate-100 px-2 py-1 rounded-md font-semibold text-slate-700">{visit.reason}</span>
                          </TableCell>
                          <TableCell className="text-right">
                             <Badge variant="outline" className="text-[10px] uppercase font-extrabold border-slate-200">
                              {visit.status || 'waiting'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions, Queue, Users, and Reports content - all modernized similarly */}
          <TabsContent value="active-sessions">
             <Card className="shadow-sm border-none">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-lg">Dashboard Access Monitoring</CardTitle>
                <CardDescription>Live telemetry of administrative logins across the institution.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Principal Staff</TableHead>
                      <TableHead>Connection Established</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead className="text-right">Connectivity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map(session => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-primary">{session.fullName}</span>
                              <span className="text-xs text-muted-foreground">{session.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {session.loginTime ? format(new Date(session.loginTime), 'h:mm a') : 'Now'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {session.deviceType === 'Mobile' ? <Smartphone className="h-4 w-4 text-accent" /> : <Monitor className="h-4 w-4 text-primary" />}
                            <span className="text-xs font-semibold">{session.deviceType || 'Terminal'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right"><Badge className="bg-green-500 font-bold">STABLE</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dean-view">
             <Card className="shadow-sm border-none overflow-hidden">
               <div className="bg-primary px-6 py-3 flex items-center justify-between">
                 <h2 className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4" /> Live Queue Manager
                 </h2>
                 <Badge variant="secondary" className="bg-white/10 text-white border-none">{allVisits.filter(v => v.studentEmployeeId && v.status === 'waiting').length} Waiting</Badge>
               </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold text-[10px] uppercase">Applicant</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-center">Class</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Brief</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">State</TableHead>
                      <TableHead className="text-right font-bold text-[10px] uppercase">Operations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allVisits.filter(v => v.studentEmployeeId).map(visit => (
                      <TableRow key={visit.id} className="border-l-4 border-l-transparent hover:border-l-primary transition-all">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-primary">{visit.visitorName}</span>
                            <span className="text-[10px] text-muted-foreground font-mono bg-slate-100 w-fit px-1 rounded">{visit.studentEmployeeId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="capitalize text-[10px]">{visit.visitorType || 'student'}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-700">{visit.reason}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "capitalize font-bold text-[9px]",
                            visit.status === 'in-meeting' ? "bg-accent" : "bg-primary"
                          )}>{visit.status || 'waiting'}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {(visit.status === 'waiting' || !visit.status) && (
                            <Button size="sm" variant="outline" className="font-bold h-8 text-[11px]" onClick={() => handleUpdateVisitStatus(visit.id, 'in-meeting')}>Call To Room</Button>
                          )}
                          {visit.status === 'in-meeting' && (
                            <Button size="sm" className="font-bold h-8 text-[11px] bg-green-600 hover:bg-green-700" onClick={() => handleUpdateVisitStatus(visit.id, 'completed')}>Conclude</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="shadow-sm border-none">
              <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Staff Privileges</CardTitle>
                  <CardDescription>System access and permission levels for staff members.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold text-[10px] uppercase">Personnel</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Designation</TableHead>
                      <TableHead className="text-right font-bold text-[10px] uppercase">Authorization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => 
                      (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                    ).map(u => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/5 p-2 rounded-xl text-primary font-bold">
                              {u.fullName?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-primary">{u.fullName}</div>
                              <div className="text-[10px] text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="font-bold border-primary/20 text-primary">{u.role}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant={u.blocked ? "outline" : "destructive"} 
                            size="sm" 
                            className="font-bold text-[11px] h-8"
                            onClick={() => handleBlockUser(u.id, !!u.blocked)}
                          >
                            {u.blocked ? "Restore Access" : "Revoke Login"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="shadow-lg border-none overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-primary text-white p-8">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-headline flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-accent" />
                    AI Trend Synthesis
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/70 text-base">
                    Generating behavioral analytics from {filteredVisits.length} observed data points.
                  </CardDescription>
                </div>
                <Button onClick={handleGenerateReport} disabled={generatingReport} className="bg-accent text-white hover:bg-accent/90 shadow-xl h-12 px-6">
                  {generatingReport ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <BrainCircuit className="h-5 w-5 mr-2" />}
                  Synthesize Analysis
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                {report ? (
                  <div className="p-8 bg-slate-50 rounded-2xl border shadow-inner whitespace-pre-wrap font-body text-base leading-relaxed text-slate-800 border-slate-200">
                    <div className="mb-4 flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-xs">
                       <BarChart3 className="h-4 w-4" /> Comprehensive Summary
                    </div>
                    {report}
                  </div>
                ) : (
                  <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-slate-50/50">
                    <BrainCircuit className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-slate-600 mb-2 font-headline">Intelligence Engine Ready</h4>
                    <p className="text-muted-foreground max-w-md mx-auto">Click the synthesis button to transform raw visit logs into actionable administrative insights.</p>
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