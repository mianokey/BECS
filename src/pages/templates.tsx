import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Search, Download, Eye, Edit } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import TemplateUploadModal from "@/components/modals/template-upload-modal";

export default function Templates() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: templates } = useQuery({
    queryKey: ['/api/templates'],
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'director';

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'contracts': return 'bg-becs-blue text-white';
      case 'letters': return 'bg-becs-gold text-white';
      case 'reports': return 'bg-green-500 text-white';
      case 'forms': return 'bg-purple-500 text-white';
      case 'legal': return 'bg-becs-red text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTemplateIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'contracts': return '📋';
      case 'letters': return '✉️';
      case 'reports': return '📊';
      case 'forms': return '📝';
      case 'legal': return '⚖️';
      default: return '📄';
    }
  };

  // Filter templates
  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = searchTerm === "" || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || 
      template.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Get unique categories
  const categories = [...new Set(templates?.map(t => t.category) || [])];

  // Group templates by category
  const templatesByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredTemplates.filter(t => t.category === category);
    return acc;
  }, {} as Record<string, typeof filteredTemplates>);

  const handleDownload = (template: any) => {
    if (template.downloadUrl) {
      window.open(template.downloadUrl, '_blank');
    } else {
      // Handle local file download if needed
      console.log('Download template:', template.name);
    }
  };

  const handlePreview = (template: any) => {
    // Handle template preview
    console.log('Preview template:', template.name);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-becs-navy">Templates Library</h1>
          <p className="text-becs-gray">Access and manage document templates for your work</p>
        </div>
        {isAdmin && (
          <Button 
            className="bg-becs-blue hover:bg-becs-navy"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm font-medium">Total Templates</p>
                <p className="text-2xl font-bold text-becs-navy">{templates?.length || 0}</p>
              </div>
              <div className="w-12 h-12 becs-gradient rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm font-medium">Categories</p>
                <p className="text-2xl font-bold text-becs-blue">{categories.length}</p>
              </div>
              <div className="w-12 h-12 becs-gold-gradient rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm font-medium">Most Used</p>
                <p className="text-lg font-bold text-green-600">Contracts</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm font-medium">Recently Added</p>
                <p className="text-2xl font-bold text-becs-gold">3</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-becs-red to-red-600 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-becs-gray w-4 h-4" />
                <Input
                  placeholder="Search templates by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates by Category */}
      {categoryFilter === "all" ? (
        // Show all categories
        <div className="space-y-8">
          {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
            <Card key={category} className="border border-gray-100">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-becs-navy flex items-center">
                  <span className="text-2xl mr-3">{getTemplateIcon(category)}</span>
                  {category}
                  <Badge variant="secondary" className="ml-2">
                    {categoryTemplates.length} templates
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {categoryTemplates.length === 0 ? (
                  <p className="text-center text-becs-gray py-8">No templates in this category</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryTemplates.map((template) => (
                      <Card key={template.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 becs-gradient rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                <Badge className={getCategoryColor(template.category)}>
                                  {template.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {template.description && (
                            <p className="text-sm text-becs-gray mb-4 line-clamp-2">{template.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreview(template)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                className="bg-becs-blue hover:bg-becs-navy"
                                onClick={() => handleDownload(template)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                            {isAdmin && (
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Show filtered category
        <Card className="border border-gray-100">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-becs-navy flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Templates
              <Badge variant="secondary" className="ml-2">
                {filteredTemplates.length} templates
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-becs-gray mx-auto mb-4" />
                <p className="text-becs-gray text-lg">No templates found</p>
                <p className="text-becs-gray text-sm">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 becs-gradient rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <Badge className={getCategoryColor(template.category)}>
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {template.description && (
                        <p className="text-sm text-becs-gray mb-4 line-clamp-2">{template.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(template)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="bg-becs-blue hover:bg-becs-navy"
                            onClick={() => handleDownload(template)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                        {isAdmin && (
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Upload Modal */}
      <TemplateUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
