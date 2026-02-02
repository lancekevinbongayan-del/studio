import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { LogIn, Library, ShieldCheck, GraduationCap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary rounded-2xl shadow-xl mb-4">
            <Library className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-primary font-headline">LibTrack Analytics</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive visitor management and analytics for NEU Library and Academic Offices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-primary">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                <GraduationCap className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-headline">Visitor Portal</CardTitle>
              <CardDescription>Check-in for library access or dean's office appointments.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Easy check-in for students and faculty. Track your visits and stay informed about facility availability.</p>
            </CardContent>
            <CardFooter>
              <Link href="/login?role=visitor" className="w-full">
                <Button className="w-full text-lg h-12 gap-2">
                  <LogIn className="h-5 w-5" />
                  Visitor Login
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-accent">
            <CardHeader>
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                <ShieldCheck className="text-accent h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-headline">Admin Control</CardTitle>
              <CardDescription>Real-time analytics and user management dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Access detailed statistics, manage user access, and generate AI-powered reports for institutional planning.</p>
            </CardContent>
            <CardFooter>
              <Link href="/login?role=admin" className="w-full">
                <Button variant="outline" className="w-full text-lg h-12 gap-2 border-primary text-primary hover:bg-primary/5">
                  <LogIn className="h-5 w-5" />
                  Admin Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <footer className="text-center text-muted-foreground pt-12">
          <p>© {new Date().getFullYear()} NEU Library Visitor Management System</p>
          <p className="text-sm">Restricted to institutional email accounts (@neu.edu.ph)</p>
        </footer>
      </div>
    </div>
  );
}