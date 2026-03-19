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
  GraduationCap
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

  // Real-time Firestore subscriptions
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
        title: "Security Updated",
        description: `User access has been ${!currentBlocked ? 'restricted' : 'restored'}.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unauthorized Action",
        description: "You do not have permission to modify user access.",
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
        title: "Visit Updated",
        description: `Status changed to ${status}`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not modify visit record.",
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
        title: "AI Analysis Failed",
        description: "Could not analyze trends at this time.",
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-0.5 rounded-full overflow-hidden flex items-center justify-center">
              {logo && <Image src={logo.imageUrl} alt="Logo" width={32} height={32} />}
            </div>
            <h1 className="text-2xl font-bold font-headline">OpenShelf Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.email}</p>
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/20">Admin</Badge>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 py-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-l-4 border-l-primary shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Visitors</p>
                  <h3 className="text-3xl font-bold">{stats.total}</h3>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="h-6 w-6 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                  <h3 className="text-3xl font-bold">{stats.active}</h3>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg"><Activity className="h-6 w-6 text-green-500" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-accent shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Visits</p>
                  <h3 className="text-3xl font-bold">{stats.day}</h3>
                </div>
                <div className="p-2 bg-accent/10 rounded-lg"><Clock className="h-6 w-6 text-accent" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Weekly Volume</p>
                  <h3 className="text-3xl font-bold">{stats.week}</h3>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg"><PieChart className="h-6 w-6 text-purple-500" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border p-1 h-12 w-full sm:w-fit overflow-x-auto">
            <TabsTrigger value="stats" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Visits</TabsTrigger>
            <TabsTrigger value="active-sessions" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Live Sessions</TabsTrigger>
            <TabsTrigger value="dean-view" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dean's Desk</TabsTrigger>
            <TabsTrigger value="users" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Staff Directory</TabsTrigger>
            <TabsTrigger value="reports" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">AI Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="animate-in fade-in duration-300">
            <div className="space-y-4">
              <Card className="bg-slate-50 border-dashed">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Filter className="h-3 w-3" /> Reason
                      </label>
                      <Select value={filterReason} onValueChange={setFilterReason}>
                        <SelectTrigger className="bg-white"><SelectValue placeholder="All Reasons" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Reasons</SelectItem>
                          {allReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" /> College
                      </label>
                      <Select value={filterCollege} onValueChange={setFilterCollege}>
                        <SelectTrigger className="bg-white"><SelectValue placeholder="All Colleges" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Colleges</SelectItem>
                          {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> Visitor Type
                      </label>
                      <Select value={filterVisitorType} onValueChange={setFilterVisitorType}>
                        <SelectTrigger className="bg-white"><SelectValue placeholder="Any Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Type</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="employee">Employee (Staff/Teacher)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search name/email..." 
                          className="pl-8 bg-white" 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filters">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Global Visitor Logs</CardTitle>
                    <CardDescription>
                      Showing {filteredVisits.length} matching visit records.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Visitor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisits.map(visit => (
                        <TableRow key={visit.id}>
                          <TableCell className="text-xs">
                            {visit.checkInTime ? format(new Date(visit.checkInTime), 'MMM d, h:mm a') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{visit.visitorName}</span>
                              <span className="text-[10px] text-muted-foreground">{visit.visitorEmail}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={visit.visitorType === 'employee' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                              {visit.visitorType || 'student'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{visit.collegeDepartment}</TableCell>
                          <TableCell className="text-sm">{visit.reason}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
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

          <TabsContent value="active-sessions" className="animate-in fade-in duration-300">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Admin Activity</CardTitle>
                <CardDescription>Monitoring authorized staff currently managing the dashboard.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Login Time</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map(session => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{session.fullName}</span>
                            <span className="text-xs text-muted-foreground">{session.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {session.loginTime ? format(new Date(session.loginTime), 'h:mm a') : 'Now'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {session.deviceType === 'Mobile' ? <Smartphone className="h-4 w-4 text-accent" /> : <Monitor className="h-4 w-4 text-primary" />}
                            <span className="text-xs">{session.deviceType || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right"><Badge className="bg-green-500">Active</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dean-view" className="animate-in fade-in duration-300">
            <Card>
              <CardHeader>
                <CardTitle>Dean's Waiting Room</CardTitle>
                <CardDescription>Live queue for appointments with the Dean's Office.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allVisits.filter(v => v.studentEmployeeId).map(visit => (
                      <TableRow key={visit.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{visit.visitorName}</span>
                            <span className="text-xs text-muted-foreground font-mono">{visit.studentEmployeeId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={visit.visitorType === 'employee' ? 'default' : 'secondary'} className="capitalize">
                            {visit.visitorType || 'student'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{visit.reason}</TableCell>
                        <TableCell><Badge className="capitalize">{visit.status || 'waiting'}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                          {(visit.status === 'waiting' || !visit.status) && (
                            <Button size="sm" onClick={() => handleUpdateVisitStatus(visit.id, 'in-meeting')}>Call In</Button>
                          )}
                          {visit.status === 'in-meeting' && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateVisitStatus(visit.id, 'completed')}>End Meeting</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="animate-in fade-in duration-300">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Staff Management</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filter staff..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                            <div className="bg-primary/10 p-1.5 rounded-full"><User className="h-4 w-4 text-primary" /></div>
                            <div>
                              <div className="font-semibold">{u.fullName}</div>
                              <div className="text-xs text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant={u.blocked ? "outline" : "destructive"} 
                            size="sm" 
                            onClick={() => handleBlockUser(u.id, !!u.blocked)}
                          >
                            {u.blocked ? "Unblock" : "Restrict Access"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="animate-in fade-in duration-300">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>AI Trend Analysis</CardTitle>
                  <CardDescription>Generative summary of visitor volume and peak hours.</CardDescription>
                </div>
                <Button onClick={handleGenerateReport} disabled={generatingReport} className="gap-2 bg-primary">
                  {generatingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Analyze Current Filter
                </Button>
              </CardHeader>
              <CardContent>
                {report ? (
                  <div className="p-6 bg-slate-50 rounded-xl border shadow-inner whitespace-pre-wrap font-body text-sm leading-relaxed text-slate-700">
                    {report}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">Click the analysis button to process the filtered visitor logs.</p>
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
