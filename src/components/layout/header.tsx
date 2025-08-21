import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import TaskAssignmentModal from "@/components/modals/task-assignment-modal";

export default function Header() {
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const { data: unreadCount } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    enabled: !!user?.id,
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'director';

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-becs-navy">Task & Project Management</h2>
            <p className="text-becs-gray text-sm">Manage your projects and tasks efficiently</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:text-becs-blue transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount?.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-becs-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount.count}
                </span>
              )}
            </button>
            {isAdmin && (
              <Button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-becs-blue text-white hover:bg-becs-navy transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            )}
          </div>
        </div>
      </header>

      <TaskAssignmentModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </>
  );
}
