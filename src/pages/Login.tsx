import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login as apiLogin } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { Dumbbell, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Check for subscription inactive state from redirect
  const subscriptionInactive = location.state?.subscriptionInactive;
  const signupEmail = location.state?.signupEmail;
  const signupNotice = location.state?.signupNotice;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/member');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (signupEmail) {
      setFormData(prev => ({ ...prev, email: signupEmail }));
    }
  }, [signupEmail]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setFormErrors({});

    const result = loginSchema.safeParse(formData);
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
      const response = await apiLogin(formData.email, formData.password);
      login(response.data.token);
      navigate('/member');
    } catch (error: any) {
      if (error.response?.status === 403) {
        // Subscription not active
        const message = error.response?.data?.message || 'Your subscription is not active. Please contact support.';
        setSubmitError(message);
      } else {
        const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
        setSubmitError(message);
      }
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
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to access your member dashboard.
            </p>
          </div>

          {subscriptionInactive && (
            <Card className="mb-6 border-destructive/50 bg-destructive/10">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">
                  Your subscription is no longer active. Please renew your membership to access your account.
                </p>
              </CardContent>
            </Card>
          )}

          {signupNotice && (
            <Card className="mb-6 border-primary/30 bg-primary/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm text-foreground">{signupNotice}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your email and password to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={submitting}
                    autoComplete="email"
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
                    disabled={submitting}
                    autoComplete="current-password"
                  />
                  {formErrors.password && (
                    <p className="text-destructive text-xs">{formErrors.password}</p>
                  )}
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
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
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Create one
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Login;
