import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface EnhancedDatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  error?: string;
  filterDate?: (date: Date) => boolean;
  helperText?: string;
  disabled?: boolean;
  id?: string;
  openToDate?: Date;
  quickSelectAges?: number[]; // Array of ages for quick selection (e.g., [13, 18, 25, 30])
  showQuickSelect?: boolean; // Whether to show quick select buttons at all
}

const EnhancedDatePicker = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  required = false,
  error,
  filterDate,
  helperText,
  disabled = false,
  id = "date-picker",
  openToDate,
  quickSelectAges = [13, 18, 25, 30], // Default ages - ADD THIS
  showQuickSelect = true, // Show by default - ADD THIS
}: EnhancedDatePickerProps) => {
  // Separate fields for better UX
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [inputError, setInputError] = useState("");

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<DatePicker>(null);
  const pickerContainerRef = useRef<HTMLDivElement>(null);

  // Sync separate fields with value prop
  useEffect(() => {
    if (value) {
      setDay(String(value.getDate()).padStart(2, "0"));
      setMonth(String(value.getMonth() + 1).padStart(2, "0"));
      setYear(String(value.getFullYear()));
    } else {
      setDay("");
      setMonth("");
      setYear("");
    }
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerContainerRef.current &&
        !pickerContainerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  // Validate and update date when fields change
  const validateAndUpdate = (newDay: string, newMonth: string, newYear: string) => {
    setInputError("");

    // Clear if all empty
    if (!newDay && !newMonth && !newYear) {
      onChange(null);
      return;
    }

    // Need all fields to create date
    if (newDay.length === 2 && newMonth.length === 2 && newYear.length === 4) {
      const dayNum = parseInt(newDay);
      const monthNum = parseInt(newMonth);
      const yearNum = parseInt(newYear);

      // Basic validation
      if (dayNum < 1 || dayNum > 31) {
        setInputError("Invalid day (1-31)");
        return;
      }
      if (monthNum < 1 || monthNum > 12) {
        setInputError("Invalid month (1-12)");
        return;
      }
      if (yearNum < 1900 || yearNum > new Date().getFullYear() + 10) {
        setInputError(`Invalid year (1900-${new Date().getFullYear() + 10})`);
        return;
      }

      // Create date object (month is 0-indexed)
      const parsedDate = new Date(yearNum, monthNum - 1, dayNum);

      // Check if date is valid (handles things like Feb 31)
      if (
        parsedDate.getDate() !== dayNum ||
        parsedDate.getMonth() !== monthNum - 1 ||
        parsedDate.getFullYear() !== yearNum
      ) {
        setInputError("Invalid date");
        return;
      }

      // Check min/max constraints
      if (minDate && parsedDate < minDate) {
        setInputError("Date is before minimum allowed date");
        return;
      }
      if (maxDate && parsedDate > maxDate) {
        setInputError("Date is after maximum allowed date");
        return;
      }

      // Check custom filter
      if (filterDate && !filterDate(parsedDate)) {
        setInputError("Date doesn't meet requirements");
        return;
      }

      // Valid date - update parent
      onChange(parsedDate);
    }
  };

  // Handle day input
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits

    if (value.length <= 2) {
      const numValue = parseInt(value);

      // Auto-correct invalid first digit
      if (value.length === 1 && numValue > 3) {
        setDay("0" + value);
        monthRef.current?.focus();
        validateAndUpdate("0" + value, month, year);
        return;
      }

      // Auto-correct invalid day
      if (value.length === 2 && (numValue > 31 || numValue === 0)) {
        return; // Don't allow invalid day
      }

      setDay(value);
      validateAndUpdate(value, month, year);

      // Auto-tab to month when day is complete
      if (value.length === 2) {
        monthRef.current?.focus();
      }
    }
  };

  // Handle month input
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits

    if (value.length <= 2) {
      const numValue = parseInt(value);

      // Auto-correct invalid first digit
      if (value.length === 1 && numValue > 1) {
        setMonth("0" + value);
        yearRef.current?.focus();
        validateAndUpdate(day, "0" + value, year);
        return;
      }

      // Auto-correct invalid month
      if (value.length === 2 && (numValue > 12 || numValue === 0)) {
        return; // Don't allow invalid month
      }

      setMonth(value);
      validateAndUpdate(day, value, year);

      // Auto-tab to year when month is complete
      if (value.length === 2) {
        yearRef.current?.focus();
      }
    }
  };

  // Handle year input
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits

    if (value.length <= 4) {
      setYear(value);
      validateAndUpdate(day, month, value);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: 'day' | 'month' | 'year'
  ) => {
    // Backspace navigation
    if (e.key === 'Backspace') {
      const input = e.currentTarget;
      if (input.value === '' || input.selectionStart === 0) {
        if (field === 'month' && day !== '') {
          e.preventDefault();
          dayRef.current?.focus();
          dayRef.current?.setSelectionRange(day.length, day.length);
        } else if (field === 'year' && month !== '') {
          e.preventDefault();
          monthRef.current?.focus();
          monthRef.current?.setSelectionRange(month.length, month.length);
        }
      }
    }

    // Arrow key navigation
    if (e.key === 'ArrowLeft') {
      const input = e.currentTarget;
      if (input.selectionStart === 0) {
        e.preventDefault();
        if (field === 'month') {
          dayRef.current?.focus();
          dayRef.current?.setSelectionRange(day.length, day.length);
        } else if (field === 'year') {
          monthRef.current?.focus();
          monthRef.current?.setSelectionRange(month.length, month.length);
        }
      }
    }

    if (e.key === 'ArrowRight') {
      const input = e.currentTarget;
      if (input.selectionStart === input.value.length) {
        e.preventDefault();
        if (field === 'day' && day.length > 0) {
          monthRef.current?.focus();
          monthRef.current?.setSelectionRange(0, 0);
        } else if (field === 'month' && month.length > 0) {
          yearRef.current?.focus();
          yearRef.current?.setSelectionRange(0, 0);
        }
      }
    }

    // Slash key to move to next field
    if (e.key === '/') {
      e.preventDefault();
      if (field === 'day') {
        monthRef.current?.focus();
      } else if (field === 'month') {
        yearRef.current?.focus();
      }
    }
  };

  // Handle calendar selection
  const handleDateSelect = (date: Date | null) => {
    onChange(date);
    setShowPicker(false);
    setInputError("");
  };

  // Quick date selection helpers
  const setQuickDate = (yearsAgo: number) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);
    onChange(date);
    setInputError("");
  };

  // Clear all fields
  const clearDate = () => {
    setDay("");
    setMonth("");
    setYear("");
    onChange(null);
    setInputError("");
    dayRef.current?.focus();
  };

  return (
    <div className="grid gap-2">
      {label && (
        <Label htmlFor={id} className="text-sm sm:text-base">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="space-y-2.5 sm:space-y-4">
        {/* Input Fields Row */}
        <div className="relative w-full" ref={pickerContainerRef}>
          <div className="flex items-center gap-2 bg-background rounded-lg p-2 border border-border w-full">
            {/* Day Input */}
            <div className="w-[70px] flex-shrink-0">
              <Input
                ref={dayRef}
                type="text"
                inputMode="numeric"
                value={day}
                onChange={handleDayChange}
                onKeyDown={(e) => handleKeyDown(e, 'day')}
                placeholder="DD"
                maxLength={2}
                disabled={disabled}
                className={`text-center h-10 text-sm font-medium transition-all px-2 ${
                  error || inputError 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-border focus:border-primary focus:ring-primary/20"
                } hover:border-primary/50 bg-background`}
              />
            </div>

            <span className="text-muted-foreground/70 text-lg font-semibold flex-shrink-0">/</span>

            {/* Month Input */}
            <div className="w-[70px] flex-shrink-0">
              <Input
                ref={monthRef}
                type="text"
                inputMode="numeric"
                value={month}
                onChange={handleMonthChange}
                onKeyDown={(e) => handleKeyDown(e, 'month')}
                placeholder="MM"
                maxLength={2}
                disabled={disabled}
                className={`text-center h-10 text-sm font-medium transition-all px-2 ${
                  error || inputError 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-border focus:border-primary focus:ring-primary/20"
                } hover:border-primary/50 bg-background`}
              />
            </div>

            <span className="text-muted-foreground/70 text-lg font-semibold flex-shrink-0">/</span>

            {/* Year Input */}
            <div className="w-[90px] flex-shrink-0">
              <Input
                ref={yearRef}
                type="text"
                inputMode="numeric"
                value={year}
                onChange={handleYearChange}
                onKeyDown={(e) => handleKeyDown(e, 'year')}
                placeholder="YYYY"
                maxLength={4}
                disabled={disabled}
                className={`text-center h-10 text-sm font-medium px-2 transition-all ${
                  error || inputError 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-border focus:border-primary focus:ring-primary/20"
                } hover:border-primary/50 bg-background`}
              />
            </div>

            {/* Calendar Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPicker(!showPicker)}
              disabled={disabled}
              className={`h-10 px-3 flex-shrink-0 transition-all rounded-md ${
                showPicker 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "hover:bg-accent hover:border-primary/50"
              }`}
            >
              <Calendar className="h-4 w-4" />
            </Button>

            {/* Clear Button */}
            {(day || month || year) && !disabled && (
              <Button
                type="button"
                variant="ghost"
                onClick={clearDate}
                className="h-10 w-10 px-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0 transition-colors rounded-md"
                title="Clear date"
              >
                <span className="text-lg">×</span>
              </Button>
            )}
          </div>

          {/* Date Picker Dropdown */}
          {showPicker && (
            <div className="absolute z-50 mt-2 bg-white border rounded-lg shadow-xl left-0 right-0 sm:left-auto sm:right-auto sm:w-auto animate-in fade-in-0 zoom-in-95 duration-200 max-w-[calc(100vw-2rem)] sm:max-w-none">
              <div className="overflow-x-auto p-1.5 sm:p-2">
                <DatePicker
                  ref={datePickerRef}
                  selected={value}
                  onChange={handleDateSelect}
                  inline
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={150}
                  minDate={minDate}
                  maxDate={maxDate}
                  filterDate={filterDate}
                  openToDate={openToDate || value || new Date(new Date().getFullYear() - 20, 0, 1)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Selection Buttons */}
        {showQuickSelect && quickSelectAges && quickSelectAges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2.5 w-full">
            {quickSelectAges.map((age) => {
              const currentYear = new Date().getFullYear();
              const targetYear = currentYear - age;
              const isSelected = value && value.getFullYear() === targetYear;
              
              return (
                <Button
                  key={age}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuickDate(age)}
                  disabled={disabled}
                  className={`text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-4 transition-all flex-shrink-0 ${
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "hover:bg-accent hover:border-primary/50"
                  }`}
                >
                  <span className="whitespace-nowrap">{age} years old</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Helper Text or Error */}
      {(inputError || error) && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span className="text-red-500">⚠</span> {inputError || error}
        </p>
      )}
      {!inputError && !error && helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};

export default EnhancedDatePicker;