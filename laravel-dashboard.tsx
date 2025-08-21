import { useState } from "react";
import { useLaravelAuth } from "@/hooks/useLaravelAuth";
import { useLaravelProjects } from "@/hooks/useLaravelProjects";
import { useLaravelTasks } from "@/hooks/useLaravelTasks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  AlertTriangle,
  LogOut,
  Plus,
  Eye 
} from "lucide-react";

export default function LaravelDashboard() {
  const { user, logout, isLoggingOut } = useLaravelAuth();
  const { projects, isLoading: projectsLoading } = useLaravelProjects();
  const { tasks, isLoading: tasksLoading } = useLaravelTasks();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  
  // Filter tasks for current user
  const userTasks = tasks.filter(task => task.assignee_id === user?.id);
  const pendingTasks = userTasks.filter(task => task.status === 'not_started' || task.status === 'in_progress');
  const completedTasks = userTasks.filter(task => task.status === 'completed');
  const reviewTasks = userTasks.filter(task => task.status === 'under_review');
  
  // Project statistics
  const activeProjects = projects.filter(p => p.status === 'active');
  const ahpProjects = projects.filter(p => p.type === 'ahp');
  const privateProjects = projects.filter(p => p.type === 'private');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rework_required': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Laravel API Authentication Required</h1>
          <p className="text-gray-600">Please ensure your Laravel backend is running and authenticated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">BECS Laravel Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.first_name} {user.last_name} ({user.role})
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => logout()}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsLoading ? '...' : projects.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeProjects.length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasksLoading ? '...' : userTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingTasks.length} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviewTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting feedback
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="ahp">AHP Consortiums</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Projects</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
            
            {projectsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription>{project.code}</CardDescription>
                        </div>
                        <Badge variant="secondary">{project.type.toUpperCase()}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {project.description || 'No description available'}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedProject(project.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Tasks</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
            
            {tasksLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {userTasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <CardDescription className="mt-1">{task.description}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {task.is_weekly_deliverable && (
                            <Badge variant="outline">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Weekly Deliverable
                            </Badge>
                          )}
                          {task.target_completion_date && (
                            <span className="text-sm text-gray-500">
                              Due: {new Date(task.target_completion_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {userTasks.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No tasks assigned to you yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ahp" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">AHP Consortiums</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ahpProjects.map((consortium) => (
                <Card key={consortium.id}>
                  <CardHeader>
                    <CardTitle>{consortium.name}</CardTitle>
                    <CardDescription>{consortium.code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {consortium.description || 'AHP Consortium project'}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge className={getStatusColor(consortium.status)}>
                        {consortium.status.replace('_', ' ')}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {ahpProjects.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No AHP consortium projects found.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}