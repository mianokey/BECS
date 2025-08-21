import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { laravelApiRequest, LARAVEL_ENDPOINTS } from "@/lib/laravel-api";

interface LaravelProject {
  id: number;
  name: string;
  code: string;
  type: 'ahp' | 'private';
  client_name?: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

interface CreateProjectData {
  name: string;
  code: string;
  type: 'ahp' | 'private';
  client_name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'on_hold';
  start_date?: string;
  end_date?: string;
}

export function useLaravelProjects() {
  const queryClient = useQueryClient();
  
  // Get all projects
  const { data: projects, isLoading, error } = useQuery({
    queryKey: [LARAVEL_ENDPOINTS.PROJECTS],
  });
  
  // Get single project
  const useProject = (id: number) => {
    return useQuery({
      queryKey: [LARAVEL_ENDPOINTS.PROJECT(id)],
      enabled: !!id,
    });
  };
  
  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      const response = await laravelApiRequest('POST', LARAVEL_ENDPOINTS.PROJECTS, projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LARAVEL_ENDPOINTS.PROJECTS] });
    },
  });
  
  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateProjectData> }) => {
      const response = await laravelApiRequest('PUT', LARAVEL_ENDPOINTS.PROJECT(id), data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LARAVEL_ENDPOINTS.PROJECTS] });
      queryClient.invalidateQueries({ queryKey: [LARAVEL_ENDPOINTS.PROJECT(variables.id)] });
    },
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await laravelApiRequest('DELETE', LARAVEL_ENDPOINTS.PROJECT(id));
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LARAVEL_ENDPOINTS.PROJECTS] });
    },
  });
  
  return {
    projects: projects as LaravelProject[] || [],
    isLoading,
    error,
    useProject,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    createError: createProjectMutation.error,
    updateError: updateProjectMutation.error,
    deleteError: deleteProjectMutation.error,
  };
}