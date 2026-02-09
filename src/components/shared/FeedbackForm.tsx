import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/config/api';

interface FeedbackFormProps {
  type: 'teacher' | 'user';
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ type }) => {
  const isTeacher = type === 'teacher';
  
  // Teacher form state
  const [teacherForm, setTeacherForm] = useState({
    engagement: '',
    kindnessPromotion: '',
    easeOfUse: '',
    recommendation: '',
    curriculumFit: '',
    behaviorChanges: '',
    improvements: ''
  });

  // User/Kids form state
  const [userForm, setUserForm] = useState({
    happiness: '',
    easeOfUse: '',
    enjoyment: '',
    kindnessLearning: '',
    futureChallenges: '',
    favoriteActivity: '',
    improvements: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (isTeacher) {
      if (!teacherForm.engagement) newErrors.engagement = 'Please select an option';
      if (!teacherForm.kindnessPromotion) newErrors.kindnessPromotion = 'Please select an option';
      if (!teacherForm.easeOfUse) newErrors.easeOfUse = 'Please select an option';
      if (!teacherForm.recommendation) newErrors.recommendation = 'Please select an option';
      if (!teacherForm.curriculumFit) newErrors.curriculumFit = 'Please select an option';
      if (!teacherForm.behaviorChanges.trim()) newErrors.behaviorChanges = 'This field is required';
      if (!teacherForm.improvements.trim()) newErrors.improvements = 'This field is required';
    } else {
      if (!userForm.happiness) newErrors.happiness = 'Please select an option';
      if (!userForm.easeOfUse) newErrors.easeOfUse = 'Please select an option';
      if (!userForm.enjoyment) newErrors.enjoyment = 'Please select an option';
      if (!userForm.kindnessLearning) newErrors.kindnessLearning = 'Please select an option';
      if (!userForm.futureChallenges) newErrors.futureChallenges = 'Please select an option';
      if (!userForm.favoriteActivity.trim()) newErrors.favoriteActivity = 'This field is required';
      if (!userForm.improvements.trim()) newErrors.improvements = 'This field is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please complete all fields",
        description: "All questions are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = isTeacher ? {
        form_type: 'teacher',
        question_1: teacherForm.engagement,
        question_2: teacherForm.kindnessPromotion,
        question_3: teacherForm.easeOfUse,
        question_4: teacherForm.recommendation,
        question_5: teacherForm.curriculumFit,
        question_6: teacherForm.behaviorChanges,
        question_7: teacherForm.improvements
      } : {
        form_type: 'student',
        question_1: userForm.happiness,
        question_2: userForm.easeOfUse,
        question_3: userForm.enjoyment,
        question_4: userForm.kindnessLearning,
        question_5: userForm.futureChallenges,
        question_6: userForm.favoriteActivity,
        question_7: userForm.improvements
      };

      const response = await apiFetch('/feedback', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        setIsSubmitted(true);
        toast({
          title: "Feedback submitted!",
          description: "Thank you for your feedback. We appreciate it!",
        });
        
        // Reset form after delay
        setTimeout(() => {
          if (isTeacher) {
            setTeacherForm({
              engagement: '',
              kindnessPromotion: '',
              easeOfUse: '',
              recommendation: '',
              curriculumFit: '',
              behaviorChanges: '',
              improvements: ''
            });
          } else {
            setUserForm({
              happiness: '',
              easeOfUse: '',
              enjoyment: '',
              kindnessLearning: '',
              futureChallenges: '',
              favoriteActivity: '',
              improvements: ''
            });
          }
          setIsSubmitted(false);
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to submit feedback');
      }
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      toast({
        title: "Error submitting feedback",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingQuestion = ({ 
    label, 
    value, 
    onChange, 
    error,
    options 
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
    error?: string;
    options: string[];
  }) => (
    <div className="space-y-3">
      <Label className="text-base font-semibold">
        {label} <span className="text-red-500">*</span>
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`
                flex-1 min-w-[80px] px-3 py-2 rounded-lg border-2 transition-all
                ${value === option 
                  ? 'border-primary bg-primary/10 text-primary font-semibold' 
                  : 'border-border hover:border-primary/50 hover:bg-muted'
                }
                ${error ? 'border-red-500' : ''}
              `}
            >
              <span className="text-sm">{option}</span>
            </button>
          );
        })}
      </div>
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Thank you for your feedback!</strong> We appreciate you taking the time to share your thoughts with us.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">🌈 Pass The Ripple Feedback Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" data-tutorial-target="feedback-form">
          {isTeacher ? (
            <>
              <RatingQuestion
                label="1. How engaged were your students during the Pass The Ripple activities?"
                value={teacherForm.engagement}
                onChange={(value) => {
                  setTeacherForm(prev => ({ ...prev, engagement: value }));
                  if (errors.engagement) setErrors(prev => ({ ...prev, engagement: '' }));
                }}
                error={errors.engagement}
                options={['Not engaged', 'Slightly', 'Moderately', 'Very', 'Extremely engaged']}
              />

              <RatingQuestion
                label="2. Did Pass The Ripple help promote kindness and empathy in your classroom?"
                value={teacherForm.kindnessPromotion}
                onChange={(value) => {
                  setTeacherForm(prev => ({ ...prev, kindnessPromotion: value }));
                  if (errors.kindnessPromotion) setErrors(prev => ({ ...prev, kindnessPromotion: '' }));
                }}
                error={errors.kindnessPromotion}
                options={['Not much', 'Somewhat', 'Yes', 'Very much', 'Definitely']}
              />

              <RatingQuestion
                label="3. How easy was the Pass The Ripple platform to use with your class?"
                value={teacherForm.easeOfUse}
                onChange={(value) => {
                  setTeacherForm(prev => ({ ...prev, easeOfUse: value }));
                  if (errors.easeOfUse) setErrors(prev => ({ ...prev, easeOfUse: '' }));
                }}
                error={errors.easeOfUse}
                options={['Difficult', 'Okay', 'Easy', 'Very easy', 'Extremely easy']}
              />

              <RatingQuestion
                label="4. How likely are you to recommend Pass The Ripple to other teachers?"
                value={teacherForm.recommendation}
                onChange={(value) => {
                  setTeacherForm(prev => ({ ...prev, recommendation: value }));
                  if (errors.recommendation) setErrors(prev => ({ ...prev, recommendation: '' }));
                }}
                error={errors.recommendation}
                options={['Not likely', 'Maybe', 'Likely', 'Very likely', 'Definitely!']}
              />

              <RatingQuestion
                label="5. Did Pass The Ripple activities fit well with your school's values or curriculum?"
                value={teacherForm.curriculumFit}
                onChange={(value) => {
                  setTeacherForm(prev => ({ ...prev, curriculumFit: value }));
                  if (errors.curriculumFit) setErrors(prev => ({ ...prev, curriculumFit: '' }));
                }}
                error={errors.curriculumFit}
                options={['Not at all', 'Somewhat', 'Yes', 'Very well', 'Perfectly']}
              />

              <div className="space-y-2">
                <Label htmlFor="behaviorChanges" className="text-base font-semibold">
                  6. What changes did you notice in your students' behavior or teamwork? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="behaviorChanges"
                  placeholder="Share your observations..."
                  value={teacherForm.behaviorChanges}
                  onChange={(e) => {
                    setTeacherForm(prev => ({ ...prev, behaviorChanges: e.target.value }));
                    if (errors.behaviorChanges) setErrors(prev => ({ ...prev, behaviorChanges: '' }));
                  }}
                  className={`min-h-[100px] ${errors.behaviorChanges ? 'border-red-500' : ''}`}
                />
                {errors.behaviorChanges && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.behaviorChanges}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvements" className="text-base font-semibold">
                  7. What improvements or new features would you like to see in Pass The Ripple for teachers? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="improvements"
                  placeholder="Share your ideas..."
                  value={teacherForm.improvements}
                  onChange={(e) => {
                    setTeacherForm(prev => ({ ...prev, improvements: e.target.value }));
                    if (errors.improvements) setErrors(prev => ({ ...prev, improvements: '' }));
                  }}
                  className={`min-h-[100px] ${errors.improvements ? 'border-red-500' : ''}`}
                />
                {errors.improvements && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.improvements}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <RatingQuestion
                label="1. How happy did you feel after doing a Pass The Ripple activity?"
                value={userForm.happiness}
                onChange={(value) => {
                  setUserForm(prev => ({ ...prev, happiness: value }));
                  if (errors.happiness) setErrors(prev => ({ ...prev, happiness: '' }));
                }}
                error={errors.happiness}
                options={['Not happy', 'Okay', 'Good', 'Very happy', 'Super happy!']}
              />

              <RatingQuestion
                label="2. Was the Pass The Ripple website easy to use?"
                value={userForm.easeOfUse}
                onChange={(value) => {
                  setUserForm(prev => ({ ...prev, easeOfUse: value }));
                  if (errors.easeOfUse) setErrors(prev => ({ ...prev, easeOfUse: '' }));
                }}
                error={errors.easeOfUse}
                options={['Very hard', 'Hard', 'Okay', 'Easy', 'Very easy']}
              />

              <RatingQuestion
                label="3. How much did you enjoy doing the Pass The Ripple challenges?"
                value={userForm.enjoyment}
                onChange={(value) => {
                  setUserForm(prev => ({ ...prev, enjoyment: value }));
                  if (errors.enjoyment) setErrors(prev => ({ ...prev, enjoyment: '' }));
                }}
                error={errors.enjoyment}
                options={["Didn't like it", 'It was okay', 'Liked it', 'Loved it', 'Absolutely loved it 💖']}
              />

              <RatingQuestion
                label="4. Did Pass The Ripple help you learn more about kindness?"
                value={userForm.kindnessLearning}
                onChange={(value) => {
                  setUserForm(prev => ({ ...prev, kindnessLearning: value }));
                  if (errors.kindnessLearning) setErrors(prev => ({ ...prev, kindnessLearning: '' }));
                }}
                error={errors.kindnessLearning}
                options={['Not really', 'A little', 'Yes', 'Definitely', 'A lot!']}
              />

              <RatingQuestion
                label="5. Would you like to do more Pass The Ripple challenges in the future?"
                value={userForm.futureChallenges}
                onChange={(value) => {
                  setUserForm(prev => ({ ...prev, futureChallenges: value }));
                  if (errors.futureChallenges) setErrors(prev => ({ ...prev, futureChallenges: '' }));
                }}
                error={errors.futureChallenges}
                options={['No', 'Maybe', 'Yes', 'Definitely', "Can't wait! 🚀"]}
              />

              <div className="space-y-2">
                <Label htmlFor="favoriteActivity" className="text-base font-semibold">
                  6. What was your favorite Pass The Ripple activity or moment? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="favoriteActivity"
                  placeholder="Tell us about your favorite moment..."
                  value={userForm.favoriteActivity}
                  onChange={(e) => {
                    setUserForm(prev => ({ ...prev, favoriteActivity: e.target.value }));
                    if (errors.favoriteActivity) setErrors(prev => ({ ...prev, favoriteActivity: '' }));
                  }}
                  className={`min-h-[100px] ${errors.favoriteActivity ? 'border-red-500' : ''}`}
                />
                {errors.favoriteActivity && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.favoriteActivity}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvements" className="text-base font-semibold">
                  7. What can we do to make Pass The Ripple more fun for you? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="improvements"
                  placeholder="Share your ideas..."
                  value={userForm.improvements}
                  onChange={(e) => {
                    setUserForm(prev => ({ ...prev, improvements: e.target.value }));
                    if (errors.improvements) setErrors(prev => ({ ...prev, improvements: '' }));
                  }}
                  className={`min-h-[100px] ${errors.improvements ? 'border-red-500' : ''}`}
                />
                {errors.improvements && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.improvements}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="pt-4 space-y-3">
            <p className="text-sm text-gray-600 text-center">
              <span className="text-red-500">*</span> indicates mandatory fields
            </p>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              data-tutorial-target="submit-feedback"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;

