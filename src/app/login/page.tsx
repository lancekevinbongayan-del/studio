"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Library, Chrome } from 'lucide-react';
import { store } from '@/lib/store';
import { MOCK_USERS } from '@/lib/mock-data';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const roleHint = searchParams.get('role');

  useEffect(() => {
    if (roleHint === 'admin') {
      setEmail('admin@neu.edu.ph');
    } else {
      setEmail('j.doe@neu.edu.ph');
    }
  }, [roleHint]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Institutional email check
    if (!email.endsWith('@neu.edu.ph')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only institutional emails (@neu.edu.ph) are allowed.",
      });
      setLoading(false);
      return;
    }

    // Simulate finding user or creating a new one
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (user && user.isBlocked) {
      toast({
        variant: "destructive",
        title: "Account Blocked",
        description: "Your account has been restricted by the administrator.",
      });
      setLoading(false);
      return;
    }

    setTimeout(() => {
      if (user) {
        store.setCurrentUser(user);
        toast({
          title: "Welcome Back",
          description: `Logged in as ${user.name}`,
        });
        router.push(user.role === 'Admin' ? '/admin' : '/visitor');
      } else {
        // Create new visitor
        const newUser = {
          id: Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          email,
          role: 'Visitor' as const,
          isBlocked: false,
        };
        store.setCurrentUser(newUser);
        toast({
          title: "Welcome",
          description: `Successfully signed in as ${newUser.name}`,
        });
        router.push('/visitor');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-300 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full w-fit">
            <Library className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-3xl font-headline font-bold">Institutional Login</CardTitle>
            <CardDescription>Please sign in with your NEU email account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="username@neu.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg gap-2" 
              disabled={loading}
            >
              <Chrome className="h-5 w-5" />
              {loading ? "Authenticating..." : "Sign in with Google"}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground italic">
              * This is a simulated Google login restricted to the institutional domain.
            </p>
          </form>
        </CardContent>
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