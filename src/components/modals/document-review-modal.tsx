import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle, XCircle, AlertTriangle, FileText, Calendar, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { review, Task,User } from "@/types";
import { laravelApiRequest } from "@/lib/laravel-api";

const reviewSchema = z.object({
  status: z.enum(['approved', 'needs_rework', 'rejected']),
  comments: z.string().min(1, 'Comments are required'),
});

type ReviewForm = z.infer<typeof reviewSchema>;

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  users: User[];
}

export default function DocumentReviewModal({ isOpen, onClose, task, users }: DocumentReviewModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: 'approved',
      comments: '',
    },
  });


  const { data: reviews = [] } = useQuery<review[]>({
  queryKey: ['/api/taks'],
  queryFn: () => laravelApiRequest("GET", "/api/reviews"),
});


 

  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewForm) => {
      await apiRequest('POST', `/api/tasks/${task.id}/reviews`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${task.id}/reviews`] });
      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewForm) => {
    submitReviewMutation.mutate(data);
  };

  const getAssigneeName = () => {
    const assignee = users.find(u => u.id === task.assigneeId);
    return assignee ? `${assignee.first_name} ${assignee.last_name}` : 'Unknown';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'needs_rework':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'needs_rework':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-becs-navy flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Document Review - {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-becs-navy">Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-becs-gray" />
                  <span className="text-sm text-becs-gray">Submitted by:</span>
                  <span className="font-medium">{getAssigneeName()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-becs-gray" />
                  <span className="text-sm text-becs-gray">Submitted:</span>
                  <span className="font-medium">
                    {task.uploadedAt ? new Date(task.uploadedAt).toLocaleDateString() : 'Not uploaded'}
                  </span>
                </div>
              </div>
              
              {task.description && (
                <div>
                  <span className="text-sm text-becs-gray">Description:</span>
                  <p className="text-sm mt-1">{task.description}</p>
                </div>
              )}

              {task.submissionNotes && (
                <div>
                  <span className="text-sm text-becs-gray">Submission Notes:</span>
                  <p className="text-sm mt-1 bg-blue-50 p-3 rounded-lg">{task.submissionNotes}</p>
                </div>
              )}

              {task.uploadedFileName && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-becs-gray" />
                  <span className="text-sm text-becs-gray">File:</span>
                  <a 
                    href={`/api/tasks/${task.id}/download`}
                    className="text-becs-blue hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {task.uploadedFileName}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Previous Reviews */}
          {reviews && reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-becs-navy">Review History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(review.status)}
                        <Badge className={getStatusColor(review.status)}>
                          {review.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-sm text-becs-gray">
                        {new Date(review.reviewedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comments && (
                      <p className="text-sm text-gray-700">{review.comments}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Review Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-becs-navy">Submit Review</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Decision</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select review decision" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="approved">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Approve
                              </div>
                            </SelectItem>
                            <SelectItem value="needs_rework">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                Needs Rework
                              </div>
                            </SelectItem>
                            <SelectItem value="rejected">
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-600" />
                                Reject
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Comments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide detailed feedback and comments..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitReviewMutation.isPending}
                      className="bg-becs-blue hover:bg-becs-navy"
                    >
                      {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}