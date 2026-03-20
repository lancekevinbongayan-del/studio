"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { GraduationCap, ArrowRight, BarChart3, Clock, ShieldCheck } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function Home() {
  const router = useRouter();
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState('');
  
  const logo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  const handleVisitorPortalAccess = () => {
    if (auth) {
      initiateAnonymousSignIn(auth);
      router.push('/visitor');
    }
  };

  // SSR safety: return basic structure or skeleton while mounting
  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-24 sm:py-32">
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
          <div className="mx-auto mb-10 flex h-32 w-32 items-center justify-center rounded-3xl bg-white p-4 shadow-2xl ring-4 ring-white/10 transition-transform hover:scale-105 duration-300">
            {logo && (
              <Image 
                src={logo.imageUrl} 
                alt={logo.description} 
                width={100} 
                height={100} 
                className="object-contain"
                priority
              />
            )}
          </div>
          <h1 className="mb-6 text-5xl font-black tracking-tight text-white sm:text-7xl font-headline">
            OpenShelf <span className="text-accent">Analytics</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/70 sm:text-xl font-medium leading-relaxed">
            The standard for intelligent facility monitoring and academic reporting at New Era University.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2 max-w-6xl mx-auto items-stretch">
          {/* Visitor Side */}
          <Card className="flex flex-col h-full group relative overflow-hidden border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-accent/30 rounded-[2.5rem] bg-white">
            <div className="absolute top-0 left-0 h-2 w-full bg-accent" />
            <CardHeader className="pt-12 px-10 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center transition-transform group-hover:rotate-6">
                <GraduationCap className="h-8 w-8 text-accent" />
              </div>
              <div className="min-h-[100px]">
                <CardTitle className="text-3xl font-headline text-primary font-black">Visitor Portal</CardTitle>
                <CardDescription className="text-base font-medium mt-2 leading-relaxed">
                  Rapid check-in for the Library and Dean's Office services. Secure and institutionalized entry.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 px-10 space-y-6 pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" />
                  <p className="text-sm text-slate-600 font-semibold leading-relaxed">Secure entry with institutional email verification.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" />
                  <p className="text-sm text-slate-600 font-semibold leading-relaxed">Real-time status updates for waiting room queues.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pb-12 px-10">
              <Button onClick={handleVisitorPortalAccess} className="w-full h-16 text-xl font-black shadow-xl shadow-accent/20 hover:bg-accent transition-all rounded-2xl">
                Open Portal <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </CardFooter>
          </Card>

          {/* Admin Side */}
          <Card className="flex flex-col h-full group relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-primary text-white rounded-[2.5rem]">
            <div className="absolute top-0 left-0 h-2 w-full bg-white/10" />
            <CardHeader className="pt-12 px-10 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center transition-transform group-hover:-rotate-6">
                <ShieldCheck className="h-8 w-8 text-accent" />
              </div>
              <div className="min-h-[100px]">
                <CardTitle className="text-3xl font-headline text-white font-black">Administration</CardTitle>
                <CardDescription className="text-base font-medium mt-2 text-primary-foreground/60 leading-relaxed">
                  Oversight tools for department deans and library staff. Comprehensive facility management.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 px-10 space-y-8 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center space-y-3 transition-colors hover:bg-white/10">
                  <BarChart3 className="h-8 w-8 mx-auto text-accent" />
                  <span className="text-[10px] uppercase tracking-widest font-black block">Live Analytics</span>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center space-y-3 transition-colors hover:bg-white/10">
                  <Clock className="h-8 w-8 mx-auto text-accent" />
                  <span className="text-[10px] uppercase tracking-widest font-black block">Staff Feed</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pb-12 px-10">
              <Link href="/login" className="w-full">
                <Button variant="secondary" className="w-full h-16 text-xl font-black hover:bg-white transition-all rounded-2xl text-primary">
                  Staff Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="border-t border-slate-100 bg-slate-50 py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <p className="font-black text-primary tracking-tight text-xl">OpenShelf <span className="text-accent">Analytics</span></p>
          <div className="text-sm text-slate-500 font-semibold uppercase tracking-widest">
            © {currentYear || '2025'} New Era University. All Rights Reserved.
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400">
            Authorized Institutional Access Only
          </p>
        </div>
      </footer>
    </div>
  );
}
