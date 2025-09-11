import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckSquare, Clock, User as UserIcon, FolderOpen } from "lucide-react";
import { useState } from "react";
import TaskAssignmentModal from "@/components/modals/task-assignment-modal";
import TaskCard from "@/components/cards/task-card";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { laravelApiRequest } from "@/lib/laravel-api";
import { Task, User } from "@/types";

export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>("all");

  // 👇 explicitly tell React Query what each query returns
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: () => laravelApiRequest("GET", "/api/tasks"),
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => laravelApiRequest("GET", "/api/users"),
  });

  const { data: projects = [] } = useQuery<{ id: string; code: string; name: string }[]>({
    queryKey: ["/api/projects"],
    queryFn: () => laravelApiRequest("GET", "/api/projects"),
  });

  const isAdmin = user?.role === "admin" || user?.role === "director";

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      await apiRequest("PATCH", `/api/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-becs-red text-white";
      case "medium":
        return "bg-becs-gold text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({ taskId, updates: { status: newStatus } });
  };

  // Filter tasks based on user role and selected staff
  const filteredTasks =
    tasks?.filter((task) => {
      if (!isAdmin) {
        // Staff can only see their own tasks
        return task.assigneeId === user?.id;
      }

      // Admin can see all tasks, but can filter by staff
      if (selectedStaff === "all") {
        return true;
      }

      return task.assigneeId === selectedStaff;
    }) || [];

  // Group tasks by staff for admin view
  const tasksByStaff = isAdmin
    ? users
        ?.filter((u: User) => u.role === "staff")
        .map((staff: User) => ({
          staff,
          tasks: filteredTasks.filter((task: Task) => task.assigneeId === staff.id),
        }))
    : [];

  const getAssigneeName = (assigneeId?: string) => {
    if (!assigneeId) return "Unassigned";
    const assignee = users?.find((u) => u.id === assigneeId);
    return assignee ? `${assignee.first_name} ${assignee.last_name}` : "Unknown";
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return "Unknown Project";
    const project = projects?.find((p) => p.id === projectId);
    return project ? `${project.code} - ${project.name}` : "Unknown Project";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-becs-navy">
            {isAdmin ? "Task Management" : "My Tasks"}
          </h1>
          <p className="text-becs-gray">
            {isAdmin ? "Manage and assign tasks to team members" : "View and update your assigned tasks"}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {users?.filter((u) => u.role === "staff").map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isAdmin && (
            <Button onClick={() => setIsTaskModalOpen(true)} className="bg-becs-blue hover:bg-becs-navy">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Tasks View */}
      {isAdmin && selectedStaff === "all" ? (
        // Admin view - grouped by staff
        <div className="space-y-6">
          {tasksByStaff?.map(({ staff, tasks }) => (
            <Card key={staff.id} className="border border-gray-100">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-becs-navy flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  {staff.first_name} {staff.last_name}
                  <Badge variant="secondary" className="ml-2">
                    {tasks.length} tasks
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {tasks.length === 0 ? (
                  <p className="text-center text-becs-gray py-8">No tasks assigned</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                      <TaskCard key={task.id} task={task} users={users || []} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Individual tasks view
        <Card className="border border-gray-100">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-becs-navy flex items-center">
              <CheckSquare className="w-5 h-5 mr-2" />
              Tasks
              <Badge variant="secondary" className="ml-2">
                {filteredTasks.length} tasks
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 text-becs-gray mx-auto mb-4" />
                <p className="text-becs-gray text-lg">No tasks found</p>
                <p className="text-becs-gray text-sm">
                  {isAdmin ? "Create your first task to get started" : "No tasks assigned to you yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
                  <Card key={task.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </div>

                      {task.description && <p className="text-sm text-becs-gray mb-4">{task.description}</p>}

                      <div className="space-y-3 text-sm">
                        {isAdmin && (
                          <div className="flex items-center text-becs-gray">
                            <UserIcon className="w-4 h-4 mr-2" />
                            {getAssigneeName(task.assigneeId)}
                          </div>
                        )}
                        <div className="flex items-center text-becs-gray">
                          <FolderOpen className="w-4 h-4 mr-2" />
                          {getProjectName(task.projectId)}
                        </div>
                        <div className="flex items-center text-becs-gray">
                          <Clock className="w-4 h-4 mr-2" />
                          Due:{" "}
                          {task.targetCompletionDate
                            ? new Date(task.targetCompletionDate).toLocaleDateString()
                            : "No due date"}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">Not Started</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>

                        {task.isWeeklyDeliverable && (
                          <Badge variant="outline" className="text-becs-blue border-becs-blue">
                            Weekly
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <TaskAssignmentModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}
