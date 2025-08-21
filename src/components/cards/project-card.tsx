import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Project } from "@shared/schema";
import { FolderOpen, Plus } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  tasksCount: number;
  completionPercentage: number;
  onAssignTask: (projectId: number) => void;
  onProjectClick?: (project: Project) => void;
}

export default function ProjectCard({ 
  project, 
  tasksCount, 
  completionPercentage,
  onAssignTask,
  onProjectClick 
}: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'AHP' ? 'bg-becs-blue text-white' : 'bg-becs-gold text-white';
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onProjectClick?.(project)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 becs-gradient rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-becs-navy">{project.code}</CardTitle>
              <p className="text-sm text-becs-gray">{project.name}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge className={getTypeColor(project.type)}>
              {project.type}
            </Badge>
            <Badge variant="secondary" className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-becs-gray">Tasks:</span>
            <span className="font-medium text-becs-navy">{tasksCount}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-becs-gray">Progress:</span>
            <span className="font-medium text-becs-navy">{completionPercentage}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-becs-blue h-2 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          
          {project.clientName && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-becs-gray">Client:</span>
              <span className="font-medium text-gray-900">{project.clientName}</span>
            </div>
          )}
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAssignTask(project.id);
            }}
            variant="outline"
            size="sm"
            className="w-full mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Assign Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
