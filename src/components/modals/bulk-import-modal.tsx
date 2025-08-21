import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileText } from "lucide-react";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkImportModal({ isOpen, onClose }: BulkImportModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [importType, setImportType] = useState<string>("");
  const [csvData, setCsvData] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const bulkImportMutation = useMutation({
    mutationFn: async (data: { type: string; csvData: string }) => {
      await apiRequest("POST", "/api/bulk-import", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Data imported successfully",
      });
      setCsvData("");
      setFile(null);
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleImport = () => {
    if (!importType || !csvData) {
      toast({
        title: "Error",
        description: "Please select import type and provide data",
        variant: "destructive",
      });
      return;
    }

    bulkImportMutation.mutate({
      type: importType,
      csvData: csvData,
    });
  };

  const downloadTemplate = (type: string) => {
    let csvContent = "";
    
    switch (type) {
      case "staff":
        csvContent = "firstName,lastName,email,staffId,role,department,position,phoneNumber,password\n";
        csvContent += "John,Doe,john.doe@becs.co.ke,BECS020,staff,Operations,Coordinator,+254700123020,password123\n";
        csvContent += "Jane,Smith,jane.smith@becs.co.ke,BECS021,staff,Finance,Analyst,+254700123021,password123";
        break;
      case "projects":
        csvContent = "name,code,type,consortium,description,status,startDate,endDate,clientName\n";
        csvContent += "Sample AHP Project,AHP-SAMPLE-2025,AHP,consortium_1,Sample project description,active,2025-01-01,2025-12-31,\n";
        csvContent += "Sample Private Project,PVT-SAMPLE-2025,Private,,Private project description,active,2025-01-01,2025-12-31,ABC Company";
        break;
      case "tasks":
        csvContent = "title,description,assignedTo,projectCode,status,priority,targetDate,estimatedHours,deliverables\n";
        csvContent += "Sample Task,Task description,BECS005,AHP-C1-2025,not_started,medium,2025-02-15,20,Task deliverables";
        break;
      default:
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Data Import
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Import Type</Label>
            <Select value={importType} onValueChange={setImportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select what to import" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff Members</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
                <SelectItem value="attendance">Attendance Records</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {importType && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadTemplate(importType)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <span className="text-sm text-muted-foreground">
                  Download CSV template for {importType}
                </span>
              </div>

              <div className="space-y-2">
                <Label>Upload CSV File</Label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>CSV Data Preview</Label>
                <Textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Paste your CSV data here or upload a file above"
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Import Guidelines:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure your CSV follows the template format exactly</li>
                  <li>• First row should contain column headers</li>
                  <li>• Use comma (,) as the delimiter</li>
                  <li>• Date format should be YYYY-MM-DD</li>
                  <li>• Empty fields are allowed for optional columns</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!importType || !csvData || bulkImportMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {bulkImportMutation.isPending ? "Importing..." : "Import Data"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}