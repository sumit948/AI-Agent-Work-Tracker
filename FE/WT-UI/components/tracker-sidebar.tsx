'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, LayoutDashboard, MessageSquare, FileText, TrendingUp, LogOut, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function TrackerSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/work-tracker', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/work-tracker/entry', label: 'Log Work', icon: Zap },
    { href: '/work-tracker/reports', label: 'Reports', icon: FileText },
    { href: '/work-tracker/chat', label: 'AI Assistant', icon: MessageSquare },
    { href: '/work-tracker/analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card flex flex-col">
      <div className="flex h-16 items-center border-b border-border px-6 gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-primary">WorkTracker</h1>
      </div>

      <nav className="space-y-1 p-4 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4 space-y-3">
        {user && (
          <div className="px-2">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <Button variant="outline" className="w-full gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
