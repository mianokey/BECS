import { useState, useEffect } from "react";
import { laravelApiRequest, LARAVEL_ENDPOINTS } from "@/lib/laravel-api";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await laravelApiRequest("GET", LARAVEL_ENDPOINTS.AUTH_USER, undefined, );
      setUser({
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        staffId: data.staff_id,
        email: data.email,
        role: data.role,
      });
    } catch (err) {
      setUser(null); // Don't redirect to login here
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (userData: any, token: string) => {
    localStorage.setItem("auth_token", token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await laravelApiRequest("POST", LARAVEL_ENDPOINTS.AUTH_LOGOUT);
    } catch (_) {}
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  return { user, isAuthenticated: !!user, isLoading, login, logout };
}
