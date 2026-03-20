"use client";

import { useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const logo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleVisitorPortalAccess = () => {
    initiateAnonymousSignIn(auth);
    router.push('/visitor');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-20 sm:py-32">
        <div className="absolute inset-0 opacity-5">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-3xl bg-white p-3 shadow-2xl ring-1 ring-white/20">
            {logo && (
              <Image 
                src={logo.imageUrl} 
                alt={logo.description} 
                width={80} 
                height={80} 
                className="object-contain"
              />
            )}
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-7xl font-headline">
            OpenShelf <span className="text-accent">Analytics</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/70 sm:text-xl font-medium">
            The standard for intelligent facility monitoring and academic reporting at New Era University.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-20">
        <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto items-stretch">
          {/* Visitor Side */}
          <div className="flex flex-col">
            <Card className="flex flex-col h-full group relative overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:border-accent/20">
              <div className="absolute top-0 left-0 h-1.5 w-full bg-accent" />
              <CardHeader className="pt-10 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-headline text-primary">Visitor Portal</CardTitle>
                  <CardDescription className="text-base font-medium mt-2">
                    Rapid check-in for the Library and Dean's Office services.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">Secure, anonymous entry with institutional email verification.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">Real-time status updates for waiting room queues.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pb-10">
                <Button onClick={handleVisitorPortalAccess} className="w-full h-14 text-lg font-bold shadow-lg hover:bg-accent transition-all">
                  Open Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Admin Side */}
          <div className="flex flex-col">
            <Card className="flex flex-col h-full group relative overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:border-primary/20 bg-primary text-white">
              <div className="absolute top-0 left-0 h-1.5 w-full bg-primary-foreground/20" />
              <CardHeader className="pt-10 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-headline text-white">Administration</CardTitle>
                  <CardDescription className="text-base font-medium mt-2 text-primary-foreground/60">
                    Oversight tools for department deans and library staff.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                    <BarChart3 className="h-6 w-6 mx-auto text-accent" />
                    <span className="text-[10px] uppercase tracking-widest font-bold block">Live Analytics</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                    <Clock className="h-6 w-6 mx-auto text-accent" />
                    <span className="text-[10px] uppercase tracking-widest font-bold block">Staff Feed</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pb-10">
                <Link href="/login" className="w-full">
                  <Button variant="secondary" className="w-full h-14 text-lg font-bold hover:bg-white transition-all">
                    Staff Login
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 bg-slate-50 py-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="font-bold text-primary tracking-tight">OpenShelf Analytics</p>
          <div className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} New Era University. All Rights Reserved.
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Authorized Institutional Access Only
          </p>
        </div>
      </footer>
    </div>
  );
}
