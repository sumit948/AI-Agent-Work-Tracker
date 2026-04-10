'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrackerSidebar } from '@/components/tracker-sidebar';
import { useAuth } from '@/lib/auth-context';
import { Loader2, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WorkTrackerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isDemoMode, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      {isDemoMode && (
        <div className="flex items-center justify-between gap-3 bg-primary px-5 py-2 text-primary-foreground text-sm z-50">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 shrink-0" />
            <span className="font-medium">Demo Mode</span>
            <span className="opacity-80 hidden sm:inline">— You&apos;re viewing sample data. Sign up to track your real work.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/register">
              <Button size="sm" variant="secondary" className="h-7 text-xs">Create Account</Button>
            </Link>
            <Button size="sm" variant="ghost" className="h-7 text-xs opacity-80 hover:opacity-100" onClick={logout}>
              Exit Demo
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-1">
        <TrackerSidebar />
        <main className="ml-64 flex-1 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

