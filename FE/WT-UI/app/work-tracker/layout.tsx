'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrackerSidebar } from '@/components/tracker-sidebar';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function WorkTrackerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
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
    <div className="flex min-h-screen">
      <TrackerSidebar />
      <main className="ml-64 flex-1 bg-background">
        {children}
      </main>
    </div>
  );
}
