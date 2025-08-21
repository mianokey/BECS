import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Receipt, Search, Filter, DollarSign, Calendar, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Invoices() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: invoices } = useQuery({
    queryKey: ['/api/invoices'],
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'director';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'unpaid': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-becs-red';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProjectName = (projectId: number) => {
    const project = projects?.find(p => p.id === projectId);
    return project ? `${project.code} - ${project.name}` : 'Unknown Project';
  };

  // Filter invoices
  const filteredInvoices = invoices?.filter(invoice => {
    const matchesProject = selectedProject === "all" || invoice.projectId === parseInt(selectedProject);
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesSearch = searchTerm === "" || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProjectName(invoice.projectId).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesProject && matchesStatus && matchesSearch;
  }) || [];

  // Calculate statistics
  const invoiceStats = invoices?.reduce((acc, invoice) => {
    acc.total += parseFloat(invoice.amount.toString());
    if (invoice.status === 'paid') {
      acc.paid += parseFloat(invoice.amount.toString());
      acc.paidCount++;
    } else if (invoice.status === 'unpaid') {
      acc.unpaid += parseFloat(invoice.amount.toString());
      acc.unpaidCount++;
    } else if (invoice.status === 'overdue') {
      acc.overdue += parseFloat(invoice.amount.toString());
      acc.overdueCount++;
    }
    return acc;
  }, { 
    total: 0, 
    paid: 0, 
    unpaid: 0, 
    overdue: 0, 
    paidCount: 0, 
    unpaidCount: 0, 
    overdueCount: 0 
  }) || { 
    total: 0, 
    paid: 0, 
    unpaid: 0, 
    overdue: 0, 
    paidCount: 0, 
    unpaidCount: 0, 
    overdueCount: 0 
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-becs-navy">Invoices</h1>
          <p className="text-becs-gray">Track and manage project invoices</p>
        </div>
        {isAdmin && (
          <Button className="bg-becs-blue hover:bg-becs-navy">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm font-medium">Total Amount</p>
                <p className="text-xl font-bold text-becs-navy">{formatCurrency(invoiceStats.total)}</p>
              </div>
              <div className="w-12 h-12 becs-gradient rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm font-medium">Paid</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(invoiceStats.paid)}</p>
                <p className="text-xs text-becs-gray">{invoiceStats.paidCount} invoices</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm font-medium">Unpaid</p>
                <p className="text-xl font-bold text-becs-gold">{formatCurrency(invoiceStats.unpaid)}</p>
                <p className="text-xs text-becs-gray">{invoiceStats.unpaidCount} invoices</p>
              </div>
              <div className="w-12 h-12 becs-gold-gradient rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-becs-gray text-sm font-medium">Overdue</p>
                <p className="text-xl font-bold text-becs-red">{formatCurrency(invoiceStats.overdue)}</p>
                <p className="text-xs text-becs-gray">{invoiceStats.overdueCount} invoices</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-becs-red to-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-becs-gray w-4 h-4" />
                <Input
                  placeholder="Search by invoice number or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map(project => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.code} - {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card className="border border-gray-100">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-becs-navy flex items-center">
            <Receipt className="w-5 h-5 mr-2" />
            Invoices
            <Badge variant="secondary" className="ml-2">
              {filteredInvoices.length} invoices
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-becs-gray mx-auto mb-4" />
              <p className="text-becs-gray text-lg">
                {invoices?.length === 0 ? 'No invoices found' : 'No invoices match your filters'}
              </p>
              <p className="text-becs-gray text-sm">
                {invoices?.length === 0 ? 'Create your first invoice to get started' : 'Try adjusting your search criteria'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-becs-soft rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 becs-gradient rounded-lg flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-becs-gray">{getProjectName(invoice.projectId)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-becs-gray">Amount</p>
                      <p className="font-semibold text-becs-navy">{formatCurrency(invoice.amount)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-becs-gray">Invoice Date</p>
                      <p className="font-medium text-gray-900">{formatDate(invoice.invoiceDate)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-becs-gray">Due Date</p>
                      <p className="font-medium text-gray-900">
                        {invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                    {isAdmin && (
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
