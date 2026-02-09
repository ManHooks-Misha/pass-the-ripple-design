import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";
import { apiFetch, apiFetchFormData } from "@/config/api";
import { getAuthToken } from "@/lib/auth-token";
import { UserPlus, ArrowLeft, Mail, User, Calendar, Shield, Upload, Download, FileSpreadsheet, Loader2, CheckCircle, XCircle, AlertCircle, Image as ImageIcon, HelpCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EnhancedDatePicker from "@/components/EnhancedDatePicker";
import { useAvatars } from "@/hooks/useAvatars";
import { useDebounce } from "@/hooks/useDebounce";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { addStudentTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";

interface CSVStudent {
  nickname: string;
  email: string;
  date_of_birth: string;
  parent_email: string;
  status?: "pending" | "success" | "error";
  error?: string;
}

export default function AddStudent() {
  const navigate = useNavigate();
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_add_student_tutorial_completed",
    steps: addStudentTutorialSteps,
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [teacherReferralCode, setTeacherReferralCode] = useState("");
  const [activeTab, setActiveTab] = useState("single");
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [teacherLocation, setTeacherLocation] = useState<any>(null);

  // Avatar state
  const { avatars, loading: avatarsLoading } = useAvatars();
  const avatarUploadRef = useRef<HTMLInputElement | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);

  // CSV Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvStudents, setCsvStudents] = useState<CSVStudent[]>([]);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResults, setCsvResults] = useState<CSVStudent[]>([]);

  const [studentData, setStudentData] = useState({
    nickname: "",
    email: "",
    date_of_birth: "",
    age_group: "",
    parent_email: "",
    teacher_referral_code: "",
    classroom_id: "",
  });

  // Nickname availability check
  const [nicknameCheckLoading, setNicknameCheckLoading] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const debouncedNickname = useDebounce(studentData.nickname, 500);

  // Set default avatar when avatars are loaded
  useEffect(() => {
    if (avatars.length > 0 && selectedAvatarId === null && !customAvatarFile) {
      setSelectedAvatarId(avatars[0].id);
    }
  }, [avatars, selectedAvatarId, customAvatarFile]);

  // Fetch teacher's referral code, location, and classrooms
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const token = getAuthToken();
        const res = await apiFetch<any>("/teacher/profile", {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res?.data) {
          if (res.data.referral_code) {
            setTeacherReferralCode(res.data.referral_code);
            setStudentData(prev => ({ ...prev, teacher_referral_code: res.data.referral_code }));
          }
          // Get teacher's location
          if (res.data.location || res.data.city || res.data.latitude) {
            setTeacherLocation({
              city: res.data.location?.city || res.data.city,
              state: res.data.location?.state || res.data.state,
              country: res.data.location?.country || res.data.country,
              latitude: res.data.location?.latitude || res.data.latitude,
              longitude: res.data.location?.longitude || res.data.longitude,
              formatted_address: res.data.location?.formatted_address || res.data.formatted_address,
              postal_code: res.data.location?.postal_code || res.data.postal_code,
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch teacher profile", e);
      }
    };

    const fetchClassrooms = async () => {
      try {
        const token = getAuthToken();
        const res = await apiFetch<any>("/teacher/classrooms", {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res?.success && res?.data?.data) {
          setClassrooms(res.data.data);
        }
      } catch (e) {
        console.error("Failed to fetch classrooms", e);
      }
    };

    fetchTeacherProfile();
    fetchClassrooms();
  }, []);

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

  // Update age group when date of birth changes
  const updateAgeGroupFromDOB = useCallback((dateString: string) => {
    if (!dateString) {
      // Clear age group if no date selected
      setStudentData(prev => ({ ...prev, age_group: "" }));
      return;
    }

    const age = calculateAge(dateString);
    const ageGroup = getAgeGroup(age);
    
    setStudentData(prev => {
      const newData = { 
        ...prev, 
        age_group: ageGroup,
        // If age group is above 13, sync parent email with student email
        parent_email: ageGroup === "above_13" && prev.email ? prev.email : prev.parent_email
      };
      return newData;
    });
  }, [calculateAge, getAgeGroup]);

  const handleAvatarUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Proceed with upload
    setCustomAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomAvatarPreview(reader.result as string);
      setSelectedAvatarId(0); // Set to 0 for custom avatar
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAvatarSelect = useCallback((avatarId: number) => {
    setSelectedAvatarId(avatarId);
    setCustomAvatarFile(null);
    setCustomAvatarPreview(null);
    if (avatarUploadRef.current) {
      avatarUploadRef.current.value = '';
    }
  }, []);

  // Check nickname availability
  const checkNicknameAvailability = useCallback(async (nicknameToCheck: string) => {
    if (!nicknameToCheck || nicknameToCheck.length < 3) {
      setNicknameAvailable(null);
      return;
    }

    // Validate nickname format (letters, numbers, underscores only)
    if (!/^[A-Za-z0-9_]*$/.test(nicknameToCheck)) {
      setNicknameAvailable(false);
      setFormErrors(prev => ({
        ...prev,
        nickname: ["Nickname can only contain letters, numbers, and underscores"]
      }));
      return;
    }

    setNicknameCheckLoading(true);
    try {
      const response = await apiFetch<any>("/check-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nicknameToCheck }),
      });

      if (response.success && response.data?.is_available) {
        setNicknameAvailable(true);
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.nickname;
          return newErrors;
        });
      } else {
        setNicknameAvailable(false);
        setFormErrors(prev => ({
          ...prev,
          nickname: ["Nickname is already taken"]
        }));
      }
    } catch (error: any) {
      if (error.response?.data?.errors?.nickname) {
        setNicknameAvailable(false);
        setFormErrors(prev => ({
          ...prev,
          nickname: Array.isArray(error.response.data.errors.nickname)
            ? error.response.data.errors.nickname
            : [error.response.data.errors.nickname]
        }));
      } else {
        setNicknameAvailable(null);
      }
    } finally {
      setNicknameCheckLoading(false);
    }
  }, []);

  // Check nickname availability when debounced value changes
  useEffect(() => {
    if (debouncedNickname && debouncedNickname.length >= 3) {
      checkNicknameAvailability(debouncedNickname);
    } else {
      setNicknameAvailable(null);
      setNicknameCheckLoading(false);
    }
  }, [debouncedNickname, checkNicknameAvailability]);

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

  // Date validation function
  const validateDateOfBirth = useCallback((dateString: string) => {
    if (!dateString) return "Date of Birth is required";
    
    const selectedDate = new Date(dateString);
    const today = new Date();
    
    // Set time to start of day for accurate comparison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedDateStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    // Check if date is in the future
    if (selectedDateStart > todayStart) {
      return "Date of birth cannot be in the future";
    }
    
    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    const dayDiff = today.getDate() - selectedDate.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    
    if (actualAge > 100) return "Please enter a valid date of birth";
    
    return null;
  }, []);

  // Form validation function
  const validateForm = useCallback((): { isValid: boolean; errors: Record<string, string[]> } => {
    const errors: Record<string, string[]> = {};

    // Nickname validation
    if (!studentData.nickname.trim()) {
      errors.nickname = ["Nickname is required"];
    } else if (studentData.nickname.length < 3) {
      errors.nickname = ["Nickname must be at least 3 characters"];
    } else if (!/^[A-Za-z0-9_]*$/.test(studentData.nickname)) {
      errors.nickname = ["Nickname can only contain letters, numbers, and underscores"];
    } else if (nicknameAvailable === false) {
      errors.nickname = ["Nickname is already taken"];
    } else if (nicknameAvailable === null && studentData.nickname.length >= 3) {
      errors.nickname = ["Please wait while we check nickname availability"];
    }

    // Email validation
    const emailError = validateEmail(studentData.email);
    if (emailError) {
      errors.email = [emailError];
    }

    // Date of birth validation
    const dateError = validateDateOfBirth(studentData.date_of_birth);
    if (dateError) {
      errors.date_of_birth = [dateError];
    }

    // Parent email validation
    if (studentData.age_group === "below_13") {
      const parentEmailError = validateEmail(studentData.parent_email);
      if (parentEmailError) {
        errors.parent_email = [parentEmailError];
      }
    }

    // Age group validation
    if (!studentData.age_group) {
      errors.age_group = ["Age group is required"];
    }

    // Classroom validation
    if (!studentData.classroom_id) {
      errors.classroom_id = ["Classroom is required"];
    }

    // Avatar validation
    if (!selectedAvatarId && !customAvatarFile) {
      errors.avatar = ["Please select an avatar or upload a custom one"];
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  }, [studentData, nicknameAvailable, validateEmail, validateDateOfBirth, selectedAvatarId, customAvatarFile]);

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
    
    // Clear errors when user types
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: [] }));
    }

    // Reset nickname availability when nickname changes
    if (field === "nickname") {
      setNicknameAvailable(null);
      // Validate nickname format immediately
      if (value && !/^[A-Za-z0-9_]*$/.test(value)) {
        setFormErrors(prev => ({
          ...prev,
          nickname: ["Nickname can only contain letters, numbers, and underscores"]
        }));
      }
    }
  }, [formErrors, calculateAge, getAgeGroup]);

  // Validate email on blur
  const handleEmailBlur = useCallback((field: "email" | "parent_email") => {
    const emailValue = field === "email" ? studentData.email : studentData.parent_email;
    if (emailValue.trim()) {
      const emailError = validateEmail(emailValue);
      if (emailError) {
        setFormErrors(prev => ({
          ...prev,
          [field]: [emailError]
        }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [studentData.email, studentData.parent_email, validateEmail]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const { isValid, errors } = validateForm();
    setFormErrors(errors);

    if (!isValid) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('[data-error="true"]');
      firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("You must be logged in");

      // Prepare payload with location
      const payload: any = {
        ...studentData,
        avatar_id: customAvatarFile ? 0 : selectedAvatarId,
        points: 50, // Add +50 points
      };

      // Always include location if teacherLocation is available
      if (teacherLocation) {
        payload.location = {
          city: teacherLocation.city || '',
          state: teacherLocation.state || '',
          country: teacherLocation.country || '',
          latitude: teacherLocation.latitude || null,
          longitude: teacherLocation.longitude || null,
          formatted_address: teacherLocation.formatted_address || '',
          postal_code: teacherLocation.postal_code || '',
        };
      }

      let response: any;

      // If custom avatar is uploaded, use FormData
      if (customAvatarFile) {
        const formData = new FormData();
        
        // Add all payload fields except location (which we'll add separately)
        Object.keys(payload).forEach(key => {
          if (key !== 'location' && payload[key] !== undefined && payload[key] !== null) {
            if (typeof payload[key] === 'object') {
              formData.append(key, JSON.stringify(payload[key]));
            } else {
              formData.append(key, payload[key].toString());
            }
          }
        });
        
        // Add location fields if available
        if (payload.location) {
          formData.append(`location[city]`, payload.location.city || '');
          formData.append(`location[state]`, payload.location.state || '');
          formData.append(`location[country]`, payload.location.country || '');
          if (payload.location.latitude) {
            formData.append(`location[latitude]`, payload.location.latitude.toString());
          }
          if (payload.location.longitude) {
            formData.append(`location[longitude]`, payload.location.longitude.toString());
          }
          formData.append(`location[formatted_address]`, payload.location.formatted_address || '');
          formData.append(`location[postal_code]`, payload.location.postal_code || '');
        }
        
        formData.append('custom_avatar', customAvatarFile);
        formData.append('points', '50');

        response = await apiFetchFormData("/teacher/students/create", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        // Use JSON for regular registration
        response = await apiFetch("/teacher/students/create", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.success) {
        if (studentData.age_group === "below_13") {
          toast({
            title: "Student Added!",
            description: "A parent consent email has been sent, and login credentials have been shared with the student's email. Student received +50 points!",
          });
        } else {
          toast({
            title: "Student Added!",
            description: "The student has been added, and login credentials have been sent to their email. Student received +50 points!",
          });
        }
        navigate("/teacher/manage-students");
      } else {
        throw new Error(response.message || "Failed to add student");
      }
    } catch (err: any) {
      let errorMessage = "Failed to add student";

      if (err.response?.data?.errors || err?.errors) {
        setFormErrors(err.response?.data?.errors || err?.errors);
        errorMessage = Object.values(err.response?.data?.errors || err?.errors)
          .flat()
          .join(" • ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [studentData, navigate, customAvatarFile, selectedAvatarId, teacherLocation, validateForm]);

  // CSV Import Handlers
  const handleDownloadTemplate = useCallback(() => {
    const csvContent = "nickname,email,date_of_birth,parent_email\nJohn,john@example.com,2010-05-15,parent@example.com\nJane,jane@example.com,2008-03-20,parent2@example.com\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const parseCSV = useCallback((text: string): CSVStudent[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const student: any = {};
      headers.forEach((header, index) => {
        student[header] = values[index] || '';
      });
      return student as CSVStudent;
    }).filter(s => s.email); // Filter out empty rows
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const students = parseCSV(text);
      setCsvStudents(students);
      toast({
        title: "CSV Loaded",
        description: `${students.length} students found in the file`,
      });
    };
    reader.readAsText(file);
  }, [parseCSV]);

  const handleBulkImport = useCallback(async () => {
    if (!studentData.classroom_id) {
      toast({
        title: "❌ No Classroom Selected",
        description: "Please select a classroom before importing students. All students will be added to the same classroom.",
        variant: "destructive",
      });
      return;
    }

    if (csvStudents.length === 0) {
      toast({
        title: "❌ No Students to Import",
        description: "Please upload a CSV file with student data first.",
        variant: "destructive",
      });
      return;
    }

    setCsvImporting(true);
    const results: CSVStudent[] = [];
    let processedCount = 0;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("You must be logged in");

      // Process students one by one
      for (const student of csvStudents) {
        processedCount++;
        
        try {
          // Validate student data before sending
          const validationErrors: string[] = [];
          
          if (!student.nickname || student.nickname.trim().length < 3) {
            validationErrors.push("Nickname must be at least 3 characters");
          }
          
          if (!/^[A-Za-z0-9_]*$/.test(student.nickname)) {
            validationErrors.push("Nickname can only contain letters, numbers, and underscores");
          }
          
          if (!student.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
            validationErrors.push("Invalid email format");
          }
          
          if (!student.date_of_birth) {
            validationErrors.push("Date of birth is required");
          }
          
          // Check if date is valid and not in future
          const dob = new Date(student.date_of_birth);
          const today = new Date();
          if (isNaN(dob.getTime())) {
            validationErrors.push("Invalid date of birth format (use YYYY-MM-DD)");
          } else if (dob > today) {
            validationErrors.push("Date of birth cannot be in the future");
          }
          
          // If validation errors exist, don't send to API
          if (validationErrors.length > 0) {
            results.push({
              ...student,
              status: "error",
              error: validationErrors.join("; ")
            });
            continue;
          }

          // Calculate age_group from date_of_birth
          const age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          const dayDiff = today.getDate() - dob.getDate();
          const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
          const age_group = actualAge < 13 ? 'below_13' : 'above_13';

          // Validate parent email
          if (age_group === 'below_13') {
            if (!student.parent_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.parent_email)) {
              results.push({
                ...student,
                status: "error",
                error: "Parent email is required and must be valid for students under 13"
              });
              continue;
            }
          }

          const payload = {
            nickname: student.nickname.trim(),
            email: student.email.trim(),
            date_of_birth: student.date_of_birth,
            parent_email: (age_group === 'below_13' ? student.parent_email : student.email).trim(),
            age_group,
            teacher_referral_code: teacherReferralCode,
            classroom_id: studentData.classroom_id,
            points: 50,
            location: teacherLocation ? {
              city: teacherLocation.city,
              state: teacherLocation.state,
              country: teacherLocation.country,
              latitude: teacherLocation.latitude,
              longitude: teacherLocation.longitude,
              formatted_address: teacherLocation.formatted_address,
              postal_code: teacherLocation.postal_code,
            } : undefined,
          };

          const response: any = await apiFetch("/teacher/students/create", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (response.success) {
            results.push({ ...student, status: "success" });
          } else {
            // Parse API error message
            let errorMessage = response.message || "Failed to add student";
            
            if (response.errors) {
              const errorMessages = Object.entries(response.errors)
                .map(([field, errors]: [string, any]) => {
                  const errorArray = Array.isArray(errors) ? errors : [errors];
                  return `${field}: ${errorArray.join(", ")}`;
                })
                .join("; ");
              errorMessage = errorMessages;
            }
            
            results.push({
              ...student,
              status: "error",
              error: errorMessage
            });
          }
        } catch (err: any) {
          // Handle API errors
          let errorMessage = "Failed to add student";
          
          if (err.response?.data?.errors) {
            const errors = err.response.data.errors;
            const errorMessages = Object.entries(errors)
              .map(([field, fieldErrors]: [string, any]) => {
                const errorArray = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
                return `${field}: ${errorArray.join(", ")}`;
              })
              .join("; ");
            errorMessage = errorMessages;
          } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          results.push({
            ...student,
            status: "error",
            error: errorMessage
          });
        }
      }

      setCsvResults(results);
      const successCount = results.filter(r => r.status === "success").length;
      const errorCount = results.filter(r => r.status === "error").length;

      // Create detailed toast message
      if (successCount > 0 && errorCount === 0) {
        toast({
          title: "✅ Import Successful!",
          description: `All ${successCount} students were added successfully. Login credentials have been sent to their email addresses.`,
        });
      } else if (successCount > 0 && errorCount > 0) {
        const errorExamples = results
          .filter(r => r.status === "error")
          .slice(0, 3)
          .map(r => `• ${r.nickname || r.email}: ${r.error}`)
          .join("\n");
        
        toast({
          title: "⚠️ Partial Import Complete",
          description: `${successCount} students added successfully, but ${errorCount} failed:\n${errorExamples}${errorCount > 3 ? `\n...and ${errorCount - 3} more` : ""}\n\nCheck the results table below for details.`,
          variant: "destructive",
          duration: 10000, // Show longer for important info
        });
      } else {
        const errorExamples = results
          .filter(r => r.status === "error")
          .slice(0, 3)
          .map(r => `• ${r.nickname || r.email}: ${r.error}`)
          .join("\n");
        
        toast({
          title: "❌ Import Failed",
          description: `All ${errorCount} students failed to import:\n${errorExamples}${errorCount > 3 ? `\n...and ${errorCount - 3} more` : ""}\n\nPlease fix the errors in your CSV file and try again.`,
          variant: "destructive",
          duration: 10000,
        });
      }

      if (successCount > 0) {
        // Clear the form after successful import
        setCsvFile(null);
        setCsvStudents([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err: any) {
      toast({
        title: "❌ Import Process Failed",
        description: err.message || "An unexpected error occurred during the import process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCsvImporting(false);
    }
  }, [csvStudents, teacherReferralCode, studentData.classroom_id, teacherLocation]);

  // Helper to check if a field has errors
  const hasError = (fieldName: string): boolean => {
    return hasAttemptedSubmit && !!formErrors[fieldName]?.length;
  };

  // Get error message for a field
  const getErrorMessage = (fieldName: string): string => {
    return hasError(fieldName) ? formErrors[fieldName][0] : "";
  };

  const ResultsTable = () => {
    if (csvResults.length === 0) return null;

    const successCount = csvResults.filter(r => r.status === "success").length;
    const errorCount = csvResults.filter(r => r.status === "error").length;

    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Successful</p>
                  <p className="text-2xl font-bold text-green-700">{successCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Failed</p>
                  <p className="text-2xl font-bold text-red-700">{errorCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Detailed Results ({csvResults.length} total)</Label>
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} errors to fix
              </Badge>
            )}
          </div>
          
          <div className="border rounded-lg overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Nickname</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead className="min-w-[250px]">Details / Error Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvResults.map((result, index) => (
                  <TableRow 
                    key={index}
                    className={result.status === "error" ? "bg-red-50" : "bg-green-50"}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {result.status === "success" ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-xs text-green-700 font-medium">Success</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="text-xs text-red-700 font-medium">Failed</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{result.nickname}</TableCell>
                    <TableCell className="text-sm">{result.email}</TableCell>
                    <TableCell className="text-sm">{result.date_of_birth}</TableCell>
                    <TableCell>
                      {result.status === "success" ? (
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <CheckCircle className="h-4 w-4 flex-shrink-0" />
                          <span>Successfully added with +50 points</span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-red-700">
                            <p className="font-medium">Error:</p>
                            <p className="mt-1 whitespace-pre-wrap leading-relaxed">{result.error || "Unknown error occurred"}</p>
                          </div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Help text for errors */}
          {errorCount > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">💡 Common Issues & Solutions:</p>
                <ul className="text-sm space-y-1.5 ml-4 list-disc">
                  <li><strong>Nickname already taken:</strong> Choose a different, unique nickname</li>
                  <li><strong>Invalid email format:</strong> Check email format (must be: user@example.com)</li>
                  <li><strong>Invalid date format:</strong> Use YYYY-MM-DD format (example: 2010-05-15)</li>
                  <li><strong>Parent email required:</strong> Students under 13 must have a valid parent email</li>
                  <li><strong>Nickname format error:</strong> Only letters, numbers, and underscores (_) are allowed</li>
                  <li><strong>Date in future:</strong> Date of birth cannot be later than today</li>
                </ul>
                <p className="mt-3 text-sm font-medium">
                  📝 Tip: Fix the errors in your CSV file and try importing again. Successfully added students won't be duplicated.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Seo
        title="Add Student — Pass The Ripple"
        description="Add students to your classroom"
        canonical={`${window.location.origin}/teacher/add-student`}
      />
      
      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="add_student_tutorial_completed"
      />

      <div className="container mx-auto space-y-4 px-4 py-4">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Add Students
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Register students individually or import via CSV
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
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
          </div>
        </div>

        {/* Referral Code Display */}
        {teacherReferralCode && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your Teacher Referral Code: <Badge variant="secondary" className="ml-2 font-mono">{teacherReferralCode}</Badge>
              <br />
              <span className="text-xs text-muted-foreground">This will be automatically assigned to all new students.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Summary */}
        {hasAttemptedSubmit && Object.keys(formErrors).length > 0 && (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Please fix the following errors:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                {Object.entries(formErrors).map(([field, errors]) => (
                  <li key={field}>
                    <strong>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {errors.join(', ')}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs for Single/Bulk Add */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Single Student
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Bulk Import (CSV)
            </TabsTrigger>
          </TabsList>

          {/* Single Student Form */}
          <TabsContent value="single" className="space-y-4">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Student Information
                </CardTitle>
                <CardDescription>Fill in the details to register a new student</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" data-tutorial-target="student-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nickname Field */}
                    <div 
                      className="space-y-2"
                      data-error={hasError('nickname')}
                    >
                      <Label htmlFor="nickname">
                        Nickname <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="nickname"
                          value={studentData.nickname}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^[A-Za-z0-9_]*$/.test(value)) {
                              handleInputChange("nickname", value);
                            }
                          }}
                          placeholder="Enter student nickname"
                          maxLength={20}
                          className={`pl-10 pr-24 ${
                            hasError('nickname') ? "border-red-500 bg-red-50 focus:ring-red-500" : ""
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                          {nicknameCheckLoading && studentData.nickname.length >= 3 && (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          )}
                          {nicknameAvailable === true && studentData.nickname.length >= 3 && !nicknameCheckLoading && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {nicknameAvailable === false && studentData.nickname.length >= 3 && !nicknameCheckLoading && (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="text-xs text-gray-500">{studentData.nickname.length}/20</span>
                        </div>
                      </div>
                      {hasError('nickname') && (
                        <p className="text-sm text-red-500 font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {getErrorMessage('nickname')}
                        </p>
                      )}
                      {!hasError('nickname') && nicknameAvailable === true && studentData.nickname.length >= 3 && !nicknameCheckLoading && (
                        <p className="text-sm text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Nickname is available
                        </p>
                      )}
                      {!hasError('nickname') && nicknameAvailable === false && studentData.nickname.length >= 3 && !nicknameCheckLoading && (
                        <p className="text-sm text-red-500 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Nickname is already taken
                        </p>
                      )}
                      {!hasError('nickname') && studentData.nickname.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Letters, numbers, and underscores only. 3-20 characters.
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div 
                      className="space-y-2"
                      data-error={hasError('email')}
                    >
                      <Label htmlFor="email">
                        Student Email <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={studentData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          onBlur={() => handleEmailBlur("email")}
                          placeholder="student@example.com"
                          className={`pl-10 ${
                            hasError('email') ? "border-red-500 bg-red-50 focus:ring-red-500" : ""
                          }`}
                        />
                      </div>
                      {hasError('email') && (
                        <p className="text-sm text-red-500 font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {getErrorMessage('email')}
                        </p>
                      )}
                      {!hasError('email') && studentData.email && validateEmail(studentData.email) === null && (
                        <p className="text-sm text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Valid email format
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date of Birth Field */}
                    <div 
                      className="space-y-2"
                      data-error={hasError('date_of_birth')}
                    >
                      <EnhancedDatePicker
                        showQuickSelect={false}
                        id="date_of_birth"
                        label="Date of Birth"
                        required
                        value={studentData.date_of_birth ? new Date(studentData.date_of_birth) : null}
                        onChange={(date) => {
                          if (date) {
                            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                            handleInputChange("date_of_birth", formattedDate);
                          }
                        }}
                        maxDate={new Date()}
                        minDate={new Date(1900, 0, 1)}
                        error={hasError('date_of_birth') ? getErrorMessage('date_of_birth') : undefined}
                        helperText="Age group will be automatically calculated"
                      />
                    </div>

                    {/* Age Group Field */}
                    <div 
                      className="space-y-2"
                      data-error={hasError('age_group')}
                    >
                      <Label htmlFor="age_group">
                        Age Group <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={studentData.age_group} 
                        onValueChange={(value) => {
                          handleInputChange("age_group", value);
                          // If age group is above 13, sync parent email with student email
                          if (value === "above_13" && studentData.email) {
                            handleInputChange("parent_email", studentData.email);
                          }
                        }}
                      >
                        <SelectTrigger className={hasError('age_group') ? "border-red-500 bg-red-50 focus:ring-red-500" : ""}>
                          <SelectValue placeholder="Select age group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="below_13">Under 13</SelectItem>
                          <SelectItem value="above_13">13 and Above</SelectItem>
                        </SelectContent>
                      </Select>
                      {hasError('age_group') && (
                        <p className="text-sm text-red-500 font-medium">
                          {getErrorMessage('age_group')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Parent Email Field */}
                    <div 
                      className="space-y-2"
                      data-error={hasError('parent_email')}
                    >
                      <Label htmlFor="parent_email">
                        Parent/Guardian Email <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="parent_email"
                          type="email"
                          value={studentData.parent_email}
                          onChange={(e) => handleInputChange("parent_email", e.target.value)}
                          onBlur={() => handleEmailBlur("parent_email")}
                          placeholder="parent@example.com"
                          className={`pl-10 ${
                            hasError('parent_email') ? "border-red-500 bg-red-50 focus:ring-red-500" : ""
                          }`}
                          disabled={studentData.age_group === "above_13"}
                        />
                      </div>
                      {hasError('parent_email') && (
                        <p className="text-sm text-red-500 font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {getErrorMessage('parent_email')}
                        </p>
                      )}
                      {!hasError('parent_email') && studentData.parent_email && validateEmail(studentData.parent_email) === null && (
                        <p className="text-sm text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Valid email format
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {studentData.age_group === "above_13" 
                          ? "For students 13 and above, parent email is automatically set to student email"
                          : "A consent request will be sent to this email address"
                        }
                      </p>
                    </div>

                    {/* Classroom Field */}
                    <div 
                      className="space-y-2" 
                      data-tutorial-target="classroom-select"
                      data-error={hasError('classroom_id')}
                    >
                      <Label htmlFor="classroom_id">
                        Classroom <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={studentData.classroom_id} 
                        onValueChange={(value) => handleInputChange("classroom_id", value)}
                      >
                        <SelectTrigger className={hasError('classroom_id') ? "border-red-500 bg-red-50 focus:ring-red-500" : ""}>
                          <SelectValue placeholder="Select classroom" />
                        </SelectTrigger>
                        <SelectContent>
                          {classrooms.length === 0 ? (
                            <SelectItem value="none" disabled>No classrooms available</SelectItem>
                          ) : (
                            classrooms.map((classroom) => (
                              <SelectItem key={classroom.id} value={classroom.id.toString()}>
                                {classroom.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {hasError('classroom_id') && (
                        <p className="text-sm text-red-500 font-medium">
                          {getErrorMessage('classroom_id')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Avatar Selection */}
                  <div 
                    className="space-y-2" 
                    data-tutorial-target="avatar-selection"
                    data-error={hasError('avatar')}
                  >
                    <Label>
                      Avatar <span className="text-red-500">*</span>
                    </Label>
                    {hasError('avatar') && (
                      <p className="text-sm text-red-500 font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {getErrorMessage('avatar')}
                      </p>
                    )}
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs text-blue-800 flex items-center gap-2">
                        <HelpCircle className="w-3 h-3 flex-shrink-0" />
                        <span><strong>Avatar requirements:</strong> Square images (200x200 to 2000x2000 pixels) work best. Max 10MB.</span>
                      </p>
                    </div>
                    <div className="space-y-3">
                      {/* Custom Avatar Upload */}
                      <div className="flex items-center gap-3">
                        <input
                          ref={avatarUploadRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => avatarUploadRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <ImageIcon className="h-4 w-4" />
                          Upload Custom Avatar
                        </Button>
                        {customAvatarPreview && (
                          <div className="flex items-center gap-2">
                            <img
                              src={customAvatarPreview}
                              alt="Custom avatar preview"
                              className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCustomAvatarFile(null);
                                setCustomAvatarPreview(null);
                                if (avatarUploadRef.current) {
                                  avatarUploadRef.current.value = '';
                                }
                                if (avatars.length > 0) {
                                  setSelectedAvatarId(avatars[0].id);
                                }
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Default Avatar Selection */}
                      {!customAvatarPreview && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Or select a default avatar:</p>
                          {avatarsLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 max-h-64 sm:max-h-80 overflow-y-auto p-2 border rounded-lg">
                              {avatars.map((avatar) => (
                                <button
                                  key={avatar.id}
                                  type="button"
                                  onClick={() => handleAvatarSelect(avatar.id)}
                                  className={`relative rounded-xl border-2 p-2 sm:p-3 transition-all hover:scale-105 group ${
                                    selectedAvatarId === avatar.id
                                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg shadow-blue-500/20"
                                      : "border-gray-200 hover:border-blue-300 bg-white"
                                  }`}
                                >
                                  <img
                                    src={avatar.image}
                                    alt={avatar.name}
                                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain mx-auto group-hover:scale-110 transition-transform"
                                  />
                                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-xs">{avatar.emoji}</span>
                                  <p className="text-xs mt-1 sm:mt-2 font-medium text-center text-gray-700 truncate">
                                    {avatar.name}
                                  </p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/teacher/manage-students")}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="hero"
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding Student...
                        </>
                      ) : (
                        "Add Student"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk CSV Import */}
          <TabsContent value="bulk" className="space-y-4" data-tutorial-target="bulk-import">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Bulk Import Students
                </CardTitle>
                <CardDescription>Upload a CSV file to add multiple students at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Download Template */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Download the CSV template to see the correct format</span>
                    <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </AlertDescription>
                </Alert>

                {/* Classroom Selection for Bulk Import */}
                <div className="space-y-2">
                  <Label htmlFor="bulk-classroom">
                    Select Classroom <span className="text-red-500">*</span>
                  </Label>
                  <Select value={studentData.classroom_id} onValueChange={(value) => handleInputChange("classroom_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select classroom for import" />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.length === 0 ? (
                        <SelectItem value="none" disabled>No classrooms available</SelectItem>
                      ) : (
                        classrooms.map((classroom) => (
                          <SelectItem key={classroom.id} value={classroom.id.toString()}>
                            {classroom.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    All imported students will be added to this classroom
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="csv-file">Upload CSV File</Label>
                  <div className="flex gap-2">
                    <Input
                      ref={fileInputRef}
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  </div>
                  {csvFile && (
                    <p className="text-sm text-muted-foreground">
                      File loaded: {csvFile.name} ({csvStudents.length} students)
                    </p>
                  )}
                </div>

                {/* Preview Table */}
                {csvStudents.length > 0 && (
                  <div className="space-y-2">
                    <Label>Preview ({csvStudents.length} students)</Label>
                    <div className="border rounded-lg overflow-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nickname</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>DOB</TableHead>
                            <TableHead>Parent Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvStudents.map((student, index) => (
                            <TableRow key={index}>
                              <TableCell>{student.nickname}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>{student.date_of_birth}</TableCell>
                              <TableCell>{student.parent_email || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Import Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCsvFile(null);
                      setCsvStudents([]);
                      setCsvResults([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={handleBulkImport}
                    disabled={csvImporting}
                  >
                    {csvImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import {csvStudents.length} Students
                      </>
                    )}
                  </Button>
                </div>

                {/* Results */}
                {csvResults.length > 0 && (
                  <div className="space-y-2">
                    <Label>Import Results</Label>
                    <div className="border rounded-lg overflow-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Nickname</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvResults.map((result, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {result.status === "success" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </TableCell>
                              <TableCell>{result.nickname}</TableCell>
                              <TableCell>{result.email}</TableCell>
                              <TableCell className="text-sm">
                                {result.status === "success"
                                  ? "Successfully added"
                                  : result.error || "Failed to add"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <ResultsTable/>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information Card */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-xl">ℹ️</div>
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Parent Consent Required
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  For students under 13, parent/guardian consent is required before the student can
                  access the platform. A consent request email will be automatically sent to the
                  provided parent email address for each student.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}