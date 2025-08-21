import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { laravelApiRequest, LARAVEL_ENDPOINTS } from "@/lib/laravel-api";

export interface LaravelUser {
  id: string;
  staff_id: string;
  email: string;
  name: string;
  role: "admin" | "director" | "staff";
  department?: string;
  position?: string;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  login: string; // staff_id or email
  password: string;
}

export function useLaravelAuth() {
  const queryClient = useQueryClient();

  // Fetch authenticated user
  const { data: user, isLoading, error, refetch } = useQuery<
    LaravelUser | null,
    Error
  >({
    queryKey: [LARAVEL_ENDPOINTS.AUTH_USER],
    queryFn: async () => {
      const response = await laravelApiRequest(
        "GET",
        LARAVEL_ENDPOINTS.AUTH_USER
      );

      //Handle unauthenticated FIRST
      if (response.status === 401) {
         throw new Error("Am hit");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user...");
      }

      return response.json();
    },
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation<LaravelUser, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await laravelApiRequest(
        "POST",
        LARAVEL_ENDPOINTS.AUTH_LOGIN,
        credentials
      );
      if (!response.ok) throw new Error("Login failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LARAVEL_ENDPOINTS.AUTH_USER],
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      const response = await laravelApiRequest(
        "POST",
        LARAVEL_ENDPOINTS.AUTH_LOGOUT
      );
      if (!response.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
  };
}
