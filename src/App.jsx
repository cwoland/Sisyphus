import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './app/providers/AuthProvider.jsx';
import { ProtectedRoute } from './app/router/ProtectedRoute.jsx';
import { PublicOnlyRoute } from './app/router/PublicOnlyRoute.jsx';
import { AppLayout } from './widgets/layout/AppLayout.jsx';
import { ToastContainer } from './shared/ui/toast/ToastContainer.jsx';
import { useThemeStore } from './entities/theme/theme.store.js';
import { OfflineIndicator } from './shared/offline/OfflineIndicator.jsx';
import { UpdatePrompt } from './shared/pwa/UpdatePrompt.jsx';

import { registerSW } from 'virtual:pwa-register';

import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterPage } from './pages/auth/RegisterPage.jsx';
import { routeLoaders } from './app/router/routeLoaders.js';

const DashboardPage     = lazy(routeLoaders.dashboard);
const CalendarPage      = lazy(routeLoaders.calendar);
const ProgramsPage      = lazy(routeLoaders.programs);
const NutritionPage     = lazy(routeLoaders.nutrition);
const FriendsPage       = lazy(routeLoaders.friends);
const ChatPage          = lazy(routeLoaders.chat);
const AiPage            = lazy(routeLoaders.ai);
const ProfilePage       = lazy(routeLoaders.profile);
const ActiveWorkoutPage = lazy(routeLoaders.activeWorkout);
const NotFoundPage      = lazy(routeLoaders.notFound);


registerSW({ immediate: true });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function App() {
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
            <Route path="/workout/:id/active" element={<ProtectedRoute><ActiveWorkoutPage /></ProtectedRoute>} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/programs" element={<ProgramsPage />} />
              <Route path="/nutrition" element={<NutritionPage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/ai" element={<AiPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </AuthProvider>
        <OfflineIndicator />
        <UpdatePrompt />
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

const RouteFallback = () => (
  <div className="flex min-h-[50dvh] items-center justify-center" role="status" aria-label="Загрузка страницы">
    <div className="h-1 w-32 overflow-hidden rounded-full bg-surface-2">
      <div className="h-full w-1/4 rounded-full bg-accent animate-loading-bar" />
    </div>
  </div>
);