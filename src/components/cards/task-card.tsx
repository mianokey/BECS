import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, Clock, User, Calendar, MessageSquare, Eye, CheckCircle, XCircle, AlertTriangle, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import TaskUploadModal from "@/components/modals/task-upload-modal";
import DocumentReviewModal from "@/components/modals/document-review-modal";
import type { Task, User as UserType } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  users: UserType[];
  showUploadButton?: boolean;
  showDownloadButton?: boolean;
}

export default function TaskCard({ task, users, showUploadButton = true, showDownloadButton = true }: TaskCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const assignedUser = users.find(u => u.id === task.assigneeId);
  const reviewer = users.find(u => u.id === task.reviewerId);

  const isAssignedUser = user?.id === task.assigneeId;
  const isReviewer = user?.id === task.reviewerId;
  const isAdmin = user?.role === 'admin' || user?.role === 'director';

  const canUpload = isAssignedUser && task.status !== 'completed';
  const canDownload = (isReviewer || isAdmin) && task.uploadedFileName;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'needs_rework': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <FileText className="w-4 h-4" />;
      case 'submitted': return <Upload className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'needs_rework': return <RotateCcw className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/tasks/${task.id}/download`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Download failed');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = task.uploadedFileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: `Downloading ${task.uploadedFileName}`,
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="becs-professional-card hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-becs-text-primary leading-tight">
              {task.title}
            </CardTitle>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(task.priority || 'medium')}>
                {task.priority || 'medium'}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(task.status)}
                  {task.status.replace('_', ' ').toUpperCase()}
                </div>
              </Badge>
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-becs-text-secondary mt-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Task Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-becs-navy" />
              <span className="text-becs-text-secondary">Assigned:</span>
              <span className="font-medium text-becs-text-primary">
                {assignedUser?.firstName || 'Unassigned'}
              </span>
            </div>
            
            {reviewer && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-becs-gold" />
                <span className="text-becs-text-secondary">Reviewer:</span>
                <span className="font-medium text-becs-text-primary">
                  {reviewer.firstName}
                </span>
              </div>
            )}

            {task.targetCompletionDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-becs-red" />
                <span className="text-becs-text-secondary">Due:</span>
                <span className="font-medium text-becs-text-primary">
                  {new Date(task.targetCompletionDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {task.uploadedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-becs-text-secondary">Uploaded:</span>
                <span className="font-medium text-becs-text-primary">
                  {new Date(task.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* File Information */}
          {task.uploadedFileName && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">{task.uploadedFileName}</span>
              </div>
              {task.submissionNotes && (
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm text-green-700">
                    <strong>Notes:</strong> {task.submissionNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {canUpload && showUploadButton && (
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex-1 bg-becs-navy hover:bg-becs-navy-dark text-white"
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                {task.uploadedFileName ? 'Update File' : 'Upload File'}
              </Button>
            )}

            {canDownload && showDownloadButton && (
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 border-becs-gold text-becs-gold hover:bg-becs-gold hover:text-white"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}

            {(isReviewer || isAdmin) && task.status === 'submitted' && (
              <Button
                onClick={() => setIsReviewModalOpen(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Review Document
              </Button>
            )}

            {!canUpload && !canDownload && task.uploadedFileName && task.status !== 'submitted' && (
              <div className="text-sm text-becs-text-secondary italic">
                File submitted - awaiting review
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TaskUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
      />

      <DocumentReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        task={task}
        users={users}
      />
    </>
  );
}