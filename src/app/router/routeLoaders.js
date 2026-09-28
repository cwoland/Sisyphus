const named = (name) => (m) => ({ default: m[name] });

export const routeLoaders = {
  dashboard:     () => import('../../pages/Dashboard/DashboardPage.jsx').then(named('DashboardPage')),
  calendar:      () => import('../../pages/Calendar/CalendarPage.jsx').then(named('CalendarPage')),
  programs:      () => import('../../pages/Programs/ProgramsPage.jsx').then(named('ProgramsPage')),
  nutrition:     () => import('../../pages/Nutrition/NutritionPage.jsx').then(named('NutritionPage')),
  friends:       () => import('../../pages/Friends/FriendsPage.jsx').then(named('FriendsPage')),
  chat:          () => import('../../pages/Chat/ChatPage.jsx').then(named('ChatPage')),
  ai:            () => import('../../pages/AI/AiPage.jsx').then(named('AiPage')),
  profile:       () => import('../../pages/Profile/ProfilePage.jsx').then(named('ProfilePage')),
  activeWorkout: () => import('../../pages/ActiveWorkout/ActiveWorkoutPage.jsx').then(named('ActiveWorkoutPage')),
  notFound:      () => import('../../pages/NotFound/NotFoundPage.jsx').then(named('NotFoundPage')),
};

export const routeKeyByPath = {
  '/': 'dashboard',
  '/calendar': 'calendar',
  '/programs': 'programs',
  '/nutrition': 'nutrition',
  '/friends': 'friends',
  '/chat': 'chat',
  '/ai': 'ai',
  '/profile': 'profile',
};

const prefetched = new Set();

export const prefetchRoute = (path) => {
  const key = routeKeyByPath[path];
  if (!key || prefetched.has(key)) return;
  prefetched.add(key);
  routeLoaders[key]().catch(() => prefetched.delete(key));
};