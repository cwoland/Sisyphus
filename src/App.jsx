import { useEffect } from 'react';
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

import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterPage } from './pages/auth/RegisterPage.jsx';
import { DashboardPage } from './pages/Dashboard/DashboardPage.jsx';
import { CalendarPage } from './pages/Calendar/CalendarPage.jsx';
import { ProgramsPage } from './pages/Programs/ProgramsPage.jsx';
import { NutritionPage } from './pages/Nutrition/NutritionPage.jsx';
import { FriendsPage } from './pages/Friends/FriendsPage.jsx';
import { ChatPage } from './pages/Chat/ChatPage.jsx';
import { AiPage } from './pages/AI/AiPage.jsx';
import { ProfilePage } from './pages/Profile/ProfilePage.jsx';
import { NotFoundPage } from './pages/NotFound/NotFoundPage.jsx';

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
          <Routes>
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

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
        </AuthProvider>
        <OfflineIndicator />
        <UpdatePrompt />
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;