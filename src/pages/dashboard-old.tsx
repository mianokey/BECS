import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, FolderOpen, CheckSquare, Clock, Users, AlertTriangle } from "lucide-react";
import StaffCard from "@/components/cards/staff-card";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import TaskAssignmentModal from "@/components/modals/task-assignment-modal";

export default function Dashboard() {
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'director';

  // Filter tasks for general and weekly deliverables
  const generalDeliverables = tasks?.filter(task => !task.isWeeklyDeliverable) || [];
  const weeklyDeliverables = tasks?.filter(task => task.isWeeklyDeliverable) || [];

  // Get staff members and their task statistics
  const staffMembers = users?.filter(u => u.role === 'staff') || [];
  const getStaffStats = (staffId: string) => {
    const staffTasks = tasks?.filter(t => t.assigneeId === staffId) || [];
    const weeklyTasks = staffTasks.filter(t => {
      const taskDate = new Date(t.dateAssigned);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return taskDate >= weekStart;
    });
    
    return {
      weeklyTasks: weeklyTasks.length,
      completedTasks: staffTasks.filter(t => t.status === 'completed').length,
      overdueTasks: staffTasks.filter(t => t.status === 'overdue').length,
      workloadPercentage: Math.min(weeklyTasks.length * 20, 100), // Rough calculation
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-becs-blue';
      case 'overdue': return 'bg-red-100 text-becs-red';
      case 'submitted': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-becs-warm-cream">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-becs-text-primary mb-2">Executive Dashboard</h1>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="becs-professional-card border-l-4 border-l-becs-gold">
            <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm font-medium">Active Projects</p>
                <p className="text-2xl font-bold text-becs-navy">{stats?.activeProjects || 0}</p>
              </div>
              <div className="w-12 h-12 becs-gradient rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm font-medium">Pending Tasks</p>
                <p className="text-2xl font-bold text-becs-navy">{stats?.pendingTasks || 0}</p>
              </div>
              <div className="w-12 h-12 becs-gold-gradient rounded-lg flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm font-medium">Staff Present</p>
                <p className="text-2xl font-bold text-becs-navy">{stats?.staffPresent || '0/0'}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm font-medium">Overdue Tasks</p>
                <p className="text-2xl font-bold text-becs-red">{stats?.overdueTasks || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-becs-red to-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Dashboards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* General Deliverables Dashboard */}
        <Card className="border border-gray-100">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-becs-navy">General Deliverables</CardTitle>
              <span className="text-sm text-becs-gray">Non-time based</span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {generalDeliverables.length === 0 ? (
                <p className="text-center text-becs-gray py-8">No general deliverables</p>
              ) : (
                generalDeliverables.slice(0, 3).map((deliverable) => (
                  <div key={deliverable.id} className="flex items-center justify-between p-4 bg-becs-soft rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        deliverable.status === 'completed' ? 'bg-green-500' :
                        deliverable.status === 'overdue' ? 'bg-becs-red' : 'bg-becs-blue'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{deliverable.title}</p>
                        <p className="text-sm text-becs-gray">
                          {projects?.find(p => p.id === deliverable.projectId)?.code}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(deliverable.status)}>
                      {deliverable.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Deliverables Dashboard */}
        <Card className="border border-gray-100">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-becs-navy">Weekly Deliverables</CardTitle>
              <span className="text-sm text-becs-gray">Time-based</span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {weeklyDeliverables.length === 0 ? (
                <p className="text-center text-becs-gray py-8">No weekly deliverables</p>
              ) : (
                weeklyDeliverables.slice(0, 3).map((deliverable) => {
                  const assignee = users?.find(u => u.id === deliverable.assigneeId);
                  const progress = deliverable.status === 'completed' ? 100 : 
                                 deliverable.status === 'in_progress' ? 60 : 30;
                  
                  return (
                    <div key={deliverable.id} className="p-4 bg-becs-soft rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{deliverable.title}</p>
                          <p className="text-sm text-becs-gray">
                            {assignee?.firstName} {assignee?.lastName}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-becs-blue">
                          Due: {new Date(deliverable.targetCompletionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-becs-blue h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-becs-gray mt-2">{progress}% Complete</p>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff-based Task Management */}
      {isAdmin && (
        <Card className="border border-gray-100">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-becs-navy">Staff Task Overview</CardTitle>
              <div className="flex items-center space-x-2">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-becs-blue">
                  <option>This Week</option>
                  <option>Next Week</option>
                  <option>This Month</option>
                </select>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="bg-becs-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-becs-navy transition-colors"
                >
                  <CheckSquare className="w-4 h-4 mr-2 inline" />
                  Assign Task
                </button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {staffMembers.map((staff) => {
                const stats = getStaffStats(staff.id);
                return (
                  <StaffCard
                    key={staff.id}
                    staff={staff}
                    weeklyTasks={stats.weeklyTasks}
                    completedTasks={stats.completedTasks}
                    overdueTasks={stats.overdueTasks}
                    workloadPercentage={stats.workloadPercentage}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

        <TaskAssignmentModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
        />
      </div>
    </div>
  );
}
