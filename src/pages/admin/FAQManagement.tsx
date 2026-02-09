import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  HelpCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from '@/config/api';
import Swal from 'sweetalert2';
import Seo from '@/components/Seo';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    nickname: string;
    email: string;
  };
  updater?: {
    id: number;
    nickname: string;
    email: string;
  };
}

interface FAQFormData {
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

interface FormErrors {
  question?: string;
  answer?: string;
  sort_order?: string;
}

interface FAQDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  faqForm: FAQFormData;
  onFormChange: (field: keyof FAQFormData, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  formErrors: FormErrors;
}

const FAQDialog = ({
  open,
  onOpenChange,
  isEdit,
  faqForm,
  onFormChange,
  onSubmit,
  loading,
  formErrors,
}: FAQDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-5 w-5 text-primary" />
            {isEdit ? 'Edit FAQ' : 'Create New FAQ'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="question" className="text-sm font-medium">
                Question <span className="text-red-500">*</span>
              </Label>
              <Input
                id="question"
                placeholder="Enter the FAQ question..."
                value={faqForm.question}
                onChange={(e) => onFormChange('question', e.target.value)}
                className={`mt-1.5 ${formErrors.question ? 'border-red-500' : ''}`}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                {formErrors.question && (
                  <p className="text-sm text-red-500">{formErrors.question}</p>
                )}
                <p className={`text-xs ml-auto ${faqForm.question.length > 450 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                  {faqForm.question.length}/500
                </p>
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="answer" className="text-sm font-medium">
                Answer <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="answer"
                placeholder="Enter the detailed answer..."
                value={faqForm.answer}
                onChange={(e) => onFormChange('answer', e.target.value)}
                className={`mt-1.5 min-h-[120px] ${formErrors.answer ? 'border-red-500' : ''}`}
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-1">
                {formErrors.answer && (
                  <p className="text-sm text-red-500">{formErrors.answer}</p>
                )}
                <p className={`text-xs ml-auto ${faqForm.answer.length > 1800 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                  {faqForm.answer.length}/2000
                </p>
              </div>
            </div>


            <div>
              <Label htmlFor="sort-order" className="text-sm font-medium">
                Sort Order <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sort-order"
                type="number"
                min="1"
                placeholder="1"
                value={faqForm.sort_order || ''}
                onChange={(e) =>
                  onFormChange('sort_order', Number(e.target.value || 1))
                }
                className={`mt-1.5 ${formErrors.sort_order ? 'border-red-500' : ''}`}
              />
              {formErrors.sort_order && (
                <p className="text-sm text-red-500 mt-1">{formErrors.sort_order}</p>
              )}
            </div>

            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-active"
                  checked={faqForm.is_active}
                  onChange={(e) => onFormChange('is_active', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is-active" className="text-sm font-medium">
                  Active (visible to users)
                </Label>
              </div>
            </div>
          </div>

          <Button
            className="w-full mt-6"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? 'Processing...' : isEdit ? 'Update FAQ' : 'Create FAQ'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [faqForm, setFaqForm] = useState<FAQFormData>({
    question: '',
    answer: '',
    is_active: true,
    sort_order: 1,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadFAQs();
    }, 300);

    searchTimeoutRef.current = timeoutId;

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, currentPage]);

  const loadFAQs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: itemsPerPage.toString(),
        search: searchTerm,
      });

      const response = await apiFetch(`/admin/faqs?${params}`) as any;

      if (response.success) {
        // Handle the correct response structure: response.data.faqs.data
        const faqsData = response.data?.faqs?.data || [];
        
        setFaqs(faqsData);
        setTotalPages(response.data?.faqs?.last_page || 1);
        setTotalItems(response.data?.faqs?.total || faqsData.length);
      } else {
        throw new Error(response.message || 'Failed to load FAQs');
      }
    } catch (error: any) {
      console.error('Error loading FAQs:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load FAQs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFAQForm = () => {
    setFaqForm({
      question: '',
      answer: '',
      is_active: true,
      sort_order: 1,
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Question validation
    if (!faqForm.question.trim()) {
      errors.question = 'Question is required';
    } else if (faqForm.question.trim().length > 500) {
      errors.question = 'Question must be 500 characters or less';
    }

    // Answer validation
    if (!faqForm.answer.trim()) {
      errors.answer = 'Answer is required';
    } else if (faqForm.answer.trim().length > 2000) {
      errors.answer = 'Answer must be 2000 characters or less';
    }


    // Sort order validation
    if (!faqForm.sort_order || faqForm.sort_order < 1) {
      errors.sort_order = 'Sort order must be at least 1';
    } else if (!Number.isInteger(faqForm.sort_order)) {
      errors.sort_order = 'Sort order must be a whole number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createFAQ = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('/admin/faqs', {
        method: 'POST',
        body: JSON.stringify(faqForm),
      }) as any;

      console.log('Create FAQ Response:', response);

      if (response.success) {
        setShowCreateDialog(false);
        resetFAQForm();
        // Force reload FAQs after creation
        setTimeout(() => {
          loadFAQs();
        }, 100);
        toast({ title: 'Success', description: 'FAQ created successfully!' });
      } else {
        throw new Error(response.message || 'Failed to create FAQ');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create FAQ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFAQ = async () => {
    if (!editingFAQ) {
      toast({
        title: 'Error',
        description: 'No FAQ selected for editing',
        variant: 'destructive',
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: 'Validation error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch(`/admin/faqs/${editingFAQ.id}`, {
        method: 'PUT',
        body: JSON.stringify(faqForm),
      }) as any;

      if (response.success) {
        setShowEditDialog(false);
        setEditingFAQ(null);
        resetFAQForm();
        loadFAQs();
        toast({ title: 'Success', description: 'FAQ updated successfully!' });
      } else {
        throw new Error(response.message || 'Failed to update FAQ');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update FAQ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteFAQ = async (faq: FAQ) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the FAQ: "${faq.question}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await apiFetch(`/admin/faqs/${faq.id}`, {
          method: 'DELETE',
        }) as any;

        if (response.success) {
          loadFAQs();
          toast({ title: 'Success', description: 'FAQ deleted successfully!' });
        } else {
          throw new Error(response.message || 'Failed to delete FAQ');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete FAQ',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const editFAQ = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      is_active: faq.is_active,
      sort_order: faq.sort_order,
    });
    setFormErrors({});
    setShowEditDialog(true);
  };

  const viewFAQ = (faq: FAQ) => {
    Swal.fire({
      title: faq.question,
      html: `
        <div class="text-left">
          <p class="mb-3"><strong>Category:</strong> ${faq.category}</p>
          <p class="mb-3"><strong>Status:</strong> <span class="${faq.is_active ? 'text-green-600' : 'text-red-600'}">${faq.is_active ? 'Active' : 'Inactive'}</span></p>
          <p class="mb-3"><strong>Sort Order:</strong> ${faq.sort_order}</p>
          <div class="border-t pt-3">
            <strong>Answer:</strong>
            <div class="mt-2 p-3 bg-gray-50 rounded">${faq.answer}</div>
          </div>
        </div>
      `,
      width: '600px',
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="min-w-[40px]"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} FAQs
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pages}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      <Seo
        title="FAQ Management - Admin Panel"
        description="Manage frequently asked questions"
      />
      
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            FAQ Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage frequently asked questions
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadFAQs}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            size="sm"
            className="shadow-sm flex items-center gap-2"
            onClick={() => {
              resetFAQForm();
              setShowCreateDialog(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create FAQ</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            FAQs ({totalItems})
          </CardTitle>
          <CardDescription>
            Manage your frequently asked questions with search and pagination
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search FAQs by question, answer, or category..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading FAQs...</p>
              </div>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No FAQs found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first FAQ to get started'}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="w-full min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium max-w-[400px]">
                          <div className="truncate" title={faq.question}>
                            {faq.question}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                            {faq.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{faq.sort_order}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(faq.created_at).toLocaleDateString()}</div>
                            {faq.creator && (
                              <div className="text-muted-foreground text-xs">
                                by {faq.creator.nickname}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => viewFAQ(faq)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => editFAQ(faq)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteFAQ(faq)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
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
              </div>

              {/* Pagination */}
              {totalPages > 1 && renderPagination()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create FAQ Dialog */}
      <FAQDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) resetFAQForm();
        }}
        isEdit={false}
        faqForm={faqForm}
        onFormChange={(field, value) =>
          setFaqForm((prev) => ({ ...prev, [field]: value }))
        }
        onSubmit={createFAQ}
        loading={loading}
        formErrors={formErrors}
      />

      {/* Edit FAQ Dialog */}
      <FAQDialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setEditingFAQ(null);
            resetFAQForm();
          }
        }}
        isEdit={true}
        faqForm={faqForm}
        onFormChange={(field, value) =>
          setFaqForm((prev) => ({ ...prev, [field]: value }))
        }
        onSubmit={updateFAQ}
        loading={loading}
        formErrors={formErrors}
      />
    </div>
  );
}
