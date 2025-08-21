import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Laravel API configuration
const API_BASE_URL = "http://127.0.0.1:8000";

// CSRF token handling for Laravel
let csrfToken: string | null = null;

// Initialize CSRF token from Laravel
async function initializeCsrf() {
  if (!csrfToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
        credentials: 'include',
      });
      if (response.ok) {
        csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
      }
    } catch (error) {
      console.error('Failed to initialize CSRF token:', error);
    }
  }
}

// Laravel API error handler
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    
    // Laravel validation errors
    if (res.status === 422 && errorData.errors) {
      throw new Error(`Validation Error: ${Object.values(errorData.errors).flat().join(', ')}`);
    }
    
    // Laravel authentication errors
    if (res.status === 401) {
      throw new Error(`Authentication required`);
    }
    
    // Laravel authorization errors
    if (res.status === 403) {
      throw new Error(`Access forbidden`);
    }
    
    // Laravel resource not found
    if (res.status === 404) {
      throw new Error(`Resource not found`);
    }
    
    throw new Error(errorData.message || res.statusText);
  }
}

// Laravel API request function
// Laravel API request function
export async function laravelApiRequest(
  method: string,
  endpoint: string,
  data?: unknown
): Promise<any> {
  // Initialize CSRF for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    await initializeCsrf();
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (data) headers['Content-Type'] = 'application/json';
  if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;

  // Attach stored token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  let resData: any;
  try {
    resData = await response.json(); // parse JSON
  } catch {
    resData = { message: response.statusText };
  }

  // Throw backend JSON on error
  if (!response.ok) throw resData;

  return resData; // now frontend can access resData.user, resData.token, resData.message
}



// Laravel API query function for React Query
export const getLaravelQueryFn: QueryFunction = async ({ queryKey }) => {
  const endpoint = queryKey[0] as string;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'include',
  });
  
  if (response.status === 401) {
    // Handle unauthenticated state
    return null;
  }
  
  await throwIfResNotOk(response);
  return await response.json();
};

// Laravel-specific query client
export const laravelQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getLaravelQueryFn,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on authentication or validation errors
        if (error.message.includes('Authentication') || error.message.includes('Validation')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Laravel API endpoints
export const LARAVEL_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: '/api/auth/login',
  AUTH_USER: '/api/auth/user',
  AUTH_LOGOUT: '/api/auth/logout',
  
  // Users
  USERS: '/users',
  USER: (id: string) => `/users/${id}`,
  
  // Projects
  PROJECTS: '/projects',
  PROJECT: (id: number) => `/projects/${id}`,
  
  // Tasks
  TASKS: '/tasks',
  TASK: (id: number) => `/tasks/${id}`,
  TASKS_BY_PROJECT: (projectId: number) => `/tasks?project_id=${projectId}`,
  TASKS_BY_USER: (userId: string) => `/tasks?user_id=${userId}`,
  
  // Attendance
  ATTENDANCE: 'api/attendance',
  ATTENDANCE_TODAY: (userId: string) => `/attendance/today/${userId}`,
  ATTENDANCE_CLOCK_IN: '/attendance/clock-in',
  ATTENDANCE_CLOCK_OUT: '/attendance/clock-out',
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
} as const;