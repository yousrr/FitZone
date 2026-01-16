import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createVisit } from '@/lib/api';
import { z } from 'zod';
import { Dumbbell, ArrowLeft, MapPin, Clock, Phone, Mail, Check, Loader2, AlertCircle, KeyRound } from 'lucide-react';

const visitSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().min(1, 'Phone number is required').max(20),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  message: z.string().max(500).optional(),
});

const PlanVisit = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setFormErrors({});

    const result = visitSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      await createVisit(formData);
      setSuccess(true);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to schedule visit. Please try again.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-heading font-bold">FitZone</span>
          </Link>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">Plan Your Visit</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ready to start your fitness journey? Schedule a visit to our facility and meet our team. We'll help you find the perfect plan and provide you with your contract code.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Gym Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    123 Fitness Street<br />
                    Downtown District<br />
                    New York, NY 10001
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Operating Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span>5:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saturday</span>
                    <span>6:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sunday</span>
                    <span>7:00 AM - 8:00 PM</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>info@fitzone.com</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contract Code CTA */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <KeyRound className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Already have a contract code?</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        If you've already subscribed and have your code, you can create your account right away.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => navigate('/signup')}>
                        Create Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visit Form */}
            <div>
              {success ? (
                <Card className="border-success">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-success" />
                    </div>
                    <h2 className="text-xl font-heading font-bold mb-2">Visit Scheduled!</h2>
                    <p className="text-muted-foreground mb-6">
                      Thank you for scheduling a visit. Our team will contact you shortly to confirm your appointment.
                    </p>
                    <div className="space-y-3">
                      <Button variant="hero" className="w-full" onClick={() => navigate('/')}>
                        Back to Home
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => {
                        setSuccess(false);
                        setFormData({
                          fullName: '',
                          phone: '',
                          preferredDate: '',
                          preferredTime: '',
                          message: '',
                        });
                      }}>
                        Schedule Another Visit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule Your Visit</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you within 24 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name *</label>
                        <Input
                          name="fullName"
                          placeholder="yousr Bourakkadi"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          disabled={submitting}
                        />
                        {formErrors.fullName && (
                          <p className="text-destructive text-xs">{formErrors.fullName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number *</label>
                        <Input
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={submitting}
                        />
                        {formErrors.phone && (
                          <p className="text-destructive text-xs">{formErrors.phone}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Preferred Date *</label>
                          <Input
                            name="preferredDate"
                            type="date"
                            min={minDate}
                            value={formData.preferredDate}
                            onChange={handleInputChange}
                            disabled={submitting}
                          />
                          {formErrors.preferredDate && (
                            <p className="text-destructive text-xs">{formErrors.preferredDate}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Preferred Time *</label>
                          <Input
                            name="preferredTime"
                            type="time"
                            value={formData.preferredTime}
                            onChange={handleInputChange}
                            disabled={submitting}
                          />
                          {formErrors.preferredTime && (
                            <p className="text-destructive text-xs">{formErrors.preferredTime}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Message (Optional)</label>
                        <textarea
                          name="message"
                          placeholder="Tell us about your fitness goals or any questions you have..."
                          value={formData.message}
                          onChange={handleInputChange}
                          disabled={submitting}
                          rows={4}
                          className="flex w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30 resize-none"
                        />
                        {formErrors.message && (
                          <p className="text-destructive text-xs">{formErrors.message}</p>
                        )}
                      </div>

                      {submitError && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {submitError}
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        variant="hero" 
                        className="w-full" 
                        size="lg"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Scheduling...
                          </>
                        ) : (
                          'Schedule Visit'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlanVisit;
