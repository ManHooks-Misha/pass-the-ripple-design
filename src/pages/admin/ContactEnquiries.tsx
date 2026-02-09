import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle,
  Mail,
  Calendar,
  User,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '@/config/api';
import Swal from 'sweetalert2';
import { SearchBar } from '@/components/admin/SearchBar';
import { Label } from '@/components/ui/label';
import { useExportData } from '@/hooks/useExportData';
import { Loader2, Download } from 'lucide-react';

interface ContactEnquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip_address: string;
  user_agent: string | null;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

interface ContactEnquiryDetails extends ContactEnquiry {
  // Additional fields that might be returned from the details API
}

const ContactEnquiries = () => {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(15);
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiryDetails | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const { exportData, exporting } = useExportData();

  useEffect(() => {
    loadEnquiries();
  }, [currentPage, searchQuery, statusFilter, dateFrom, dateTo]);

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      });

      const response = await apiFetch(`/admin/contacts?${params}`);

      // Handle the actual API response structure: response.data.contacts.data
      let enquiriesData: ContactEnquiry[] = [];
      let totalPagesData = 1;

      if (response && (response as any).data && (response as any).data.contacts) {
        enquiriesData = (response as any).data.contacts.data || [];
        totalPagesData = (response as any).data.contacts.last_page || 1;
      }

      setEnquiries(enquiriesData);
      setTotalPages(totalPagesData);
    } catch (error: any) {
      console.error('Failed to load contact enquiries:', error);
      toast({
        title: "Error",
        description: "Failed to load contact enquiries",
        variant: "destructive",
      });
      // Ensure enquiries is always an array
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEnquiry = async (id: number) => {
    try {
      const response = await apiFetch<{ data: ContactEnquiryDetails }>(`/admin/contacts/${id}`);
      setSelectedEnquiry(response.data);
      setViewDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to load enquiry details:', error);
      toast({
        title: "Error",
        description: "Failed to load enquiry details",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await apiFetch(`/admin/contacts/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      toast({
        title: "Success",
        description: "Status updated successfully",
      });

      loadEnquiries();
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus as any });
      }
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEnquiry = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/admin/contacts/${id}`, {
          method: 'DELETE'
        });

        toast({
          title: "Success",
          description: "Enquiry deleted successfully",
        });

        loadEnquiries();
        if (selectedEnquiry?.id === id) {
          setViewDialogOpen(false);
          setSelectedEnquiry(null);
        }
      } catch (error: any) {
        console.error('Failed to delete enquiry:', error);
        toast({
          title: "Error",
          description: "Failed to delete enquiry",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      read: { color: 'bg-blue-100 text-blue-800', icon: Eye },
      replied: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      archived: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadEnquiries();
  };

  const handleDateFromChange = (from: string) => {
    setDateFrom(from);
    setCurrentPage(1);
  };

  const handleDateToChange = (to: string) => {
    setDateTo(to);
    setCurrentPage(1);
  };

  const handleExport = () => {
    exportData({
      exportEndpoint: "/admin/contacts?export=true",
      listEndpoint: "/admin/contacts",
      dataKey: "contacts",
      fileNamePrefix: "contact-enquiries",
      filters: {
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        per_page: perPage === "all" ? undefined : perPage,
        page: perPage === "all" ? "all" : 1,
      },
      columns: [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "subject", label: "Subject" },
        { key: "message", label: "Message" },
        { key: "status", label: "Status" },
        { key: "created_at", label: "Date" },
      ],
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Contact Enquiries
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and respond to contact form submissions
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={handleExport} disabled={exporting} size="sm" variant="outline" className="flex items-center gap-2">
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          {/* Search and Filters Section - 2 Row Layout */}
          <div className="space-y-4">
            {/* First Row: Per-Page (Top Left), Search Bar, and Date Fields */}
            <div className="flex flex-col lg:flex-row gap-3 items-end">
              {/* Per-Page Selector - Top Left */}
              <div className="flex items-center gap-2 lg:w-auto">
                <Label htmlFor="per-page" className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</Label>
                <Select value={perPage.toString()} onValueChange={(value) => {
                  const newPerPage = value === "all" ? "all" : parseInt(value);
                  setPerPage(newPerPage);
                  setCurrentPage(1);
                  // Reload data with new perPage
                  loadEnquiries();
                }}>
                  <SelectTrigger className="w-20 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600 whitespace-nowrap">per page</span>
              </div>
              
              {/* Search Bar */}
              <div className="flex-1 lg:max-w-md">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name, email, or subject..."
                />
              </div>
              
              {/* Date Fields */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="date-from" className="text-sm text-gray-700 font-medium">From</Label>
                  <Input
                    id="date-from"
                    name="date_from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                    className="w-full sm:w-40 h-10 border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="date-to" className="text-sm text-gray-700 font-medium">To</Label>
                  <Input
                    id="date-to"
                    name="date_to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => handleDateToChange(e.target.value)}
                    className="w-full sm:w-40 h-10 border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Second Row: Status Filter and Clear Button */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full sm:w-48 h-10">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(searchQuery || statusFilter !== 'all' || dateFrom || dateTo) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDateFrom('');
                    setDateTo('');
                    setCurrentPage(1);
                  }}
                  className="whitespace-nowrap self-end sm:self-auto"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Enquiries ({Array.isArray(enquiries) ? enquiries.length : 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading enquiries...</p>
            </div>
          ) : !Array.isArray(enquiries) || enquiries.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries found</h3>
              <p className="text-gray-600">No contact enquiries match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(enquiries) && enquiries.map((enquiry) => (
                    <TableRow key={enquiry.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{enquiry.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {enquiry.email}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={enquiry.subject}>
                        {enquiry.subject}
                      </TableCell>
                      <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(enquiry.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewEnquiry(enquiry.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {enquiry.status === 'new' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(enquiry.id, 'read')}>
                                <Eye className="h-4 w-4 mr-2" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            {enquiry.status !== 'replied' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(enquiry.id, 'replied')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Replied
                              </DropdownMenuItem>
                            )}
                            {enquiry.status !== 'archived' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(enquiry.id, 'archived')}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Archive Enquiry
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEnquiry(enquiry.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center sm:justify-end mt-6">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto"
                >
                  Previous
                </Button>
                <span className="text-sm whitespace-nowrap">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-full sm:w-auto"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Enquiry Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact Enquiry Details
            </DialogTitle>
            <DialogDescription>
              View and manage this contact enquiry
            </DialogDescription>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-6">
              {/* Enquiry Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{selectedEnquiry.name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedEnquiry.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Subject</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{selectedEnquiry.subject}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {getStatusBadge(selectedEnquiry.status)}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Submitted</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(selectedEnquiry.created_at)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(selectedEnquiry.updated_at)}</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Message</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap text-gray-800">{selectedEnquiry.message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedEnquiry.status === 'new' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedEnquiry.id, 'read')}
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                {selectedEnquiry.status !== 'replied' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedEnquiry.id, 'replied')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Replied
                  </Button>
                )}
                {selectedEnquiry.status !== 'archived' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedEnquiry.id, 'archived')}
                    variant="outline"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Archive Enquiry
                  </Button>
                )}
                <Button
                  onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactEnquiries;
