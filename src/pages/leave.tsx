import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, FileText, Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format, differenceInDays } from "date-fns";

const leaveApplicationSchema = z.object({
  leaveType: z.string().min(1, "Please select a leave type"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(10, "Please provide a detailed reason (minimum 10 characters)"),
  attachmentUrl: z.string().optional(),
});

type LeaveApplicationForm = z.infer<typeof leaveApplicationSchema>;

const leaveTypes = [
  { value: "annual", label: "Annual Leave", color: "bg-blue-100 text-blue-800" },
  { value: "sick", label: "Sick Leave", color: "bg-red-100 text-red-800" },
  { value: "maternity", label: "Maternity Leave", color: "bg-pink-100 text-pink-800" },
  { value: "paternity", label: "Paternity Leave", color: "bg-green-100 text-green-800" },
  { value: "emergency", label: "Emergency Leave", color: "bg-orange-100 text-orange-800" },
  { value: "study", label: "Study Leave", color: "bg-purple-100 text-purple-800" },
  { value: "compassionate", label: "Compassionate Leave", color: "bg-gray-100 text-gray-800" },
];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function Leave() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<LeaveApplicationForm>({
    resolver: zodResolver(leaveApplicationSchema),
    defaultValues: {
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
      attachmentUrl: "",
    },
  });

  // Fetch leave applications
  const { data: leaveApplications = [], isLoading } = useQuery({
    queryKey: ["/api/leave-applications"],
  });

  // Fetch leave templates
  const { data: leaveTemplates = [] } = useQuery({
    queryKey: ["/api/leave-templates"],
  });

  // Create leave application mutation
  const createLeaveApplication = useMutation({
    mutationFn: async (data: LeaveApplicationForm) => {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const totalDays = differenceInDays(endDate, startDate) + 1;

      return apiRequest("/api/leave-applications", "POST", {
        ...data,
        totalDays,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-applications"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Leave Application Submitted",
        description: "Your leave application has been submitted for review.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit leave application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeaveApplicationForm) => {
    createLeaveApplication.mutate(data);
  };

  const filteredApplications = leaveApplications.filter((application: any) =>
    application.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.leaveType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLeaveTypeInfo = (type: string) => {
    return leaveTypes.find(lt => lt.value === type) || { label: type, color: "bg-gray-100 text-gray-800" };
  };

  return (
    <div className="min-h-screen bg-becs-warm-cream">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-becs-text-primary mb-2">Leave Management</h1>
              <p className="text-becs-text-secondary text-lg">Manage your leave applications and view company policies</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-becs-navy hover:bg-becs-navy-dark text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-becs-text-primary">New Leave Application</DialogTitle>
                  <DialogDescription className="text-becs-text-secondary">
                    Submit a leave application for review by your supervisors.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="leaveType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-becs-text-primary font-medium">Leave Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-becs-soft-gray">
                                  <SelectValue placeholder="Select leave type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {leaveTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-becs-text-primary">Quick Templates</label>
                        <Select onValueChange={(templateId) => {
                          const template = leaveTemplates.find((t: any) => t.id.toString() === templateId);
                          if (template) {
                            form.setValue("reason", template.templateContent);
                            form.setValue("leaveType", template.leaveType);
                          }
                        }}>
                          <SelectTrigger className="border-becs-soft-gray">
                            <SelectValue placeholder="Use template" />
                          </SelectTrigger>
                          <SelectContent>
                            {leaveTemplates.map((template: any) => (
                              <SelectItem key={template.id} value={template.id.toString()}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-becs-text-primary font-medium">Start Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="border-becs-soft-gray"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-becs-text-primary font-medium">End Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="border-becs-soft-gray"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-becs-text-primary font-medium">Reason</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide a detailed reason for your leave request..."
                              className="min-h-[120px] border-becs-soft-gray resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attachmentUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-becs-text-primary font-medium">Supporting Document (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="URL to supporting document"
                              className="border-becs-soft-gray"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="border-becs-soft-gray text-becs-text-secondary"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createLeaveApplication.isPending}
                        className="bg-becs-navy hover:bg-becs-navy-dark text-white"
                      >
                        {createLeaveApplication.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="becs-professional-card border-l-4 border-l-becs-gold">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-becs-text-secondary">Annual Balance</p>
                  <p className="text-2xl font-bold text-becs-text-primary">21 days</p>
                </div>
                <CalendarDays className="h-8 w-8 text-becs-gold" />
              </div>
            </CardContent>
          </Card>
          <Card className="becs-professional-card border-l-4 border-l-becs-red">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-becs-text-secondary">Used This Year</p>
                  <p className="text-2xl font-bold text-becs-text-primary">5 days</p>
                </div>
                <Clock className="h-8 w-8 text-becs-red" />
              </div>
            </CardContent>
          </Card>
          <Card className="becs-professional-card border-l-4 border-l-becs-navy">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-becs-text-secondary">Pending Requests</p>
                  <p className="text-2xl font-bold text-becs-text-primary">
                    {filteredApplications.filter((app: any) => app.status === 'pending').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-becs-navy" />
              </div>
            </CardContent>
          </Card>
          <Card className="becs-professional-card border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-becs-text-secondary">Remaining Balance</p>
                  <p className="text-2xl font-bold text-becs-text-primary">16 days</p>
                </div>
                <CalendarDays className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card className="becs-professional-card">
          <CardHeader className="border-b border-becs-soft-gray">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-becs-text-primary">Leave Applications</CardTitle>
                <CardDescription className="text-becs-text-secondary">
                  Track your leave requests and their approval status
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-becs-text-secondary h-4 w-4" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-becs-soft-gray"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-becs-text-secondary">Loading applications...</div>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <FileText className="h-12 w-12 text-becs-text-secondary mb-4" />
                <p className="text-becs-text-secondary text-lg">No leave applications found</p>
                <p className="text-sm text-becs-text-secondary mt-1">Start by applying for your first leave</p>
              </div>
            ) : (
              <div className="divide-y divide-becs-soft-gray">
                {filteredApplications.map((application: any) => {
                  const leaveTypeInfo = getLeaveTypeInfo(application.leaveType);
                  return (
                    <div key={application.id} className="p-6 hover:bg-becs-warm-cream transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={leaveTypeInfo.color}>
                              {leaveTypeInfo.label}
                            </Badge>
                            <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-becs-text-primary mb-1">
                            {format(new Date(application.startDate), 'MMM dd, yyyy')} - {format(new Date(application.endDate), 'MMM dd, yyyy')}
                          </h3>
                          <p className="text-sm text-becs-text-secondary mb-2">
                            {application.totalDays} day{application.totalDays !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-becs-text-secondary line-clamp-2">
                            {application.reason}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-becs-text-secondary">
                            Applied {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                          </p>
                          {application.approvedAt && (
                            <p className="text-xs text-becs-text-secondary mt-1">
                              {application.status} {format(new Date(application.approvedAt), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}