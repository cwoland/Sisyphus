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
  records:       () => import('../../pages/Records/RecordsPage.jsx').then(named('RecordsPage')),
  activeWorkout: () => import('../../pages/ActiveWorkout/ActiveWorkoutPage.jsx').then(named('ActiveWorkoutPage')),
  notFound:      () => import('../../pages/NotFound/NotFoundPage.jsx').then(named('NotFoundPage')),
  stats:         () => import('../../pages/Stats/StatsPage.jsx').then(named('StatsPage')),
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
  '/records': 'records',
};

const prefetched = new Set();

export const prefetchRoute = (path) => {
  const key = routeKeyByPath[path];
  if (!key || prefetched.has(key)) return;
  prefetched.add(key);
  routeLoaders[key]().catch(() => prefetched.delete(key));
};