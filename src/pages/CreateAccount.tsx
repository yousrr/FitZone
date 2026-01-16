import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateContractCode, signup } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { Dumbbell, ArrowLeft, Check, Loader2, AlertCircle, Calendar } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  trainingFrequency: z.string().min(1, 'Training frequency is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const CreateAccount = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [contractCode, setContractCode] = useState('');
  const [isCodeValidated, setIsCodeValidated] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    trainingFrequency: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleValidateCode = async () => {
    if (!contractCode.trim()) {
      setCodeError('Please enter a contract code');
      return;
    }

    setValidatingCode(true);
    setCodeError('');

    try {
      const response = await validateContractCode(contractCode);
      if (response.data.valid) {
        setIsCodeValidated(true);
        setCodeError('');
      } else {
        setCodeError(response.data.reason || 'Invalid contract code');
        setIsCodeValidated(false);
      }
    } catch (error: any) {
      const message = error.response?.data?.reason || error.response?.data?.message || 'Failed to validate code';
      setCodeError(message);
      setIsCodeValidated(false);
    } finally {
      setValidatingCode(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const result = signupSchema.safeParse(formData);
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
      const response = await signup({
        contractCode,
        ...formData,
      });
      login(response.data.token);
      navigate('/member');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      if (message === 'Signup succeeded, but login failed') {
        navigate('/login', {
          state: {
            signupEmail: formData.email,
            signupNotice: 'Account created. Please sign in to continue.'
          }
        });
        return;
      }
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

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
      <main className="flex-1 container mx-auto px-6 py-12 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">
            Enter your contract code to get started with your membership.
          </p>
        </div>

        {/* Visit Link */}
        <Card className="mb-6 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm">
              <span className="text-muted-foreground">Are you not subscribed yet? </span>
              <Link to="/plan-visit" className="text-primary hover:underline font-medium">
                Plan a visit in our locals to subscribe
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Contract Code Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Contract Code
              {isCodeValidated && <Check className="h-5 w-5 text-success" />}
            </CardTitle>
            <CardDescription>
              Enter the contract code provided after your subscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="GYM-XXXX"
                value={contractCode}
                onChange={(e) => {
                  setContractCode(e.target.value);
                  setCodeError('');
                  if (isCodeValidated) setIsCodeValidated(false);
                }}
                disabled={isCodeValidated}
                className={isCodeValidated ? 'border-success bg-success/5' : ''}
              />
              <Button 
                onClick={handleValidateCode} 
                disabled={validatingCode || isCodeValidated}
                variant={isCodeValidated ? 'secondary' : 'default'}
              >
                {validatingCode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCodeValidated ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Valid
                  </>
                ) : (
                  'Validate'
                )}
              </Button>
            </div>
            {codeError && (
              <div className="flex items-center gap-2 mt-3 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {codeError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signup Form */}
        <Card className={!isCodeValidated ? 'opacity-50' : ''}>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <CardDescription>
              Complete your profile to activate your membership.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    name="firstName"
                    placeholder="yousr"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isCodeValidated || submitting}
                  />
                  {formErrors.firstName && (
                    <p className="text-destructive text-xs">{formErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    name="lastName"
                    placeholder="Bourakkadi"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isCodeValidated || submitting}
                  />
                  {formErrors.lastName && (
                    <p className="text-destructive text-xs">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isCodeValidated || submitting}
                />
                {formErrors.dateOfBirth && (
                  <p className="text-destructive text-xs">{formErrors.dateOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Training Frequency</label>
                <select
                  name="trainingFrequency"
                  value={formData.trainingFrequency}
                  onChange={handleInputChange}
                  disabled={!isCodeValidated || submitting}
                  className="flex h-11 w-full rounded-lg border border-border bg-secondary/50 px-4 py-2 text-sm text-foreground ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30"
                >
                  <option value="">Select frequency</option>
                  <option value="1-2/week">1-2 times per week</option>
                  <option value="3-4/week">3-4 times per week</option>
                  <option value="5-6/week">5-6 times per week</option>
                  <option value="daily">Daily</option>
                </select>
                {formErrors.trainingFrequency && (
                  <p className="text-destructive text-xs">{formErrors.trainingFrequency}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isCodeValidated || submitting}
                />
                {formErrors.email && (
                  <p className="text-destructive text-xs">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={!isCodeValidated || submitting}
                />
                {formErrors.password && (
                  <p className="text-destructive text-xs">{formErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={!isCodeValidated || submitting}
                />
                {formErrors.confirmPassword && (
                  <p className="text-destructive text-xs">{formErrors.confirmPassword}</p>
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
                disabled={!isCodeValidated || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateAccount;
