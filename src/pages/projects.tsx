import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FolderOpen, Upload, Clock, Calendar, CheckSquare, ArrowRight, Target, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import TaskAssignmentModal from "@/components/modals/task-assignment-modal";
import ProjectCreationModal from "@/components/modals/project-creation-modal";
import BulkImportModal from "@/components/modals/bulk-import-modal";
import ProjectCard from "@/components/cards/project-card";
import { useAuth } from "@/hooks/useAuth";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

export default function Projects() {
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'director';

  const handleAssignTask = (projectId: number) => {
    setSelectedProjectId(projectId);
    setIsTaskModalOpen(true);
  };

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setIsProjectDetailsOpen(true);
  };

  const getProjectStats = (projectId: number) => {
    const projectTasks = tasks?.filter(t => t.projectId === projectId) || [];
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const completionPercentage = projectTasks.length > 0 ? 
      Math.round((completedTasks / projectTasks.length) * 100) : 0;
    
    return {
      tasksCount: projectTasks.length,
      completionPercentage,
    };
  };

  // Separate projects by type
  const ahpProjects = projects?.filter(p => p.type === 'AHP') || [];
  const privateProjects = projects?.filter(p => p.type === 'Private') || [];
  
  // Get weekly deliverables (tasks that are recurring or assigned weekly)
  const weeklyDeliverables = tasks?.filter(t => t.isWeeklyDeliverable) || [];
  
  // Get general deliverables (non-weekly tasks)
  const generalDeliverables = tasks?.filter(t => !t.isWeeklyDeliverable) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-becs-navy">Project Management</h1>
          <p className="text-becs-gray">Manage deliverables, timelines and project assignments</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsBulkImportOpen(true)}
              variant="outline"
              className="border-becs-blue text-becs-blue hover:bg-becs-blue hover:text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <Button 
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-becs-blue hover:bg-becs-navy"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="deliverables" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deliverables">Deliverables Management</TabsTrigger>
          <TabsTrigger value="projects">Project Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="deliverables" className="space-y-6">
          {/* Deliverables Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-becs-soft to-white p-6 rounded-lg border">
            <div>
              <h2 className="text-2xl font-bold text-becs-navy">Project Deliverables</h2>
              <p className="text-becs-gray">Manage general and weekly deliverables across all projects</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {generalDeliverables.length} General
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {weeklyDeliverables.length} Weekly
              </Badge>
            </div>
          </div>

          {/* Deliverables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Deliverables */}
            <Card className="becs-professional-card">
              <CardHeader className="border-b border-becs-soft-gray">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-becs-navy flex items-center gap-2">
                    <Target className="h-5 w-5 text-becs-blue" />
                    General Deliverables
                  </CardTitle>
                  <Button 
                    onClick={() => setIsTaskModalOpen(true)}
                    size="sm"
                    className="bg-becs-blue hover:bg-becs-navy"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-becs-gray mb-2">
                    Project deliverables that can be assigned anytime with flexible deadlines
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Not Started: {generalDeliverables.filter(t => t.status === 'not_started').length}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      In Progress: {generalDeliverables.filter(t => t.status === 'in_progress').length}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Completed: {generalDeliverables.filter(t => t.status === 'completed').length}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {generalDeliverables.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-becs-soft-gray hover:border-becs-blue transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-becs-navy">{task.title}</h4>
                        <p className="text-sm text-becs-gray">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-becs-gray">
                            Due: {new Date(task.targetDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={`
                            ${task.status === 'completed' ? 'border-green-500 text-green-700' : 
                              task.status === 'in_progress' ? 'border-yellow-500 text-yellow-700' : 
                              'border-blue-500 text-blue-700'}
                          `}
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {generalDeliverables.length > 5 && (
                  <div className="mt-4 pt-4 border-t border-becs-soft-gray">
                    <p className="text-sm text-becs-gray text-center">
                      And {generalDeliverables.length - 5} more deliverables...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Deliverables */}
            <Card className="becs-professional-card">
              <CardHeader className="border-b border-becs-soft-gray">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-becs-navy flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Weekly Deliverables
                  </CardTitle>
                  <Link href="/tasks">
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Task Manager
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-becs-gray mb-2">
                    Recurring deliverables assigned weekly with consistent schedules
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-green-600" />
                      Weekly Schedule
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-3 h-3 text-green-600" />
                      Auto-assigned
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {weeklyDeliverables.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-becs-navy">{task.title}</h4>
                        <p className="text-sm text-becs-gray">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Weekly
                          </Badge>
                          <span className="text-xs text-becs-gray">
                            Next: {new Date(task.targetDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className="border-green-500 text-green-700"
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {weeklyDeliverables.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-green-300 mx-auto mb-3" />
                    <p className="text-sm text-becs-gray">No weekly deliverables configured</p>
                    <Link href="/tasks">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="mt-2 border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Set up weekly tasks
                      </Button>
                    </Link>
                  </div>
                )}
                
                {weeklyDeliverables.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <Link href="/tasks">
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        View All Weekly Tasks
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* AHP Projects */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-becs-blue" />
              <h2 className="text-xl font-semibold text-becs-navy">AHP Consortium Projects</h2>
              <span className="text-sm text-becs-gray">({ahpProjects.length} projects)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ahpProjects.map((project) => {
                const stats = getProjectStats(project.id);
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    tasksCount={stats.tasksCount}
                    completionPercentage={stats.completionPercentage}
                    onAssignTask={handleAssignTask}
                    onProjectClick={handleProjectClick}
                  />
                );
              })}
            </div>
          </div>

          {/* Private Projects */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-becs-gold" />
              <h2 className="text-xl font-semibold text-becs-navy">Private Projects</h2>
              <span className="text-sm text-becs-gray">({privateProjects.length} projects)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {privateProjects.map((project) => {
                const stats = getProjectStats(project.id);
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    tasksCount={stats.tasksCount}
                    completionPercentage={stats.completionPercentage}
                    onAssignTask={handleAssignTask}
                    onProjectClick={handleProjectClick}
                  />
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="becs-professional-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-becs-gray text-sm">Total Projects</p>
                    <p className="text-2xl font-bold text-becs-navy">{projects?.length || 0}</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-becs-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="becs-professional-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-becs-gray text-sm">Active Tasks</p>
                    <p className="text-2xl font-bold text-becs-navy">{tasks?.filter(t => t.status !== 'completed').length || 0}</p>
                  </div>
                  <CheckSquare className="h-8 w-8 text-becs-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="becs-professional-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-becs-gray text-sm">Weekly Deliverables</p>
                    <p className="text-2xl font-bold text-becs-navy">{weeklyDeliverables.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TaskAssignmentModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedProjectId(undefined);
        }}
        projectId={selectedProjectId}
      />

      <ProjectCreationModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />

      {/* Project Details Modal */}
      <Dialog open={isProjectDetailsOpen} onOpenChange={setIsProjectDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-becs-navy">
              Project Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the selected project
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-6">
              {/* Project Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-becs-soft to-white rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 becs-gradient rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-becs-navy">{selectedProject.name}</h3>
                    <p className="text-becs-gray">Code: {selectedProject.code}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge className={selectedProject.type === 'AHP' ? 'bg-becs-blue text-white' : 'bg-becs-gold text-white'}>
                    {selectedProject.type}
                  </Badge>
                  <Badge variant="secondary" className={
                    selectedProject.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedProject.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    selectedProject.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedProject.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="becs-professional-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-becs-navy">Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-becs-gray">Project Code:</span>
                      <span className="font-medium">{selectedProject.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-becs-gray">Type:</span>
                      <span className="font-medium">{selectedProject.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-becs-gray">Status:</span>
                      <span className="font-medium capitalize">{selectedProject.status.replace('_', ' ')}</span>
                    </div>
                    {selectedProject.clientName && (
                      <div className="flex justify-between">
                        <span className="text-becs-gray">Client:</span>
                        <span className="font-medium">{selectedProject.clientName}</span>
                      </div>
                    )}
                    {selectedProject.startDate && (
                      <div className="flex justify-between">
                        <span className="text-becs-gray">Start Date:</span>
                        <span className="font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedProject.endDate && (
                      <div className="flex justify-between">
                        <span className="text-becs-gray">End Date:</span>
                        <span className="font-medium">{new Date(selectedProject.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="becs-professional-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-becs-navy">Project Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const stats = getProjectStats(selectedProject.id);
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-becs-gray">Total Tasks:</span>
                            <span className="font-medium">{stats.tasksCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-becs-gray">Completion:</span>
                            <span className="font-medium">{stats.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-becs-blue h-2 rounded-full transition-all"
                              style={{ width: `${stats.completionPercentage}%` }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Project Description */}
              {selectedProject.description && (
                <Card className="becs-professional-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-becs-navy">Project Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-becs-gray leading-relaxed">{selectedProject.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Project Tasks */}
              <Card className="becs-professional-card">
                <CardHeader>
                  <CardTitle className="text-lg text-becs-navy">Project Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks?.filter(task => task.projectId === selectedProject.id).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <h4 className="font-medium text-becs-navy">{task.title}</h4>
                          <p className="text-sm text-becs-gray">{task.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {task.priority}
                            </Badge>
                            {task.isWeeklyDeliverable && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Weekly
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={
                              task.status === 'completed' ? 'border-green-500 text-green-700' :
                              task.status === 'in_progress' ? 'border-blue-500 text-blue-700' :
                              task.status === 'under_review' ? 'border-yellow-500 text-yellow-700' :
                              'border-gray-500 text-gray-700'
                            }
                          >
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {tasks?.filter(task => task.projectId === selectedProject.id).length === 0 && (
                      <div className="text-center py-8">
                        <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-becs-gray">No tasks assigned to this project yet</p>
                        <Button 
                          size="sm" 
                          className="mt-2 bg-becs-blue hover:bg-becs-navy"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsProjectDetailsOpen(false);
                            handleAssignTask(selectedProject.id);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Assign Task
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
