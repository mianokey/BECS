import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { laravelApiRequest, LARAVEL_ENDPOINTS } from "@/lib/laravel-api";

interface LaravelTask {
  id: number;
  title: string;
  description: string;
  project_id: number;
  assignee_id?: string;
  reviewer_id?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'under_review' | 'completed' | 'rework_required';
  is_weekly_deliverable: boolean;
  target_completion_date?: string;
  actual_completion_date?: string;
  created_at: string;
  updated_at: string;
}

interface CreateTaskData {
  title: string;
  description: string;
  project_id: number;
  assignee_id?: string;
  reviewer_id?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  is_weekly_deliverable?: boolean;
  target_completion_date?: string;
}

interface TaskFilters {
  project_id?: number;
  assignee_id?: string;
  status?: string;
}

export function useLaravelTasks(filters?: TaskFilters) {
  const queryClient = useQueryClient();
  
  // Build query string for filters
  const queryString = filters ? new URLSearchParams(
    Object.entries(filters).filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  ).toString() : '';
  
  const endpoint = queryString ? `/tasks?${queryString}` : LARAVEL_ENDPOINTS.TASKS;
  
  // Get all tasks (with optional filters)
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: [endpoint],
  });
  
  // Get single task
  const useTask = (id: number) => {
    return useQuery({
      queryKey: [LARAVEL_ENDPOINTS.TASK(id)],
      enabled: !!id,
    });
  };
  
  // Get tasks by project
  const useTasksByProject = (projectId: number) => {
    return useQuery({
      queryKey: [LARAVEL_ENDPOINTS.TASKS_BY_PROJECT(projectId)],
      enabled: !!projectId,
    });
  };
  
  // Get tasks by user
  const useTasksByUser = (userId: string) => {
    return useQuery({
      queryKey: [LARAVEL_ENDPOINTS.TASKS_BY_USER(userId)],
      enabled: !!userId,
    });
  };
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      const response = await laravelApiRequest('POST', LARAVEL_ENDPOINTS.TASKS, taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LARAVEL_ENDPOINTS.TASKS] });
    },
  });
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateTaskData> }) => {
      const response = await laravelApiRequest('PUT', LARAVEL_ENDPOINTS.TASK(id), data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LARAVEL_ENDPOINTS.TASKS] });
      queryClient.invalidateQueries({ queryKey: [LARAVEL_ENDPOINTS.TASK(variables.id)] });
    },
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await laravelApiRequest('DELETE', LARAVEL_ENDPOINTS.TASK(id));
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LARAVEL_ENDPOINTS.TASKS] });
    },
  });
  
  return {
    tasks: tasks as LaravelTask[] || [],
    isLoading,
    error,
    useTask,
    useTasksByProject,
    useTasksByUser,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    createError: createTaskMutation.error,
    updateError: updateTaskMutation.error,
    deleteError: deleteTaskMutation.error,
  };
}