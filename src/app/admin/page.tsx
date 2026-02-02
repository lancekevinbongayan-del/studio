"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { store } from '@/lib/store';
import { generateSummaryReport } from '@/ai/flows/generate-summary-report';
import { 
  Users, 
  Library, 
  Search, 
  UserX, 
  CheckCircle2, 
  Clock, 
  PieChart, 
  FileText,
  TrendingUp,
  MoreVertical,
  LogOut,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const user = store.getCurrentUser();
  const [visits, setVisits] = useState(store.getVisits());
  const [users, setUsers] = useState(store.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      router.push('/');
    }
  }, [user, router]);

  const stats = {
    total: visits.length,
    day: visits.filter(v => new Date(v.timestamp).toDateString() === new Date().toDateString()).length,
    week: visits.filter(v => {
      const now = new Date();
      const visitDate = new Date(v.timestamp);
      const diff = now.getTime() - visitDate.getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length,
    month: visits.filter(v => {
      const now = new Date();
      const visitDate = new Date(v.timestamp);
      return now.getMonth() === visitDate.getMonth() && now.getFullYear() === visitDate.getFullYear();
    }).length,
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockUser = (userId: string) => {
    store.blockUser(userId);
    setUsers([...store.getUsers()]);
    toast({
      title: "User Management Updated",
      description: "User status has been successfully toggled.",
    });
  };

  const handleUpdateVisitStatus = (visitId: string, status: any) => {
    store.updateVisitStatus(visitId, status);
    setVisits([...store.getVisits()]);
    toast({
      title: "Status Updated",
      description: `Visitor status changed to ${status}`,
    });
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const result = await generateSummaryReport({
        visitLogs: JSON.stringify(visits)
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

  const handleLogout = () => {
    store.setCurrentUser(null);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Library className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-bold font-headline">LibTrack Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
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
          <Card className="bg-white border-l-4 border-l-primary">
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
          <Card className="bg-white border-l-4 border-l-accent">
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
          <Card className="bg-white border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <h3 className="text-3xl font-bold">{stats.week}</h3>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <PieChart className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <h3 className="text-3xl font-bold">{stats.month}</h3>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="bg-white border p-1 h-12 w-fit">
              <TabsTrigger value="stats" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Real-time Logs</TabsTrigger>
              <TabsTrigger value="dean-view" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dean's Desk</TabsTrigger>
              <TabsTrigger value="users" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">User Management</TabsTrigger>
              <TabsTrigger value="reports" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Reports</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateReport} 
                disabled={generatingReport}
                className="bg-accent hover:bg-accent/90 text-white gap-2 h-12 px-6"
              >
                <Sparkles className="h-5 w-5" />
                {generatingReport ? "Generating..." : "AI Summary Report"}
              </Button>
            </div>
          </div>

          <TabsContent value="stats" className="animate-in fade-in duration-300">
            <Card>
              <CardHeader>
                <CardTitle>Global Visitor Logs</CardTitle>
                <CardDescription>Real-time stream of library and office visits.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Facility</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map(visit => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium text-xs">
                          {format(new Date(visit.timestamp), 'MMM d, h:mm a')}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{visit.userName}</div>
                          <div className="text-xs text-muted-foreground">{visit.userEmail}</div>
                        </TableCell>
                        <TableCell className="text-xs">{visit.department}</TableCell>
                        <TableCell>
                          <Badge variant={visit.type === 'Library' ? 'default' : 'secondary'} className="rounded-md">
                            {visit.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{visit.reason}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`rounded-md ${
                              visit.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                              visit.status === 'In-Meeting' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-orange-50 text-orange-700 border-orange-200'
                            }`}
                          >
                            {visit.status}
                          </Badge>
                        </TableCell>
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
                <CardDescription>Active appointments and visitor queue management.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Wait Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.filter(v => v.type === 'Dean').map(visit => (
                      <TableRow key={visit.id}>
                        <TableCell>
                          <div className="font-semibold">{visit.userName}</div>
                          <div className="text-xs text-muted-foreground">{visit.department}</div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{visit.idNumber || 'N/A'}</TableCell>
                        <TableCell>{visit.reason}</TableCell>
                        <TableCell className="text-xs">
                          {format(new Date(visit.timestamp), 'h:mm a')}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            visit.status === 'Waiting' ? 'bg-orange-500' : 
                            visit.status === 'In-Meeting' ? 'bg-blue-500' : 'bg-green-500'
                          }>
                            {visit.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {visit.status === 'Waiting' && (
                            <Button size="sm" onClick={() => handleUpdateVisitStatus(visit.id, 'In-Meeting')}>Start Meeting</Button>
                          )}
                          {visit.status === 'In-Meeting' && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateVisitStatus(visit.id, 'Completed')}>Complete</Button>
                          )}
                          {visit.status === 'Completed' && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 inline-block" />
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Institutional User Directory</CardTitle>
                  <CardDescription>Search and manage access for students and staff.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name..." 
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
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold">{u.name}</div>
                              <div className="text-xs text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {u.isBlocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant={u.isBlocked ? "outline" : "destructive"} 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleBlockUser(u.id)}
                            disabled={u.role === 'Admin'}
                          >
                            <UserX className="h-4 w-4" />
                            {u.isBlocked ? "Unblock" : "Block User"}
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
            <Card className="border-accent/20">
              <CardHeader className="bg-accent/5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <Badge variant="outline" className="border-accent text-accent">AI Generated</Badge>
                </div>
                <CardTitle className="text-2xl font-headline">Institutional Usage Report</CardTitle>
                <CardDescription>Generated {format(new Date(), 'PPP')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {report ? (
                  <div className="prose max-w-none prose-blue">
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-700 font-body p-6 bg-slate-50 rounded-xl border">
                      {report}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                    <div className="p-4 bg-accent/10 rounded-full">
                      <FileText className="h-12 w-12 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">No Report Generated</h3>
                      <p className="text-muted-foreground">Click the "AI Summary Report" button to analyze visitor trends.</p>
                    </div>
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