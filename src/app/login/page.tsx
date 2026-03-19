"use client";

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const logo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email.endsWith('@neu.edu.ph')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only institutional emails (@neu.edu.ph) are allowed for Admin access.",
      });
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.blocked) {
          toast({
            variant: "destructive",
            title: "Account Blocked",
            description: "Your account has been restricted by the administrator.",
          });
          setLoading(false);
          return;
        }

        if (userData.role !== 'Admin') {
          toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "This portal is strictly for administrative users.",
          });
          setLoading(false);
          return;
        }

        // Create a real-time session record
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setDoc(doc(db, 'user_sessions', user.uid), {
          userId: user.uid,
          email: user.email,
          fullName: userData.fullName || 'Anonymous',
          loginTime: new Date().toISOString(),
          deviceType: isMobile ? 'Mobile' : 'Desktop',
          lastActive: serverTimestamp()
        });

        toast({
          title: "Welcome Back, Admin",
          description: `Logged in as ${userData.fullName}`,
        });
        
        router.push('/admin');
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "No administrative profile found for this account.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid credentials or unauthorized account.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-300 shadow-2xl border-t-4 border-t-accent">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-white border-2 border-primary p-1 rounded-full w-fit overflow-hidden shadow-sm">
            {logo && (
              <Image 
                src={logo.imageUrl} 
                alt={logo.description} 
                width={60} 
                height={60} 
                data-ai-hint={logo.imageHint}
                className="object-contain"
              />
            )}
          </div>
          <div>
            <CardTitle className="text-3xl font-headline font-bold">Admin Login</CardTitle>
            <CardDescription>Secure access for LibTrack administrators</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Institutional Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="username@neu.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 text-lg gap-2 mt-2 bg-accent hover:bg-accent/90" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
              {loading ? "Verifying..." : "Enter Dashboard"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-muted-foreground">
            New Admin? <Link href="/admin/register" className="text-primary hover:underline font-bold">Register here</Link>
          </div>
          <Link href="/" className="text-xs text-center text-muted-foreground hover:text-primary underline">
            Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
