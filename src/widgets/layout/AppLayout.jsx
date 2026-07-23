import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';
import { Sidebar } from './Sidebar.jsx';
import { BottomNav } from './BottomNav.jsx';
import { Drawer } from './Drawer.jsx';
import { GreekPatternBg } from '../../shared/ui/GreekPatternBg.tsx';

export const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative isolate min-h-[100dvh] bg-bg">
      <GreekPatternBg />
      <div className="relative z-10 mx-auto flex max-w-app">
        <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 border-r border-border bg-surface pad-safe-top lg:block">
          <Sidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onOpenMenu={() => setDrawerOpen(true)} />

          <main className="flex-1 px-[10%] pb-24 md:px-8 lg:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      <BottomNav onOpenMenu={() => setDrawerOpen(true)} />
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};