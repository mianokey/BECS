import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { 
  Plus, 
  Upload, 
  Download, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Calendar,
  Database,
  Import,
  UserPlus,
  Briefcase,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Import modals
import ProjectCreationModal from "@/components/modals/project-creation-modal";
import StaffCreationModal from "@/components/modals/staff-creation-modal";
import TaskAssignmentModal from "@/components/modals/task-assignment-modal";
import BulkImportModal from "@/components/modals/bulk-import-modal";
import { laravelApiRequest } from "@/lib/laravel-api";

export default function DataEntry() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Modal states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Data queries
    const { data: users } = useQuery({
      queryKey: ['dashboardStats'], // cache key
      queryFn: () => laravelApiRequest("GET", '/api/users'),
    });
    const { data: projects } = useQuery({
      queryKey: ['dashboardStats'], // cache key
      queryFn: () => laravelApiRequest("GET", '/api/projects'),
    });

    const { data: tasks } = useQuery({
      queryKey: ['dashboardStats'], // cache key
      queryFn: () => laravelApiRequest("GET", '/api/tasks'),
    });

    const { data: attendance } = useQuery({
      queryKey: ['dashboardStats'], // cache key
      queryFn: () => laravelApiRequest("GET", '/api/attendance'),
    });

  const isAdmin = user?.role === 'admin' || user?.role === 'director';

  // Populate sample data mutation
  const populateSampleDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/populate-sample-data");
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: "Sample data populated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to populate sample data",
        variant: "destructive",
      });
    },
  });

  const downloadTemplate = (type: string) => {
    let csvContent = "";
    let filename = "";
    
    switch (type) {
      case "staff":
        csvContent = "firstName,lastName,email,staffId,role,department,position,phoneNumber,password\n";
        csvContent += "John,Doe,john.doe@becs.co.ke,BECS020,staff,Operations,Coordinator,+254700123020,password123\n";
        csvContent += "Jane,Smith,jane.smith@becs.co.ke,BECS021,staff,Finance,Analyst,+254700123021,password123";
        filename = "staff_template.csv";
        break;
      case "projects":
        csvContent = "name,code,type,consortium,description,status,startDate,endDate,clientName\n";
        csvContent += "Sample AHP Project,AHP-SAMPLE-2025,AHP,consortium_1,Sample project description,active,2025-01-01,2025-12-31,\n";
        csvContent += "Sample Private Project,PVT-SAMPLE-2025,Private,,Private project description,active,2025-01-01,2025-12-31,ABC Company";
        filename = "projects_template.csv";
        break;
      case "tasks":
        csvContent = "title,description,assignedTo,projectCode,status,priority,targetDate,estimatedHours,deliverables\n";
        csvContent += "Sample Task,Task description,BECS005,AHP-C1-2025,not_started,medium,2025-02-15,20,Task deliverables";
        filename = "tasks_template.csv";
        break;
      case "attendance":
        csvContent = "userId,date,timeIn,timeOut,status,notes\n";
        csvContent += "BECS005,2025-01-07,08:30:00,17:30:00,present,Regular working day";
        filename = "attendance_template.csv";
        break;
      default:
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Database className="h-16 w-16 text-becs-gray mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-becs-navy mb-2">Access Restricted</h2>
          <p className="text-becs-gray">Only administrators can access the data entry interface.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-becs-navy">Data Entry & Population</h1>
          <p className="text-becs-gray">Manage system data, import records, and populate the database</p>
        </div>
        <Button 
          onClick={() => populateSampleDataMutation.mutate()}
          disabled={populateSampleDataMutation.isPending}
          className="bg-becs-red hover:bg-red-700"
        >
          <Database className="w-4 h-4 mr-2" />
          {populateSampleDataMutation.isPending ? "Populating..." : "Populate Sample Data"}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="becs-professional-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm">Total Staff</p>
                <p className="text-2xl font-bold text-becs-navy">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-becs-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="becs-professional-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm">Active Projects</p>
                <p className="text-2xl font-bold text-becs-navy">{projects.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-becs-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="becs-professional-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-becs-navy">{tasks.length}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-becs-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="becs-professional-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm">Attendance Records</p>
                <p className="text-2xl font-bold text-becs-navy">{attendance.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-becs-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Entry Interface */}
      <Card className="becs-professional-card">
        <CardHeader className="border-b border-becs-soft-gray">
          <CardTitle className="text-xl font-semibold text-becs-navy">Data Entry Interface</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="individual">Individual Entry</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border border-blue-200 hover:border-blue-400 transition-colors">
                  <CardContent className="p-6 text-center">
                    <UserPlus className="h-12 w-12 text-becs-blue mx-auto mb-4" />
                    <h3 className="font-semibold text-becs-navy mb-2">Add Staff Member</h3>
                    <p className="text-sm text-becs-gray mb-4">Create new staff member accounts</p>
                    <Button 
                      onClick={() => setIsStaffModalOpen(true)}
                      className="w-full bg-becs-blue hover:bg-becs-navy"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Staff
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-green-200 hover:border-green-400 transition-colors">
                  <CardContent className="p-6 text-center">
                    <Briefcase className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-becs-navy mb-2">Create Project</h3>
                    <p className="text-sm text-becs-gray mb-4">Add new AHP or private projects</p>
                    <Button 
                      onClick={() => setIsProjectModalOpen(true)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-purple-200 hover:border-purple-400 transition-colors">
                  <CardContent className="p-6 text-center">
                    <ClipboardList className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-becs-navy mb-2">Assign Task</h3>
                    <p className="text-sm text-becs-gray mb-4">Create and assign new tasks</p>
                    <Button 
                      onClick={() => setIsTaskModalOpen(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Assign Task
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-6">
              <div className="text-center py-8">
                <Upload className="h-16 w-16 text-becs-blue mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-becs-navy mb-2">Bulk Data Import</h3>
                <p className="text-becs-gray mb-6">Import multiple records at once using CSV files</p>
                <Button 
                  onClick={() => setIsBulkImportOpen(true)}
                  className="bg-becs-blue hover:bg-becs-navy"
                >
                  <Import className="w-4 h-4 mr-2" />
                  Start Bulk Import
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { type: "staff", icon: Users, color: "blue", label: "Staff Template" },
                  { type: "projects", icon: FolderOpen, color: "green", label: "Projects Template" },
                  { type: "tasks", icon: CheckSquare, color: "purple", label: "Tasks Template" },
                  { type: "attendance", icon: Calendar, color: "orange", label: "Attendance Template" }
                ].map(({ type, icon: Icon, color, label }) => (
                  <Card key={type} className={`border border-${color}-200 hover:border-${color}-400 transition-colors`}>
                    <CardContent className="p-4 text-center">
                      <Icon className={`h-8 w-8 text-${color}-600 mx-auto mb-2`} />
                      <h4 className="font-medium text-becs-navy mb-2">{label}</h4>
                      <Button 
                        onClick={() => downloadTemplate(type)}
                        size="sm"
                        variant="outline"
                        className={`w-full border-${color}-300 text-${color}-700 hover:bg-${color}-50`}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">Template Usage Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Download the appropriate CSV template for your data type</li>
                  <li>• Fill in the template with your data following the column headers</li>
                  <li>• Ensure date formats are YYYY-MM-DD</li>
                  <li>• Use the bulk import feature to upload your completed template</li>
                  <li>• Required fields are marked and should not be left empty</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
      <ProjectCreationModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <StaffCreationModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
      />

      <TaskAssignmentModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />
    </div>
  );
}