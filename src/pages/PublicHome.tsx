import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlans, getCategories } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, Users, Calendar, Waves, Flame, Trophy, ArrowRight, LogIn, UserPlus, MapPin } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  features: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  crossfit: <Flame className="h-8 w-8" />,
  pool: <Waves className="h-8 w-8" />,
  gym: <Dumbbell className="h-8 w-8" />,
  classes: <Users className="h-8 w-8" />,
  default: <Trophy className="h-8 w-8" />,
};

const PublicHome = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, categoriesRes] = await Promise.all([
          getPlans(),
          getCategories(),
        ]);
        setPlans(plansRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Set demo data for preview
        setPlans([
          { id: '1', name: 'Basic', price: 29, billingPeriod: 'month', features: ['Gym Access', 'Locker Room', 'Free Wifi'] },
          { id: '2', name: 'Pro', price: 59, billingPeriod: 'month', features: ['All Basic Features', 'Pool Access', 'Group Classes', 'Personal Trainer 1x/month'] },
          { id: '3', name: 'Elite', price: 99, billingPeriod: 'month', features: ['All Pro Features', 'CrossFit Classes', 'Unlimited PT Sessions', 'Nutrition Coaching'] },
        ]);
        setCategories([
          { id: '1', name: 'CrossFit', description: 'High-intensity functional training' },
          { id: '2', name: 'Pool', description: 'Olympic swimming facilities' },
          { id: '3', name: 'Gym', description: 'State-of-the-art equipment' },
          { id: '4', name: 'Classes', description: 'Yoga, Pilates, and more' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/member');
    }
  }, [isAuthenticated, navigate]);

  const getCategoryIcon = (name: string) => {
    const key = name.toLowerCase();
    return categoryIcons[key] || categoryIcons.default;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-heading font-bold">FitZone</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
            <Button variant="hero" onClick={() => navigate('/signup')}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 animate-fade-in">
            Transform Your
            <span className="block gradient-text">Fitness Journey</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Join our state-of-the-art facility and unlock your full potential with expert coaches, premium equipment, and a supportive community.
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button variant="hero" size="xl" onClick={() => navigate('/signup')}>
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="xl" onClick={() => navigate('/plan-visit')}>
              <MapPin className="h-5 w-5 mr-2" />
              Plan a Visit
            </Button>
          </div>
        </div>
      </header>

      {/* Categories Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Our Facilities</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our world-class amenities designed to help you achieve your fitness goals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-8">
                  <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
                  <div className="h-6 w-24 bg-muted rounded mb-2" />
                  <div className="h-4 w-32 bg-muted rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            categories.map((category, index) => (
              <Card 
                key={category.id} 
                className="group hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    {getCategoryIcon(category.name)}
                  </div>
                  <h3 className="text-lg font-heading font-bold mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Plans Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Membership Plans</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose the perfect plan for your fitness journey. All plans include access to our main facilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-8 w-20 bg-muted rounded mb-2" />
                  <div className="h-12 w-32 bg-muted rounded" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array(4).fill(0).map((_, j) => (
                    <div key={j} className="h-4 w-full bg-muted rounded" />
                  ))}
                </CardContent>
              </Card>
            ))
          ) : (
            plans.map((plan, index) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden animate-slide-up ${
                  index === 1 ? 'border-primary shadow-xl shadow-primary/20 scale-105' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {index === 1 && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-sm font-semibold py-1">
                    Most Popular
                  </div>
                )}
                <CardHeader className={index === 1 ? 'pt-10' : ''}>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-4xl font-heading font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.billingPeriod}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={index === 1 ? 'hero' : 'outline'} 
                    className="w-full mt-6"
                    onClick={() => navigate('/signup')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-card to-primary/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <CardContent className="relative z-10 p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-heading font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Visit us today and experience our facilities firsthand. Our team will help you find the perfect plan for your fitness goals.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="hero" size="lg" onClick={() => navigate('/plan-visit')}>
                Schedule a Visit
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/signup')}>
                I Have a Contract Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-heading font-bold text-foreground">FitZone</span>
          </div>
          <p className="text-sm">© 2024 FitZone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;
