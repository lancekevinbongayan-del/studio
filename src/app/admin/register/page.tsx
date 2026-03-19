"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AdminRegistration() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const logo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.endsWith('@neu.edu.ph')) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Only Neu institutional emails (@neu.edu.ph) are allowed.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create User Profile
      const userProfileRef = doc(db, 'users', user.uid);
      await setDoc(userProfileRef, {
        id: user.uid,
        email,
        fullName,
        role: 'Admin',
        blocked: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 3. Create Admin Role Marker
      try {
        const adminRoleRef = doc(db, 'roles_admin', user.uid);
        await setDoc(adminRoleRef, {
          email,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Could not automatically create admin marker. Manual authorization may be required.", err);
      }

      toast({
        title: "Registration Successful",
        description: "Admin account created. Redirecting to dashboard...",
      });
      
      router.push('/admin');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center text-sm text-muted-foreground hover:text-primary transition-colors self-start max-w-md mx-auto w-full">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>
      
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-white p-2 rounded-full border-2 border-primary w-fit shadow-md mb-2">
            {logo && (
              <Image 
                src={logo.imageUrl} 
                alt={logo.description} 
                width={48} 
                height={48} 
                data-ai-hint={logo.imageHint}
                className="object-contain"
              />
            )}
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Admin Registration</CardTitle>
          <CardDescription>Create a new administrative account for LibTrack</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Institutional Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="username@neu.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 text-lg gap-2 mt-4" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Register as Admin
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-xs text-center text-muted-foreground">
            Only authorized NEU staff should register here.
          </p>
          <div className="text-sm text-center">
            Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
