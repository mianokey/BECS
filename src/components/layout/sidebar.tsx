import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Clock,
  FileText,
  Receipt,
  Users,
  Calendar,
  LogOut,
  Database,
  Settings
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { laravelApiRequest } from "@/lib/laravel-api";

export default function Sidebar() {
  const { user } = useAuth(); // get isLoading too
  const [location, setLocation] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is clocked in today
  const { data: todayAttendance } = useQuery({
    queryKey: ['/api/attendance/today', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/attendance/today/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (todayAttendance && todayAttendance.length > 0) {
      const lastRecord = todayAttendance[todayAttendance.length - 1];
      setIsLoggedIn(!!lastRecord.timeIn && !lastRecord.timeOut);
    }
  }, [todayAttendance]);

  const clockToggleMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not found");

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();

      if (isLoggedIn) {
        // Clock out
        const lastRecord = todayAttendance?.[todayAttendance.length - 1];
        if (lastRecord) {
          const timeIn = new Date(lastRecord.timeIn!);
          const totalHours = ((now.getTime() - timeIn.getTime()) / (1000 * 60 * 60)).toFixed(2);

          await laravelApiRequest('POST', `/api/attendance/${lastRecord.id}`, {
            timeOut: now.toISOString(),
            totalHours: parseFloat(totalHours),
          });
        }
      } else {
        // Clock in
        await laravelApiRequest('POST', '/api/attendance/clock-in', {
          user_id: user.id, // this is required
          date: today,
          time_in: now.toISOString(),
        });
      }
    },
    onSuccess: () => {
      setIsLoggedIn(!isLoggedIn);
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      toast({
        title: isLoggedIn ? "Clocked Out" : "Clocked In",
        description: `Successfully ${isLoggedIn ? 'clocked out' : 'clocked in'} at ${new Date().toLocaleTimeString()}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update attendance",
        variant: "destructive",
      });
    },
  });

  // inside Sidebar component
const logoutMutation = useMutation({
  mutationFn: async () => {
    await laravelApiRequest("POST", "/api/auth/logout");
  },
  onSuccess: () => {
    queryClient.clear(); // clear all cached queries
    toast({
      title: "Signed Out",
      description: "You have been logged out successfully",
    });
    setLocation("/login"); // redirect to login page
  },
  onError: () => {
    toast({
      title: "Error",
      description: "Logout failed, please try again",
      variant: "destructive",
    });
  },
});

  const isAdmin = user?.role === 'admin' || user?.role === 'director';

  const adminNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Task Management', href: '/tasks', icon: CheckSquare },
    { name: 'Data Entry', href: '/data-entry', icon: Database },
    { name: 'Consortium Setup', href: '/consortium-setup', icon: Settings },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
    { name: 'Templates', href: '/templates', icon: FileText },

    
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Leave Management', href: '/leave', icon: Calendar },
    { name: 'Templates', href: '/templates', icon: FileText },
  ];

  const staffNavigation = [
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    // { name: 'Leave Management', href: '/leave', icon: Calendar },
    // { name: 'Templates', href: '/templates', icon: FileText },
  ];

  const navigation = isAdmin ? adminNavigation : staffNavigation;

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-100 flex flex-col">
      {/* Logo Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 becs-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-becs-navy">BECS Consultancy</h1>
            <p className="text-xs text-becs-gray">LLP</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 becs-gold-gradient rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-becs-gray capitalize">{user?.role}</p>
            <p className="text-xs text-becs-blue">Staff ID: {user?.staffId}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="text-xs font-semibold text-becs-gray uppercase tracking-wide px-2 pb-2">
          MAIN MENU
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <button
              key={item.name}
              onClick={() => setLocation(item.href)}
              className={`flex items-center w-full px-3 py-2 rounded-lg font-medium transition-colors ${isActive
                ? 'text-becs-blue bg-blue-50'
                : 'text-gray-700 hover:text-becs-blue hover:bg-blue-50'
                }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Clock In/Out Section */}
      <div className="p-4">
        <div className="becs-gradient rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Current Status</span>
            <div className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
          <p className="text-xs text-blue-100 mb-3">
            {isLoggedIn ? 'Clocked In' : 'Clocked Out'}
          </p>
          <Button
            onClick={() => clockToggleMutation.mutate()}
            disabled={clockToggleMutation.isPending}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            <Clock className="w-4 h-4 mr-2" />
            {clockToggleMutation.isPending
              ? 'Processing...'
              : isLoggedIn
                ? 'Clock Out'
                : 'Clock In'
            }
          </Button>
        </div>

        {/* Logout Button */}
        <Button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          variant="ghost"
          className="w-full mt-4 text-gray-600 hover:text-becs-red hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}
