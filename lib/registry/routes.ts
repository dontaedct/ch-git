// Routes registry - All API route keys and helpers
export const routes = {
  // Health & Debug
  ping: '/api/ping',
  health: '/api/health',
  'db-check': '/api/db-check',
  'env-check': '/api/env-check',
  'debug-env': '/api/debug-env',
  'debug-snapshot': '/debug/snapshot',
  
  // Core API
  clients: '/api/clients',
  sessions: '/api/sessions',
  'weekly-plans': '/api/weekly-plans',
  'weekly-recap': '/api/weekly-recap',
  
  // Media
  'signed-upload': '/api/media/signed-upload',
  'signed-download': '/api/media/signed-download',
  
  // Email
  'test-email': '/api/test-email',
  'email-smoke': '/api/email-smoke',
  
  // V1 API
  'v1-clients': '/api/v1/clients',
  
  // Client Portal Routes
  'client-portal': '/client-portal',
  'client-check-in': '/client-portal/check-in',
  
  // App Routes
  intake: '/intake',
  login: '/login',
  'trainer-profile': '/trainer-profile',
  'design-system': '/design-system',
  'app-weekly-plans': '/weekly-plans',
  'app-sessions': '/sessions',
} as const;

export type RouteKey = keyof typeof routes;
export type RoutePath = typeof routes[RouteKey];

// Helper functions
export function getRoute(key: RouteKey): RoutePath {
  return routes[key];
}

export function isRoute(path: string): path is RoutePath {
  return Object.values(routes).includes(path as RoutePath);
}

export function getRouteKey(path: string): RouteKey | null {
  const entry = Object.entries(routes).find(([_, routePath]) => routePath === path);
  return entry ? (entry[0] as RouteKey) : null;
}
