import { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, User, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/config/api";
import { getAuthToken } from "@/lib/auth-token";
import { formatDateForInput } from "@/utils/dateFormat";
import EnhancedDatePicker from "@/components/EnhancedDatePicker";

interface Student {
  id: number;
  email: string;
  nickname: string;
  full_name?: string | null;
  consent_status: "approved" | "pending" | "denied";
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
  enrolled_classrooms?: any[];
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onStudentUpdated: () => void;
}

export function EditStudentModal({ 
  isOpen, 
  onClose, 
  student, 
  onStudentUpdated 
}: EditStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  
  const [studentData, setStudentData] = useState({
    nickname: "",
    full_name: "",
    email: "",
    parent_email: "",
    date_of_birth: "",
    age_group: "",
  });

  // Populate form when student data changes
  useEffect(() => {
    if (student) {
      setStudentData({
        nickname: student.nickname || "",
        full_name: student.full_name || "",
        email: student.email || "",
        parent_email: student.parent_email || "",
        date_of_birth: formatDateForInput(student.date_of_birth) || "",
        age_group: student.age_group || "",
      });
      setFormErrors({});
    }
  }, [student]);


  // Calculate age from date of birth
    const calculateAge = useCallback((dateString: string): number => {
      if (!dateString) return 0;
      
      const dob = new Date(dateString);
      const today = new Date();
      
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();
      
      // Adjust age if birthday hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
      
      return age;
    }, []);
  
    // Determine age group based on age
    const getAgeGroup = useCallback((age: number): string => {
      return age < 13 ? "below_13" : "above_13";
    }, []);

  // Validate email format
  const validateEmail = useCallback((email: string): string | null => {
    if (!email) {
      return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Invalid email format";
    }
    return null;
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setStudentData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If date of birth changes, auto-update age group
      if (field === "date_of_birth") {
        const age = calculateAge(value);
        const ageGroup = getAgeGroup(age);
        newData.age_group = ageGroup;
        
        // If age group is above 13, sync parent email with student email
        if (ageGroup === "above_13" && prev.email) {
          newData.parent_email = prev.email;
        }
      }

      // If age group is above 13, sync parent email with student email
      if (field === "email" && prev.age_group === "above_13") {
        newData.parent_email = value;
      }
      
      return newData;
    });
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: [] }));
    }
  }, [formErrors, calculateAge, getAgeGroup]);

  // Validate email on blur
  const handleEmailBlur = useCallback(() => {
    if (studentData.parent_email && studentData.parent_email.trim()) {
      const emailError = validateEmail(studentData.parent_email);
      if (emailError) {
        setFormErrors(prev => ({
          ...prev,
          parent_email: [emailError]
        }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.parent_email;
          return newErrors;
        });
      }
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.parent_email;
        return newErrors;
      });
    }
  }, [studentData.parent_email, validateEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setLoading(true);
    setFormErrors({});

    // Validate parent email if provided
    if (studentData.parent_email && studentData.parent_email.trim()) {
      const emailError = validateEmail(studentData.parent_email);
      if (emailError) {
        setFormErrors(prev => ({ ...prev, parent_email: [emailError] }));
        setLoading(false);
        return;
      }
    }

    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found.");

      const response = await apiFetch<any>(`/teacher/students/${student.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (response.success) {
        toast({ 
          title: "Success", 
          description: "Student updated successfully" 
        });
        onStudentUpdated();
        onClose();
      } else {
        throw new Error(response.message || "Failed to update student");
      }
    } catch (err: any) {
      if (err.response?.data?.errors || err?.errors) {
        setFormErrors(err.response?.data?.errors || err?.errors);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to update student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormErrors({});
    onClose();
  };

  const isFormValid = useMemo(() => {
    const hasValidNickname = studentData.nickname.trim().length > 0;
    const hasValidEmail = studentData.email.trim().length > 0;
    const hasValidParentEmail = !studentData.parent_email || 
      (studentData.parent_email.trim() && validateEmail(studentData.parent_email) === null);
    return hasValidNickname && hasValidEmail && hasValidParentEmail;
  }, [studentData, validateEmail]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Student
          </DialogTitle>
          <DialogDescription>
            Update student information. Parent consent email will be re-sent if parent email changes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nickname Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-nickname">
                Nickname <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-nickname"
                  value={studentData.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                  placeholder="Enter student nickname"
                  maxLength={50}
                  className="pl-10"
                />
              </div>
              {formErrors.nickname && (
                <p className="text-sm text-red-500">{formErrors.nickname.join(", ")}</p>
              )}
            </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-email"
                type="email"
                value={studentData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="student@example.com"
                className="pl-10 text-muted-foreground bg-muted" readOnly
              />
            </div>
            {formErrors.email && (
              <p className="text-sm text-red-500">{formErrors.email.join(", ")}</p>
            )}
          </div>

          {/* Date of Birth Field */}
          <div className="space-y-2">
            <EnhancedDatePicker
              showQuickSelect={false}
              quickSelectAges={[]}
              id="edit-date_of_birth"
              label="Date of Birth"
              value={studentData.date_of_birth ? new Date(studentData.date_of_birth) : null}
              onChange={(date) => {
                if (date) {
                  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                  handleInputChange("date_of_birth", formattedDate);
                } else {
                  handleInputChange("date_of_birth", "");
                }
              }}
              maxDate={new Date()}
              minDate={new Date(1900, 0, 1)}
              error={formErrors.date_of_birth ? formErrors.date_of_birth.join(", ") : undefined}
              helperText="Age group will be automatically calculated"
            />
          </div>

          {/* Age Group Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-age_group">Age Group</Label>
            <Select 
              value={studentData.age_group} 
              onValueChange={(value) => handleInputChange("age_group", value)}
            >
              <SelectTrigger id="edit-age_group">
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="below_13">Under 13</SelectItem>
                <SelectItem value="above_13">13 and Above</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.age_group && (
              <p className="text-sm text-red-500">{formErrors.age_group.join(", ")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-parent-email">Parent/Guardian Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-parent-email"
                type="email"
                value={studentData.parent_email}
                onChange={(e) => handleInputChange("parent_email", e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="parent@example.com"
                className={`pl-10 ${
                  formErrors.parent_email ? "border-red-500 focus:border-red-500" : ""
                }`}
                disabled={studentData.age_group === "above_13"}
              />
            </div>
            {formErrors.parent_email && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {formErrors.parent_email.join(", ")}
              </p>
            )}
            {!formErrors.parent_email && studentData.parent_email && validateEmail(studentData.parent_email) === null && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Valid email format
              </p>
            )}
          </div>

          {/* Student Info Display */}
          {student && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Current Information</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Consent Status:</span>
                  <Badge 
                    variant={
                      student.consent_status === "approved" ? "default" :
                      student.consent_status === "pending" ? "secondary" : "destructive"
                    }
                    className="ml-2 capitalize"
                  >
                    {student.consent_status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Ripple ID:</span>
                  <span className="ml-2 font-mono">{student.ripple_id || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Acts Logged:</span>
                  <span className="ml-2 font-medium">{student.acts_logged || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">
                    {new Date(student.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Changing email or parent email may require new consent verification.
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Student"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}