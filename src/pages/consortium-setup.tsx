import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, Save, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Deliverable {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  reviewerId?: string;
  targetCompletionDate?: string;
  isWeeklyDeliverable: boolean;
}

export default function ConsortiumSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedConsortium, setSelectedConsortium] = useState<number>(1);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    {
      title: "",
      description: "",
      priority: "medium",
      isWeeklyDeliverable: false
    }
  ]);

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: existingDeliverables } = useQuery({
    queryKey: ['/api/consortiums', selectedConsortium, 'deliverables'],
    enabled: !!selectedConsortium,
  });

  const createDeliverablesMutation = useMutation({
    mutationFn: async (data: { deliverables: Deliverable[] }) => {
      await apiRequest('POST', `/api/consortiums/${selectedConsortium}/deliverables`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Deliverables created for Consortium ${selectedConsortium}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/consortiums', selectedConsortium, 'deliverables'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create deliverables",
        variant: "destructive",
      });
    },
  });

  const addDeliverable = () => {
    setDeliverables([...deliverables, {
      title: "",
      description: "",
      priority: "medium",
      isWeeklyDeliverable: false
    }]);
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const updateDeliverable = (index: number, field: keyof Deliverable, value: any) => {
    const updated = [...deliverables];
    updated[index] = { ...updated[index], [field]: value };
    setDeliverables(updated);
  };

  const handleSubmit = () => {
    const validDeliverables = deliverables.filter(d => d.title.trim() !== "");
    if (validDeliverables.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one deliverable with a title",
        variant: "destructive",
      });
      return;
    }

    createDeliverablesMutation.mutate({ deliverables: validDeliverables });
  };

  const staffUsers = users?.filter(u => u.role === 'staff') || [];
  const reviewerUsers = users?.filter(u => u.role === 'admin' || u.role === 'director') || [];

  if (user?.role !== 'admin' && user?.role !== 'director') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-becs-gray">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-becs-navy">Consortium Deliverables Setup</h1>
          <p className="text-becs-gray">Configure specific deliverables for AHP consortiums</p>
        </div>
      </div>

      {/* Consortium Selection */}
      <Card className="becs-professional-card">
        <CardHeader>
          <CardTitle className="text-becs-navy flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Consortium
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedConsortium.toString()} onValueChange={(value) => setSelectedConsortium(parseInt(value))}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose consortium" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Consortium 1 - Healthcare Infrastructure</SelectItem>
              <SelectItem value="2">Consortium 2 - Education Technology</SelectItem>
              <SelectItem value="3">Consortium 3 - Water & Sanitation</SelectItem>
              <SelectItem value="4">Consortium 4 - Agricultural Development</SelectItem>
              <SelectItem value="5">Consortium 5 - Energy Access</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Existing Deliverables */}
      {existingDeliverables && existingDeliverables.length > 0 && (
        <Card className="becs-professional-card">
          <CardHeader>
            <CardTitle className="text-becs-navy">
              Existing Deliverables ({existingDeliverables.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {existingDeliverables.map((deliverable: any) => (
                <div key={deliverable.id} className="flex items-center justify-between p-3 bg-becs-soft rounded-lg">
                  <div>
                    <p className="font-medium text-becs-navy">{deliverable.title}</p>
                    <p className="text-sm text-becs-gray">{deliverable.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={deliverable.priority === 'high' ? 'destructive' : deliverable.priority === 'medium' ? 'default' : 'secondary'}>
                      {deliverable.priority}
                    </Badge>
                    {deliverable.isWeeklyDeliverable && (
                      <Badge variant="outline">Weekly</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Deliverables */}
      <Card className="becs-professional-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-becs-navy">Add Consortium {selectedConsortium} Deliverables</CardTitle>
            <Button onClick={addDeliverable} variant="outline" className="border-becs-blue text-becs-blue hover:bg-becs-blue hover:text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Deliverable
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {deliverables.map((deliverable, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-becs-navy">Deliverable {index + 1}</h4>
                {deliverables.length > 1 && (
                  <Button 
                    onClick={() => removeDeliverable(index)} 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-becs-navy mb-1">Title *</label>
                  <Input
                    value={deliverable.title}
                    onChange={(e) => updateDeliverable(index, 'title', e.target.value)}
                    placeholder="Enter deliverable title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-becs-navy mb-1">Priority</label>
                  <Select 
                    value={deliverable.priority} 
                    onValueChange={(value) => updateDeliverable(index, 'priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-becs-navy mb-1">Assign To</label>
                  <Select 
                    value={deliverable.assigneeId || ""} 
                    onValueChange={(value) => updateDeliverable(index, 'assigneeId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-becs-navy mb-1">Reviewer</label>
                  <Select 
                    value={deliverable.reviewerId || ""} 
                    onValueChange={(value) => updateDeliverable(index, 'reviewerId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {reviewerUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-becs-navy mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={deliverable.targetCompletionDate || ""}
                    onChange={(e) => updateDeliverable(index, 'targetCompletionDate', e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`weekly-${index}`}
                    checked={deliverable.isWeeklyDeliverable}
                    onChange={(e) => updateDeliverable(index, 'isWeeklyDeliverable', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`weekly-${index}`} className="text-sm text-becs-navy">
                    Weekly Deliverable
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-becs-navy mb-1">Description</label>
                <Textarea
                  value={deliverable.description}
                  onChange={(e) => updateDeliverable(index, 'description', e.target.value)}
                  placeholder="Describe the deliverable requirements..."
                  rows={3}
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={createDeliverablesMutation.isPending}
              className="bg-becs-blue hover:bg-becs-navy"
            >
              <Save className="w-4 h-4 mr-2" />
              {createDeliverablesMutation.isPending ? 'Creating...' : `Create Deliverables for Consortium ${selectedConsortium}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}