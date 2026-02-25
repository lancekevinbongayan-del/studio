
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { generateSummaryReport } from '@/ai/flows/generate-summary-report';
import { 
  Users, 
  Search, 
  UserX, 
  CheckCircle2, 
  Clock, 
  PieChart, 
  FileText,
  TrendingUp,
  LogOut,
  Sparkles,
  Loader2,
  Smartphone,
  Monitor,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const [searchTerm, setSearchTerm] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('stats');
  const logo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  // Real-time Firestore subscriptions
  const visitsQuery = useMemoFirebase(() => {
    return query(collection(db, 'visits'), orderBy('checkInTime', 'desc'));
  }, [db]);
  const { data: visitsData, isLoading: visitsLoading } = useCollection(visitsQuery);

  const usersQuery = useMemoFirebase(() => {
    return collection(db, 'users');
  }, [db]);
  const { data: usersData, isLoading: usersLoading } = useCollection(usersQuery);

  const sessionsQuery = useMemoFirebase(() => {
    return collection(db, 'user_sessions');
  }, [db]);
  const { data: sessionsData, isLoading: sessionsLoading } = useCollection(sessionsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?role=admin');
    }
  }, [user, isUserLoading, router]);

  const visits = visitsData || [];
  const users = usersData || [];
  const sessions = sessionsData || [];

  const stats = {
    total: visits.length,
    active: sessions.length,
    day: visits.filter(v => {
      const visitDate = v.checkInTime ? new Date(v.checkInTime) : new Date();
      return visitDate.toDateString() === new Date().toDateString();
    }).length,
    week: visits.filter(v => {
      const now = new Date();
      const visitDate = v.checkInTime ? new Date(v.checkInTime) : new Date();
      const diff = now.getTime() - visitDate.getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length,
  };

  const filteredUsers = users.filter(u => 
    (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockUser = async (userId: string, currentBlocked: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        blocked: !currentBlocked,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "User Management Updated",
        description: `User has been ${!currentBlocked ? 'blocked' : 'unblocked'}.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: "Permissions restricted. Are you an authorized admin?",
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
        title: "Status Updated",
        description: `Visitor status changed to ${status}`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update visit status.",
      });
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const result = await generateSummaryReport({
        visitLogs: JSON.stringify(visits.slice(0, 50))
      });
      setReport(result.summaryReport);
      setActiveTab('reports');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Report Failed",
        description: "Could not generate AI report. Please try again.",
      });
    } finally {
      setGeneratingReport(false);
    }
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
            <div className="bg-white p-0.5 rounded-full overflow-hidden flex items-center justify-center border border-accent">
              {logo && (
                <Image 
                  src={logo.imageUrl} 
                  alt={logo.description} 
                  width={32} 
                  height={32} 
                  data-ai-hint={logo.imageHint}
                  className="object-contain"
                />
              )}
            </div>
            <h1 className="text-2xl font-bold font-headline">LibTrack Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs opacity-70">Administrator</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 py-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Visitors</p>
                  <h3 className="text-3xl font-bold">{stats.total}</h3>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                  <h3 className="text-3xl font-bold">{stats.active}</h3>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Activity className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-accent shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Visits</p>
                  <h3 className="text-3xl font-bold">{stats.day}</h3>
                </div>
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <h3 className="text-3xl font-bold">{stats.week}</h3>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <PieChart className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border p-1 h-12 w-full sm:w-fit overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="stats" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Logs</TabsTrigger>
            <TabsTrigger value="active-sessions" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Active Sessions</TabsTrigger>
            <TabsTrigger value="dean-view" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dean's Desk</TabsTrigger>
            <TabsTrigger value="users" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Users</TabsTrigger>
            <TabsTrigger value="reports" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">AI Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="animate-in fade-in duration-300">
            <Card>
              <CardHeader>
                <CardTitle>Global Visitor Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map(visit => (
                      <TableRow key={visit.id}>
                        <TableCell className="text-xs">
                          {visit.checkInTime ? format(new Date(visit.checkInTime), 'MMM d, h:mm a') : 'N/A'}
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
          </TabsContent>

          <TabsContent value="active-sessions" className="animate-in fade-in duration-300">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Active Sessions</CardTitle>
                <CardDescription>Live monitoring of users currently logged into the portal.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
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
                        <TableCell className="text-right">
                          <Badge className="bg-green-500">Live</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {sessions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No active users.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dean-view" className="animate-in fade-in duration-300">
            <Card>
              <CardHeader>
                <CardTitle>Dean's Waiting Room</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.filter(v => v.studentEmployeeId).map(visit => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-mono text-sm">{visit.studentEmployeeId}</TableCell>
                        <TableCell>{visit.reason}</TableCell>
                        <TableCell>
                          <Badge className="capitalize">
                            {visit.status || 'waiting'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {(visit.status === 'waiting' || !visit.status) && (
                            <Button size="sm" onClick={() => handleUpdateVisitStatus(visit.id, 'in-meeting')}>Start</Button>
                          )}
                          {visit.status === 'in-meeting' && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateVisitStatus(visit.id, 'completed')}>End</Button>
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
                <CardTitle>User Directory</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search..." 
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
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="font-semibold">{u.fullName}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant={u.blocked ? "outline" : "destructive"} 
                            size="sm" 
                            onClick={() => handleBlockUser(u.id, !!u.blocked)}
                          >
                            {u.blocked ? "Unblock" : "Block"}
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
              <CardHeader>
                <Button onClick={handleGenerateReport} disabled={generatingReport} className="gap-2">
                  {generatingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate AI Summary
                </Button>
              </CardHeader>
              <CardContent>
                {report ? (
                  <div className="p-6 bg-slate-50 rounded-xl border shadow-inner whitespace-pre-wrap">
                    {report}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">Click generate to analyze trends.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
