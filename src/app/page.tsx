"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { LogIn, ShieldCheck, GraduationCap, ArrowRight, Library, BarChart3, Clock } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function Home() {
  const router = useRouter();
  const auth = useAuth();
  const logo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const handleVisitorPortalAccess = () => {
    initiateAnonymousSignIn(auth);
    router.push('/visitor');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-24 sm:py-32">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white p-2 shadow-2xl ring-4 ring-accent/20">
            {logo && (
              <Image 
                src={logo.imageUrl} 
                alt={logo.description} 
                width={80} 
                height={80} 
                data-ai-hint={logo.imageHint}
                className="object-contain"
              />
            )}
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-7xl font-headline">
            OpenShelf <span className="text-accent">Analytics</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80 sm:text-xl">
            Streamlining visitor management and academic reporting for New Era University's most active facilities.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Visitor Side */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-accent" />
                Intelligent Logistics
              </h2>
              <p className="text-muted-foreground text-lg">
                Modernizing the way students and faculty interact with the NEU Library and Dean's Office through rapid, queue-less identification.
              </p>
            </div>
            
            <Card className="group relative overflow-hidden border-none shadow-xl transition-all hover:shadow-2xl">
              <div className="absolute top-0 left-0 h-2 w-full bg-accent" />
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl font-headline flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-accent" />
                  Visitor Portal
                </CardTitle>
                <CardDescription className="text-base">
                  Instant check-in for Library access and Dean's Office appointments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" /> No password required for initial check-in
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" /> Institutional email verification (@neu.edu.ph)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" /> Real-time status tracking
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={handleVisitorPortalAccess} className="w-full h-12 text-lg group-hover:bg-accent transition-colors">
                  Enter Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Admin Side */}
          <div className="flex flex-col space-y-8">
             <div className="space-y-4">
              <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-accent" />
                Administrative Oversight
              </h2>
              <p className="text-muted-foreground text-lg">
                Empowering decision-makers with live occupancy data, visitor trends, and AI-driven utilization reports.
              </p>
            </div>

            <Card className="group relative overflow-hidden border-none shadow-xl transition-all hover:shadow-2xl bg-primary text-white">
              <div className="absolute top-0 left-0 h-2 w-full bg-accent" />
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl font-headline flex items-center gap-3">
                  <LogIn className="h-6 w-6 text-accent" />
                  Admin Control
                </CardTitle>
                <CardDescription className="text-primary-foreground/70 text-base">
                  Secure management dashboard for authorized staff and deans.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-white/10 text-center">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-accent" />
                    <span className="text-xs uppercase tracking-wider font-semibold">Live Monitoring</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/10 text-center">
                    <Library className="h-5 w-5 mx-auto mb-2 text-accent" />
                    <span className="text-xs uppercase tracking-wider font-semibold">Asset Insight</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/login?role=admin" className="w-full">
                  <Button variant="secondary" className="w-full h-12 text-lg hover:bg-white transition-colors">
                    Staff Login
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-slate-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-semibold text-primary">OpenShelf Analytics</p>
          <p className="mt-2 text-sm text-muted-foreground">
            © {new Date().getFullYear()} New Era University Library & Academic Offices.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Access restricted to verified @neu.edu.ph institutional accounts.
          </p>
        </div>
      </footer>
    </div>
  );
}