import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  taskTitle: string;
}

export default function TaskUploadModal({ isOpen, onClose, taskId, taskTitle }: TaskUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/tasks/${taskId}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "File Uploaded Successfully",
        description: `${data.fileName} has been submitted for review.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      onClose();
      setFile(null);
      setSubmissionNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('submissionNotes', submissionNotes);

    uploadMutation.mutate(formData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-becs-text-primary flex items-center gap-2">
            <Upload className="h-5 w-5 text-becs-navy" />
            Submit Task File
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-becs-text-primary">
              Task: {taskTitle}
            </Label>
          </div>

          <div>
            <Label htmlFor="file" className="text-sm font-medium text-becs-text-primary">
              Upload File
            </Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
              className="mt-1"
              required
            />
            {file && (
              <div className="mt-2 p-3 bg-becs-warm-cream rounded-lg border border-becs-soft-gray">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-becs-navy" />
                  <span className="text-sm font-medium text-becs-text-primary">{file.name}</span>
                </div>
                <p className="text-xs text-becs-text-secondary mt-1">
                  Size: {formatFileSize(file.size)}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-becs-text-primary">
              Submission Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Add any notes about your submission..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Upload Guidelines:</p>
                <ul className="mt-1 text-xs space-y-1">
                  <li>• Maximum file size: 50MB</li>
                  <li>• Accepted formats: PDF, DOC, XLS, PPT, images, archives</li>
                  <li>• File will be submitted for reviewer approval</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-becs-navy hover:bg-becs-navy-dark text-white"
              disabled={uploadMutation.isPending || !file}
            >
              {uploadMutation.isPending ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit File
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}