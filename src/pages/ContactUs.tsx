import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/config/api';
import Seo from '@/components/Seo';
import { useApplicationSettings } from '@/hooks/useSettingsGroups';
import Captcha from '@/components/Captcha';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import bgImg from "@/assets/ripple2/bg-img.png";
import contactTitle from "@/assets/Contact Us/contact us title.webp";
import thankYouImg from "@/assets/Contact Us/Thank You.jpg";
import '@/styles/pages/_contact-us.scss';

interface FormData {
  name: string;
  email: string;
  category: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  category?: string;
  message?: string;
  captcha?: string;
}

const ContactUs = () => {
  const { settings: appSettings } = useApplicationSettings();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    category: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);

  const supportEmail = appSettings?.support_email || "hello@ripplechallenge.org";

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.category) newErrors.category = 'Please select a topic';
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Please provide more details (at least 10 characters)';
    }

    if (!captchaValid) {
      newErrors.captcha = 'Please verify that you are not a robot';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          subject: `Contact Form: ${formData.category}`
        })
      }) as { success: boolean; message?: string };

      if (response.success) {
        setIsSubmitted(true);
        toast({ title: "Message sent!", description: "We'll get back to you shortly." });
        setFormData({ name: '', email: '', category: '', message: '' });
        setCaptchaValid(false);
        setCaptchaResetTrigger(prev => prev + 1);
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Could not send message. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="contact-us-page">
      <Seo title="Contact Us — Pass The Ripple" description="Get in touch. We're here to help." canonical={`${window.location.origin}/contact-us`} />

      {!isSubmitted ? (
        <>
          {/* Header with colorful title */}
          <section className="contact-header scroll-h" id="zoom-wrapper">
            <div className="container">
              <img
                src={contactTitle}
                alt="Get In Touch"
                className="contact-title-img"
              />
              <p className="contact-subtitle">
                Have a question, idea or concern? We'd love to hear from you
              </p>
            </div>
          </section>

          <section className="contact-content">
            <div className="container">
              <div>

                {/* Left Side: Contact Info & Safety Report */}
                <div className="info-cards-grid">
                  {/* Contact Information */}
                  <div className="contact-info-card">
                    <h3>Contact Information</h3>
                    <div className="space-y-4">
                      {/* <div className="info-item">
                        <div className="icon-wrapper blue">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="info-content">
                          <p className="info-label">Email Us</p>
                          <p className="info-value">
                            <a href={`mailto:${supportEmail}`}>
                              {supportEmail}
                            </a>
                          </p>
                        </div>
                      </div> */}
                      <div className="info-item">
                        <div className="icon-wrapper purple">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="info-content">
                          <p className="info-label">Response Time</p>
                          <p className="info-value">
                            Usually within 24-48 hours
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Safety Report Box */}
                  <div className="safety-report-card">
                    <div className="safety-content">
                      <div className="safety-icon">
                        <div className="icon-circle">
                          <span>⚠️</span>
                        </div>
                      </div>
                      <div className="safety-text">
                        <h3>Safety Report?</h3>
                        <p>
                          If you see something concerning or inappropriate, please select "Safety Concern" in the form. These are our top priority.
                        </p>
                        <Link to="/privacy-policy">
                          READ PRIVACY POLICY
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                <div>

                {/* Right Side: Contact Form */}
                <div className="lg:col-span-2">
                  <div className="contact-form-card">
                    <form onSubmit={handleContactSubmit} className="text-left">
                      <div className="form-row">
                        <div className="form-group">
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={e => handleInputChange('name', e.target.value)}
                            className={errors.name ? 'error' : ''}
                          />
                          {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={e => handleInputChange('email', e.target.value)}
                            className={errors.email ? 'error' : ''}
                          />
                          {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                      </div>

                      <div className="form-group">
                        <Label htmlFor="category">What's this regarding?</Label>
                        <Select value={formData.category} onValueChange={(val) => handleInputChange('category', val)}>
                          <SelectTrigger className={errors.category ? 'error' : ''}>
                            <SelectValue placeholder="Select a topic..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Question</SelectItem>
                            <SelectItem value="teacher">Teacher / Classroom Help</SelectItem>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="safety">Safety Concern 🛡️</SelectItem>
                            <SelectItem value="feedback">Feedback / Idea</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.category && <span className="error-message">{errors.category}</span>}
                      </div>

                      <div className="form-group">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="How can we help?"
                          className={errors.message ? 'error' : ''}
                          value={formData.message}
                          onChange={e => handleInputChange('message', e.target.value)}
                        />
                        {errors.message && <span className="error-message">{errors.message}</span>}
                      </div>

                      <div className="captcha-wrapper">
                        <Captcha
                          onVerify={setCaptchaValid}
                          error={errors.captcha}
                          disabled={isSubmitting}
                          resetTrigger={captchaResetTrigger}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="submit-button"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Thank You Page */
        <section className="thank-you-section">
          <div className="container">
            <div>

              {/* Left Side - Same Info Boxes */}
              <div className="info-cards-grid">
                {/* Safety Report Box */}
                <div className="safety-report-card">
                  <div className="safety-content">
                    <div className="safety-icon">
                      <div className="icon-circle">
                        <span>⚠️</span>
                      </div>
                    </div>
                    <div className="safety-text">
                      <h3>Safety Report?</h3>
                      <p>
                        If you see something concerning or inappropriate, please select "Safety Concern" in the form. These are our top priority.
                      </p>
                      <Link to="/privacy-policy">
                        READ PRIVACY POLICY
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="contact-info-card">
                  <h3>Contact Information</h3>
                  <div className="space-y-4">
                    <div className="info-item">
                      <div className="icon-wrapper blue">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="info-content">
                        <p className="info-label">Email Us</p>
                        <p className="info-value">
                          <a href={`mailto:${supportEmail}`}>
                            {supportEmail}
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="icon-wrapper purple">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="info-content">
                        <p className="info-label">Response Time</p>
                        <p className="info-value">
                          Usually within 24-48 hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Thank You Message with Characters */}
              <div className="lg:col-span-2">
                <div className="thank-you-image-card">
                  <div className="relative">
                    <img
                      src={thankYouImg}
                      alt="Thank you for your message"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default ContactUs;
