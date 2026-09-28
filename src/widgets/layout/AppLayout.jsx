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
    <div className="relative isolate min-h-[100dvh] bg-bg lg:flex">
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 border-r border-rail-edge lg:block">
        <Sidebar withSearch />
      </aside>

      <div className="relative isolate flex min-w-0 flex-1 flex-col">
        <GreekPatternBg />
        <Header onOpenMenu={() => setDrawerOpen(true)} />

        <main className="relative mx-auto w-full max-w-app flex-1 overflow-x-clip px-4 pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))] md:px-6 lg:px-10 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <BottomNav onOpenMenu={() => setDrawerOpen(true)} />
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};