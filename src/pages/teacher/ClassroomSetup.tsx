import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash, Users, Loader2, AlertCircle, X, HelpCircle, CheckCircle, Search, MoreVertical, Eye, Edit as EditIcon, Send, Mail, Calendar, Activity, School, Copy, Clock, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from '@/config/api';
import { getAuthToken } from '@/lib/auth-token';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Seo from '@/components/Seo';
import KidFriendlyTutorial from '@/components/KidFriendlyTutorial';
import { usePageTutorial } from '@/hooks/usePageTutorial';
import { classroomSetupTutorialSteps } from '@/hooks/usePageTutorialSteps';
import { convertStepsToTutorialSteps } from '@/utils/convertTutorialSteps';
import { UserAvatarOnly } from '@/components/UserIdentity';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Classroom {
  id: number;
  name: string;
  teacher_user_id: number;
  created_at: string;
  updated_at: string;
  students_count?: number;
}

type ConsentStatus = "approved" | "pending" | "denied";

type Student = {
  id: number;
  email: string;
  nickname: string;
  full_name?: string | null;
  consent_status: ConsentStatus;
  parent_email?: string | null;
  avatar_id?: number | null;
  ripple_id?: string | null;
  profile_image_path?: string | null;
  profile_image_url?: string | null;
  created_at: string;
  last_active: string | null;
  age_group?: string | null;
  date_of_birth?: string | null;
  acts_logged?: number;
  badges_earned?: number;
  enrolled_classrooms?: Classroom[];
};

export default function ClassroomSetup() {
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_classroom_setup_tutorial_completed",
    steps: classroomSetupTutorialSteps,
  });
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [currentClassroomName, setCurrentClassroomName] = useState('');
  const [classroomList, setClassroomList] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [classroomDialogOpen, setClassroomDialogOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);
  const debouncedStudentSearchTerm = useDebounce(studentSearchTerm, 500);
  const { pagination: studentPagination, updatePagination: updateStudentPagination, resetPagination: resetStudentPagination } = usePagination(20);

  const fetchClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to view classrooms.',
          variant: 'destructive',
        });
        return;
      }

      const response = await apiFetch<any>('/teacher/classrooms', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.success && response?.data?.data) {
        setClassrooms(response.data.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch classrooms');
      }
    } catch (err: any) {
      console.error('Fetch classrooms error:', err);
      toast({
        title: 'Error',
        description: err?.message || 'Failed to load classrooms.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  // Validation functions
  const validateClassroomName = useCallback((name: string): string[] => {
    const errors: string[] = [];
    
    if (!name.trim()) {
      errors.push('Classroom name is required');
    } else if (name.length > 50) {
      errors.push('Classroom name must be 50 characters or less');
    } else if (name.trim().length < 2) {
      errors.push('Classroom name must be at least 2 characters');
    }
    
    return errors;
  }, []);

  const validateClassroomList = useCallback((list: string[]): string[] => {
    const errors: string[] = [];
    
    if (list.length === 0) {
      errors.push('Please add at least one classroom');
    }
    
    // Check for duplicates
    const uniqueNames = new Set(list.map(name => name.toLowerCase().trim()));
    if (uniqueNames.size !== list.length) {
      errors.push('Duplicate classroom names are not allowed');
    }
    
    return errors;
  }, []);

  const validateForm = useCallback((): { isValid: boolean; errors: Record<string, string[]> } => {
    const errors: Record<string, string[]> = {};

    if (editingClassroom) {
      // Single classroom validation for edit mode
      const nameErrors = validateClassroomName(currentClassroomName);
      if (nameErrors.length > 0) {
        errors.name = nameErrors;
      }
    } else {
      // Multiple classroom validation for create mode
      const listErrors = validateClassroomList(classroomList);
      if (listErrors.length > 0) {
        errors.classroomList = listErrors;
      }
      
      // Also validate current input if it exists but isn't added to list
      if (currentClassroomName.trim() && !classroomList.includes(currentClassroomName.trim())) {
        const nameErrors = validateClassroomName(currentClassroomName);
        if (nameErrors.length > 0) {
          errors.currentName = nameErrors;
        }
      }
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  }, [editingClassroom, currentClassroomName, classroomList, validateClassroomName, validateClassroomList]);

  const addClassroomToList = () => {
    const name = currentClassroomName.trim();
    
    // Validate before adding
    const nameErrors = validateClassroomName(name);
    if (nameErrors.length > 0) {
      setFormErrors({ name: nameErrors });
      return;
    }

    if (classroomList.includes(name)) {
      setFormErrors({ name: ['This classroom name is already in your list'] });
      return;
    }

    // Clear errors
    setFormErrors({});
    
    // Add to list and clear input
    setClassroomList(prev => [...prev, name]);
    setCurrentClassroomName('');
  };

  const removeClassroomFromList = (index: number) => {
    setClassroomList(prev => prev.filter((_, i) => i !== index));
    // Clear errors when list changes
    if (formErrors.classroomList) {
      setFormErrors(prev => ({ ...prev, classroomList: [] }));
    }
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    
    const { isValid, errors } = validateForm();
    setFormErrors(errors);

    if (!isValid) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('[data-error="true"]');
      firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('You must be logged in');
      }

      if (editingClassroom) {
        // Update existing classroom
        const classroomName = currentClassroomName.trim();
        
        const response: any = await apiFetch(`/teacher/classrooms/${editingClassroom.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: classroomName }),
        });

        if (response?.success) {
          // Optimistically update the classroom in the list without reloading
          setClassrooms(prev => prev.map(cls => 
            cls.id === editingClassroom.id 
              ? { ...cls, name: classroomName }
              : cls
          ));
          
          toast({
            title: 'Success',
            description: 'Classroom updated successfully',
          });
          handleDialogClose();
        } else {
          throw new Error(response?.message || 'Failed to update classroom');
        }
      } else {
        // Create multiple classrooms
        const response: any = await apiFetch('/teacher/classrooms', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: classroomList }),
        });

        if (response?.success) {
          const createdCount = response.data?.length || classroomList.length;
          toast({
            title: 'Success',
            description: `${createdCount} classroom(s) created successfully`,
          });
          
          // Show warnings if any
          if (response.warnings && response.warnings.length > 0) {
            toast({
              title: 'Note',
              description: `Some classrooms couldn't be created: ${response.warnings.join(', ')}`,
              variant: 'default',
            });
          }
          
          fetchClassrooms();
          handleDialogClose();
        } else {
          throw new Error(response?.message || 'Failed to create classrooms');
        }
      }
    } catch (err: any) {
      let errorMessage = 'An error occurred';

      if (err.response?.data?.errors || err?.errors) {
        setFormErrors(err.response?.data?.errors || err?.errors);
        errorMessage = Object.values(err.response?.data?.errors || err?.errors)
          .flat()
          .join(' • ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setCurrentClassroomName(classroom.name);
    setClassroomList([]);
    setFormErrors({});
    setHasAttemptedSubmit(false);
    setIsDialogOpen(true);
  };

  const handleDelete = async (classroom: Classroom) => {
    setClassroomToDelete(classroom);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!classroomToDelete) return;

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('You must be logged in');
      }

      const response: any = await apiFetch(`/teacher/classrooms/${classroomToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.success) {
        toast({
          title: 'Success',
          description: 'Classroom deleted successfully',
        });
        fetchClassrooms();
      } else {
        throw new Error(response?.message || 'Failed to delete classroom');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to delete classroom',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setClassroomToDelete(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingClassroom(null);
    setCurrentClassroomName('');
    setClassroomList([]);
    setFormErrors({});
    setHasAttemptedSubmit(false);
  };

  const handleDialogOpen = () => {
    setEditingClassroom(null);
    setCurrentClassroomName('');
    setClassroomList([]);
    setFormErrors({});
    setHasAttemptedSubmit(false);
    setIsDialogOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentClassroomName.trim()) {
      e.preventDefault();
      addClassroomToList();
    }
  };

  const fetchStudents = useCallback(async (classroomId: number, search: string = "", page: number = 1) => {
    setStudentLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to view students.',
          variant: 'destructive',
        });
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "20",
        sort_by: "created_at",
        sort_order: "desc",
        classroom_id: classroomId.toString(),
      });
      if (search.trim()) params.append("search", search.trim());

      const response = await apiFetch<any>(`/teacher/students?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.success && response?.data?.students) {
        const studentsData = response.data?.students?.data || [];
        setStudents(studentsData);
        const paginationData = response.data?.students || {};

        updateStudentPagination({
          currentPage: paginationData.current_page || 1,
          lastPage: paginationData.last_page || 1,
          total: paginationData.total || 0,
          perPage: paginationData.per_page || 20,
          from: paginationData.from || 0,
          to: paginationData.to || 0,
        });
      } else {
        throw new Error(response?.message || 'Failed to fetch students');
      }
    } catch (err: any) {
      console.error('Fetch students error:', err);
      toast({
        title: 'Error',
        description: err?.message || 'Failed to load students.',
        variant: 'destructive',
      });
    } finally {
      setStudentLoading(false);
    }
  }, [updateStudentPagination]);

  useEffect(() => {
    if (selectedClassroom && classroomDialogOpen) {
      fetchStudents(selectedClassroom.id, debouncedStudentSearchTerm, studentPagination.currentPage);
    }
  }, [debouncedStudentSearchTerm, studentPagination.currentPage, selectedClassroom, classroomDialogOpen, fetchStudents]);

  const handleClassroomClick = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setClassroomDialogOpen(true);
    setStudentSearchTerm("");
    resetStudentPagination();
    fetchStudents(classroom.id);
  };

  // Helper to check if a field has errors
  const hasError = (fieldName: string): boolean => {
    return hasAttemptedSubmit && !!formErrors[fieldName]?.length;
  };

  // Get error message for a field
  const getErrorMessage = (fieldName: string): string => {
    return hasError(fieldName) ? formErrors[fieldName][0] : '';
  };

  // Check if current classroom name is valid
  const isCurrentNameValid = currentClassroomName.trim() && 
    validateClassroomName(currentClassroomName).length === 0 &&
    !classroomList.includes(currentClassroomName.trim());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Seo
        title="Classroom Setup — Pass The Ripple"
        description="Create and manage your classrooms"
        canonical={`${window.location.origin}/teacher/classroom-setup`}
      />
      
      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="classroom_setup_tutorial_completed"
      />
      
      <div className="container mx-auto space-y-4 px-4 py-4">
        {/* Validation Summary */}
        {hasAttemptedSubmit && Object.keys(formErrors).length > 0 && (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Please fix the following errors:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                {Object.entries(formErrors).map(([field, errors]) => (
                  <li key={field}>
                    <strong>{field === 'classroomList' ? 'Classroom List' : field === 'currentName' ? 'Current Classroom Name' : field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {errors.join(', ')}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Classroom Setup</h1>
            <p className="text-muted-foreground mt-1">Create and manage your classrooms</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startTutorial}
              className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2"
              title="Take a tour of this page"
            >
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Help</span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleDialogClose()}>
              <DialogTrigger asChild>
                <Button onClick={handleDialogOpen} data-tutorial-target="add-classroom">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Classroom
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingClassroom ? 'Edit Classroom' : 'Add New Classroom'}
                  </DialogTitle>
                </DialogHeader>
                
                {editingClassroom ? (
                  // Simplified UI for editing - just the name field
                  <div className="space-y-4 py-4">
                    <div 
                      className="space-y-2"
                      data-error={hasError('name')}
                    >
                      <Label htmlFor="edit-name">
                        Classroom Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-name"
                        value={currentClassroomName}
                        onChange={(e) => {
                          setCurrentClassroomName(e.target.value);
                          if (formErrors.name) {
                            setFormErrors({ ...formErrors, name: [] });
                          }
                        }}
                        placeholder="Enter classroom name"
                        maxLength={50}
                        disabled={submitting}
                        className={`w-full ${
                          hasError('name') ? "border-red-500 bg-red-50 focus:ring-red-500" : ""
                        }`}
                      />
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          <span className={currentClassroomName.length > 40 ? 'text-orange-500' : currentClassroomName.length > 45 ? 'text-red-500' : ''}>
                            {currentClassroomName.length}/50
                          </span>
                        </div>
                        {!hasError('name') && currentClassroomName.trim() && validateClassroomName(currentClassroomName).length === 0 && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>Valid name</span>
                          </div>
                        )}
                      </div>
                      {hasError('name') && (
                        <p className="text-sm text-red-500 font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {getErrorMessage('name')}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  // Original complex UI for creating multiple classrooms
                  <div className="space-y-4 py-4">
                    <div 
                      className="space-y-2"
                      data-error={hasError('name') || hasError('currentName')}
                    >
                      <Label htmlFor="name">
                        Classroom Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="name"
                          value={currentClassroomName}
                          onChange={(e) => {
                            setCurrentClassroomName(e.target.value);
                            if (formErrors.name || formErrors.currentName) {
                              setFormErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.name;
                                delete newErrors.currentName;
                                return newErrors;
                              });
                            }
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="e.g., Grade 5A, Room 101, Section A"
                          maxLength={50}
                          disabled={submitting}
                          className={hasError('name') || hasError('currentName') ? "border-red-500 bg-red-50 focus:ring-red-500" : ""}
                        />
                        <Button
                          type="button"
                          onClick={addClassroomToList}
                          disabled={submitting}
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Press Enter or click + to add to list</span>
                        <div className="flex items-center gap-2">
                          <span className={currentClassroomName.length > 40 ? 'text-orange-500' : currentClassroomName.length > 45 ? 'text-red-500' : ''}>
                            {currentClassroomName.length}/50
                          </span>
                          {isCurrentNameValid && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>Ready to add</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {(hasError('name') || hasError('currentName')) && (
                        <p className="text-sm text-red-500 font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {getErrorMessage('name') || getErrorMessage('currentName')}
                        </p>
                      )}
                    </div>

                    {/* Classroom List */}
                    <div 
                      className="space-y-2"
                      data-error={hasError('classroomList')}
                    >
                      {classroomList.length > 0 && (
                        <>
                          <Label>Classrooms to create:</Label>
                          <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                            {classroomList.map((name, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded mb-2 last:mb-0"
                              >
                                <span className="text-sm font-medium">{name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeClassroomFromList(index)}
                                  disabled={submitting}
                                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                              {classroomList.length} classroom(s) ready to create
                            </p>
                            {!hasError('classroomList') && classroomList.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                <span>Ready to create</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {hasError('classroomList') && (
                        <p className="text-sm text-red-500 font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {getErrorMessage('classroomList')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={handleDialogClose}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingClassroom ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingClassroom ? 'Update Classroom' : `Create ${classroomList.length} Classroom(s)`
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {classrooms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Classrooms Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first classroom to get started
              </p>
              <Button onClick={handleDialogOpen}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Classroom
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Classrooms</CardTitle>
              <CardDescription>
                Manage your classrooms and student groups
              </CardDescription>
            </CardHeader>
            <CardContent className="pr-6">
              <div 
                className="rounded-lg border overflow-hidden" 
                data-tutorial-target="classrooms-list"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ padding: '0.75rem 1rem' }}>Classroom Name</TableHead>
                      <TableHead style={{ padding: '0.75rem 1rem' }}>Students</TableHead>
                      <TableHead style={{ padding: '0.75rem 1rem' }}>Created</TableHead>
                      <TableHead className="text-right" style={{ padding: '0.75rem 1rem' }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classrooms.map((classroom) => (
                      <TableRow key={classroom.id}>
                        <TableCell className="font-medium" style={{ padding: '1rem' }}>{classroom.name}</TableCell>
                        <TableCell
                          style={{ padding: '1rem' }}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleClassroomClick(classroom)}
                        >
                          <Badge variant="secondary">
                            {classroom.students_count || 0} students
                          </Badge>
                        </TableCell>
                        <TableCell style={{ padding: '1rem' }}>
                          {new Date(classroom.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right" style={{ padding: '1rem' }}>
                          <div className="flex justify-end gap-2" data-tutorial-target="classroom-actions">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(classroom)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {(classroom.students_count === 0 || !classroom.students_count) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(classroom)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Are you sure you want to delete <strong>{classroomToDelete?.name}</strong>?
                This action cannot be undone. Students in this classroom will not be deleted,
                but they will be removed from this classroom.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete Classroom
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Classroom Info Dialog */}
        <Dialog open={classroomDialogOpen} onOpenChange={setClassroomDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Students in {selectedClassroom?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search students by name, email, or Ripple ID..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Students Table */}
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                {studentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading students...</span>
                  </div>
                ) : students.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profile</TableHead>
                        <TableHead>Name / Ripple ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Consent Status</TableHead>
                        <TableHead>Acts</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <UserAvatarOnly
                              avatar_id={student.avatar_id}
                              profile_image_path={student.profile_image_path}
                              nickname={student.nickname}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              {student.nickname}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                {student.ripple_id || "N/A"}
                              </span>
                              {student.ripple_id && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(student.ripple_id!);
                                    toast({
                                      title: "Copied!",
                                      description: "Ripple ID copied to clipboard.",
                                    });
                                  }}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  aria-label="Copy Ripple ID"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-sm">{student.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {(() => {
                                switch (student.consent_status) {
                                  case "approved":
                                    return <CheckCircle className="h-4 w-4 text-green-500" />;
                                  case "pending":
                                    return <Clock className="h-4 w-4 text-yellow-500" />;
                                  case "denied":
                                    return <XCircle className="h-4 w-4 text-red-500" />;
                                  default:
                                    return null;
                                }
                              })()}
                              <Badge
                                variant={student.consent_status === "approved" ? "default" : student.consent_status === "pending" ? "secondary" : "destructive"}
                              >
                                {student.consent_status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{student.acts_logged ?? 0}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                              {new Date(student.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                  <Link style={{display:"flex"}}
                                    to={`/teacher/student/${student.id}`}
                                  >
                                    <Eye className="h-4 w-4 mr-2" /> View Details
                                  </Link>
                                </DropdownMenuItem>
                                {student.consent_status === "pending" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => {
                                      // Handle send reminder
                                      const token = getAuthToken();
                                      if (!token) return;
                                      apiFetch<any>(`/teacher/students/send-consent-reminder`, {
                                        method: "POST",
                                        body: JSON.stringify({ student_user_id: student.id }),
                                        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                                      }).then((res) => {
                                        if (res.success) {
                                          toast({ title: "Success", description: "Reminder sent to parent." });
                                        } else {
                                          throw new Error(res.message || "Failed to send reminder");
                                        }
                                      }).catch((err) => {
                                        toast({ title: "Error", description: err.message || "Failed to send reminder.", variant: "destructive" });
                                      });
                                    }}>
                                      <Send className="h-4 w-4 mr-2" /> Send Reminder
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No students found</h3>
                    <p className="text-muted-foreground">
                      {studentSearchTerm ? `No students match "${studentSearchTerm}".` : "This classroom has no students yet."}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {students.length > 0 && studentPagination.lastPage > 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchStudents(selectedClassroom!.id, debouncedStudentSearchTerm, studentPagination.currentPage - 1)}
                      disabled={studentPagination.currentPage === 1 || studentLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {studentPagination.currentPage} of {studentPagination.lastPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchStudents(selectedClassroom!.id, debouncedStudentSearchTerm, studentPagination.currentPage + 1)}
                      disabled={studentPagination.currentPage === studentPagination.lastPage || studentLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setClassroomDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}