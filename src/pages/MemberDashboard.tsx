import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSchedule, getCategories } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, LogOut, Calendar, Clock, User, Tag, Filter, Loader2, MapPin } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: string;
  room?: string;
  coach: {
    name: string;
    specialties: string[];
  };
}

interface Category {
  id: string;
  name: string;
}

const DAYS_OF_WEEK = [
  { value: '', label: 'All Days' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const MemberDashboard = () => {
  const navigate = useNavigate();
  const { user, subscription, plan, logout } = useAuth();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  
  const [dayFilter, setDayFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data || []);
      } catch (error) {
        // Set demo categories
        setCategories([
          { id: '1', name: 'CrossFit' },
          { id: '2', name: 'Pool' },
          { id: '3', name: 'Yoga' },
          { id: '4', name: 'HIIT' },
        ]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      setScheduleLoading(true);
      try {
        const params: { dayOfWeek?: string; category?: string } = {};
        if (dayFilter) params.dayOfWeek = dayFilter;
        if (categoryFilter) params.category = categoryFilter;
        
        const response = await getSchedule(params);
        setSessions(response.data || []);
      } catch (error) {
        // Set demo sessions
        setSessions([
          {
            id: '1',
            title: 'Morning CrossFit',
            startTime: '06:00',
            endTime: '07:00',
            category: 'CrossFit',
            room: 'Studio A',
            coach: { name: 'John Smith', specialties: ['CrossFit', 'HIIT'] },
          },
          {
            id: '2',
            title: 'Power Yoga',
            startTime: '08:00',
            endTime: '09:00',
            category: 'Yoga',
            room: 'Studio B',
            coach: { name: 'Sarah Johnson', specialties: ['Yoga', 'Meditation'] },
          },
          {
            id: '3',
            title: 'Lap Swimming',
            startTime: '10:00',
            endTime: '11:00',
            category: 'Pool',
            coach: { name: 'Mike Davis', specialties: ['Swimming', 'Water Aerobics'] },
          },
          {
            id: '4',
            title: 'Afternoon HIIT',
            startTime: '17:00',
            endTime: '18:00',
            category: 'HIIT',
            room: 'Main Floor',
            coach: { name: 'Emily Brown', specialties: ['HIIT', 'Cardio'] },
          },
        ]);
      } finally {
        setLoading(false);
        setScheduleLoading(false);
      }
    };

    fetchSchedule();
  }, [dayFilter, categoryFilter]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-success/20 text-success';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'EXPIRED':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-heading font-bold">FitZone</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, <span className="text-foreground font-medium">{user?.firstName}</span>
            </span>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Member Dashboard</h1>
          <p className="text-muted-foreground">
            View your subscription details and browse upcoming sessions.
          </p>
        </div>

        {/* Subscription Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Subscription Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Plan</p>
                <p className="font-heading font-bold text-lg">
                  {plan?.name || 'Pro Membership'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription?.status || 'ACTIVE')}`}>
                  {subscription?.status || 'ACTIVE'}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                <p className="font-medium">
                  {subscription?.startDate ? formatDate(subscription.startDate) : 'Jan 1, 2024'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">End Date</p>
                <p className="font-medium">
                  {subscription?.endDate ? formatDate(subscription.endDate) : 'Dec 31, 2024'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Class Schedule
                </CardTitle>
                <CardDescription>
                  Browse and filter upcoming classes and sessions.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filters:</span>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mt-4">
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="flex h-10 rounded-lg border border-border bg-secondary/50 px-4 py-2 text-sm text-foreground ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary"
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex h-10 rounded-lg border border-border bg-secondary/50 px-4 py-2 text-sm text-foreground ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          
          <CardContent>
            {scheduleLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sessions found for the selected filters.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-heading font-bold text-lg">{session.title}</h3>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                            {session.category}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {session.startTime} - {session.endTime}
                          </span>
                          {session.room && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              {session.room}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:text-right">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{session.coach.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {session.coach.specialties.map((specialty, i) => (
                              <span 
                                key={i} 
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                              >
                                <Tag className="h-3 w-3" />
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MemberDashboard;
