import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, CheckSquare, Clock, Users, AlertTriangle, TrendingUp, Building2, UserPlus, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { startOfWeek, endOfWeek, parseISO, isWithinInterval } from "date-fns";
import TaskAssignmentModal from "@/components/modals/task-assignment-modal";
import StaffCreationModal from "@/components/modals/staff-creation-modal";
import BulkImportModal from "@/components/modals/bulk-import-modal";
import { laravelApiRequest } from "@/lib/laravel-api";

export default function Dashboard() {
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'], // cache key
    queryFn: () => laravelApiRequest("GET", "/api/dashboard/stats"),
  });


  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => laravelApiRequest("GET", "/api/users"),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: () => laravelApiRequest("GET", "/api/tasks"),
  });


  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: () => laravelApiRequest("GET", "/api/projects"),
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'director';

  // Group projects by type and consortium
  const ahpProjects = projects.filter((p: any) => p.type === 'AHP');
  const privateProjects = projects.filter((p: any) => p.type === 'Private');

  // Group AHP projects by consortium
  const consortiumGroups = ahpProjects.reduce((acc: any, project: any) => {
    const consortium = project.consortium || 'unassigned';
    if (!acc[consortium]) acc[consortium] = [];
    acc[consortium].push(project);
    return acc;
  }, {});


  // Get current week's date range (Mon → Sun)
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });

  // ✅ Weekly tasks (all tasks marked as weekly)
  const weeklyTasks = tasks.filter((t: any) => t.is_weekly_deliverable);
  const incompleteTasks = weeklyTasks.filter((t: any) => t.status !== "completed");
  const completedTasks = tasks.filter((t: any) => {
    if (t.status !== "completed") return false;
    // Prefer actual completion date if available, fallback to target
    const dateStr = t.actualCompletionDate || t.targetCompletionDate;
    if (!dateStr) return false;
    const date = parseISO(dateStr);
    return isWithinInterval(date, { start, end });
  });

  console.log("All Weekly Tasks", weeklyTasks);
  console.log("Incomplete Weekly Tasks", incompleteTasks);
  console.log("Completed Tasks This Week", completedTasks);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConsortiumColor = (consortium: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800'
    ];
    const index = parseInt(consortium.replace('consortium_', '')) - 1;
    return colors[index] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-becs-warm-cream">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-becs-text-primary mb-2">
                Executive <span className="text-becs-maroon">Dashboard</span>
              </h1>
              <p className="text-becs-text-secondary text-lg">
                Welcome back, {user?.firstName}! Here's your comprehensive project overview.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-becs-navy hover:bg-becs-navy-dark text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm"
              >
                <CheckSquare className="h-4 w-4" />
                Assign Weekly Task
              </button>
            )}
          </div>
        </div>

        {/* Executive Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="becs-professional-card border-l-4 border-l-becs-gold">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-becs-text-secondary">Active Projects</p>
                  <p className="text-2xl font-bold text-becs-text-primary">{stats?.activeProjects || projects.length}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-becs-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="becs-professional-card border-l-4 border-l-becs-navy">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-becs-text-secondary">Weekly Tasks</p>
                  <p className="text-2xl font-bold text-becs-text-primary">{weeklyTasks.length}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-becs-navy" />
              </div>
            </CardContent>
          </Card>

          <Card className="becs-professional-card border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-becs-text-secondary">Staff Present</p>
                  <p className="text-2xl font-bold text-becs-text-primary">{stats?.staffPresent || users.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="becs-professional-card border-l-4 border-l-becs-maroon">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-becs-text-secondary">Pending Items</p>
                  <p className="text-2xl font-bold text-becs-maroon">{incompleteTasks.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-becs-maroon" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AHP Consortium Projects */}
        {isAdmin && (
          <div className="mb-8">
            <Card className="becs-professional-card">
              <CardHeader className="border-b border-becs-soft-gray">
                <CardTitle className="text-xl font-semibold text-becs-text-primary flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-becs-navy" />
                  AHP Consortium Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map(num => {
                    const consortiumKey = `consortium_${num}`;
                    const consortiumProjects = consortiumGroups[consortiumKey] || [];

                    return (
                      <div key={num} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={getConsortiumColor(consortiumKey)}>
                            Consortium {num}
                          </Badge>
                          <span className="text-sm text-becs-text-secondary">
                            {consortiumProjects.length} projects
                          </span>
                        </div>
                        <div className="space-y-2">
                          {consortiumProjects.slice(0, 3).map((project: any) => (
                            <div key={project.id} className="p-3 bg-becs-warm-cream rounded-lg border border-becs-soft-gray">
                              <p className="font-medium text-sm text-becs-text-primary truncate">{project.name}</p>
                              <p className="text-xs text-becs-text-secondary">{project.code}</p>
                            </div>
                          ))}
                          {consortiumProjects.length > 3 && (
                            <p className="text-xs text-becs-text-secondary text-center">
                              +{consortiumProjects.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Weekly Task Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Incomplete Tasks (Priority) */}
          <Card className="becs-professional-card">
            <CardHeader className="border-b border-becs-soft-gray">
              <CardTitle className="text-lg font-semibold text-becs-text-primary flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-becs-maroon" />
                Pending Weekly Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {incompleteTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-becs-text-secondary mx-auto mb-4" />
                  <p className="text-becs-text-secondary">All weekly tasks completed!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incompleteTasks.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="p-4 bg-white rounded-lg border border-becs-soft-gray">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-becs-text-primary">{task.title}</h4>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-becs-text-secondary mb-2">
                        Assigned to:  <b>{task.assignee?.first_name +" "+ task.assignee?.last_name || 'Unassigned'}</b>
                      </p>
                      {task.targetCompletionDate && (
                        <p className="text-xs text-becs-text-secondary">
                          Due: {new Date(task.targetCompletionDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card className="becs-professional-card">
            <CardHeader className="border-b border-becs-soft-gray">
              <CardTitle className="text-lg font-semibold text-becs-text-primary flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Completed This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-becs-text-secondary mx-auto mb-4" />
                  <p className="text-becs-text-secondary">No completed tasks this week</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedTasks.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-800">{task.title}</h4>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Completed
                        </Badge> 
                      </div>
                      <p className="text-sm text-green-700 mb-2">
                        By: {users.find((u: any) => u.id === task.assignee_id)?.firstName || 'Unknown'}
                      </p>
                      {task.actualCompletionDate && (
                        <p className="text-xs text-green-600">
                          Completed: {new Date(task.actualCompletionDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Private Projects Overview */}
        {privateProjects.length > 0 && (
          <Card className="becs-professional-card mb-8">
            <CardHeader className="border-b border-becs-soft-gray">
              <CardTitle className="text-xl font-semibold text-becs-text-primary">
                Private Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {privateProjects.slice(0, 6).map((project: any) => (
                  <div key={project.id} className="p-4 bg-white rounded-lg border border-becs-soft-gray">
                    <h4 className="font-medium text-becs-text-primary mb-2">{project.name}</h4>
                    <p className="text-sm text-becs-text-secondary mb-2">{project.code}</p>
                    <Badge className="bg-purple-100 text-purple-800">
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Staff Management Section for Admins */}
        {isAdmin && (
          <Card className="becs-professional-card">
            <CardHeader className="border-b border-becs-soft-gray">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-becs-text-primary flex items-center gap-2">
                  <Users className="h-5 w-5 text-becs-blue" />
                  Staff Management
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsBulkImportOpen(true)}
                    variant="outline"
                    size="sm"
                    className="border-becs-blue text-becs-blue hover:bg-becs-blue hover:text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                  <Button
                    onClick={() => setIsStaffModalOpen(true)}
                    size="sm"
                    className="bg-becs-blue hover:bg-becs-navy"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-800">Total Staff</h4>
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                  <p className="text-sm text-blue-700">Active members</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-800">Present Today</h4>
                    <CheckSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {stats?.staffPresent || 0}
                  </p>
                  <p className="text-sm text-green-700">Currently working</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-800">Departments</h4>
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {new Set(users.map((u: any) => u.department)).size}
                  </p>
                  <p className="text-sm text-purple-700">Active departments</p>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="font-medium text-becs-text-primary mb-3">Recent Staff Activity</h5>
                <div className="space-y-2">
                  {users.slice(0, 3).map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-becs-soft-gray">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-becs-blue text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-becs-text-primary">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-sm text-becs-text-secondary">{member.position || member.department}</p>
                        </div>
                      </div>
                      <Badge className="bg-becs-soft-blue text-becs-blue">
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <TaskAssignmentModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
        />

        <StaffCreationModal
          isOpen={isStaffModalOpen}
          onClose={() => setIsStaffModalOpen(false)}
        />

        <BulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
        />
      </div>
    </div>
  );
}