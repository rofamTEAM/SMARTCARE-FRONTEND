import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Star, TrendingUp, Award, Target, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { staffApi } from '../utils/api';
import { staffApi } from '../utils/api';
  id: string;
  staffId: string;
  staffName: string;
  reviewPeriod: string;
  overallRating: number;
  categories: {
    technical: number;
    communication: number;
    teamwork: number;
    punctuality: number;
    initiative: number;
  };
  goals: string[];
  achievements: string[];
  feedback: string;
  reviewedBy: string;
  reviewDate: string;
  status: 'Draft' | 'Completed' | 'Approved';
}

interface Goal {
  id: string;
  staffId: string;
  staffName: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  progress: number;
  createdDate: string;
}

export function PerformanceManagement({ session }: { session: any }) {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'reviews' | 'goals'>('reviews');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [reviewFormData, setReviewFormData] = useState<Partial<PerformanceReview>>({});
  const [goalFormData, setGoalFormData] = useState<Partial<Goal>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reviewsData, goalsData, staffData] = await Promise.allSettled([
        staffApi.getAll('type=performance_reviews'),
        staffApi.getAll('type=goals'),
        staffApi.getAll(),
      ]);
      if (reviewsData.status === 'fulfilled') setReviews(reviewsData.value || []);
      if (goalsData.status === 'fulfilled') setGoals(goalsData.value || []);
      if (staffData.status === 'fulfilled') setStaff(staffData.value || []);
    } catch (error) {
      setReviews([]); setGoals([]); setStaff([]);
    }
  };

  const handleAddReview = () => {
    if (!reviewFormData.staffId || !reviewFormData.reviewPeriod) {
      toast.error('Please fill in required fields');
      return;
    }

    const selectedStaff = staff.find(s => s.id === reviewFormData.staffId);
    const categories = reviewFormData.categories || {
      technical: 0,
      communication: 0,
      teamwork: 0,
      punctuality: 0,
      initiative: 0
    };
    
    const overallRating = Object.values(categories).reduce((sum, rating) => sum + rating, 0) / 5;

    const newReview: PerformanceReview = {
      id: Date.now().toString(),
      staffId: reviewFormData.staffId!,
      staffName: selectedStaff?.name || '',
      reviewPeriod: reviewFormData.reviewPeriod!,
      overallRating,
      categories,
      goals: reviewFormData.goals || [],
      achievements: reviewFormData.achievements || [],
      feedback: reviewFormData.feedback || '',
      reviewedBy: session?.user?.user_metadata?.name || 'Admin',
      reviewDate: new Date().toISOString().split('T')[0],
      status: 'Draft'
    };

    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    await staffApi.create({ ...newReview, type: 'performance_review' }).catch(() => {});
    
    setReviewFormData({});
    setIsReviewModalOpen(false);
    toast.success('Performance review created successfully!');
  };

  const handleAddGoal = () => {
    if (!goalFormData.staffId || !goalFormData.title || !goalFormData.targetDate) {
      toast.error('Please fill in required fields');
      return;
    }

    const selectedStaff = staff.find(s => s.id === goalFormData.staffId);
    const newGoal: Goal = {
      id: Date.now().toString(),
      staffId: goalFormData.staffId!,
      staffName: selectedStaff?.name || '',
      title: goalFormData.title!,
      description: goalFormData.description || '',
      targetDate: goalFormData.targetDate!,
      status: 'Not Started',
      progress: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    await staffApi.create({ ...newGoal, type: 'goal' }).catch(() => {});
    
    setGoalFormData({});
    setIsGoalModalOpen(false);
    toast.success('Goal created successfully!');
  };

  const updateGoalProgress = (goalId: string, progress: number, status: Goal['status']) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { ...goal, progress, status } : goal
    );
    setGoals(updatedGoals);
    await staffApi.update(goalId, { progress, status, type: 'goal' }).catch(() => {});
    toast.success('Goal progress updated!');
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-primary';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-primary';
      case 'In Progress': return 'bg-blue-100 text-primary';
      case 'Overdue': return 'bg-red-100 text-destructive';
      default: return 'bg-muted text-foreground';
    }
  };

  const filteredReviews = reviews.filter(review =>
    review.staffName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGoals = goals.filter(goal =>
    goal.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 mb-2">Performance Management</h2>
            <p className="text-muted-foreground text-sm">Track employee performance and goals</p>
          </div>
        </div>

        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === 'reviews' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reviews')}
          >
            <Star className="size-4 mr-2" />
            Performance Reviews
          </Button>
          <Button
            variant={activeTab === 'goals' ? 'default' : 'outline'}
            onClick={() => setActiveTab('goals')}
          >
            <Target className="size-4 mr-2" />
            Goals & Objectives
          </Button>
        </div>

        {activeTab === 'reviews' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Performance Reviews</CardTitle>
                <div className="flex items-center gap-4">
                  <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="size-4 mr-2" />
                        New Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create Performance Review</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Staff Member *</Label>
                            <select
                              value={reviewFormData.staffId || ''}
                              onChange={(e) => setReviewFormData({ ...reviewFormData, staffId: e.target.value })}
                              className="w-full px-3 py-2 border border-border rounded-md"
                            >
                              <option value="">Select staff member</option>
                              {staff.map(member => (
                                <option key={member.id} value={member.id}>{member.name} - {member.role}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Review Period *</Label>
                            <Input
                              value={reviewFormData.reviewPeriod || ''}
                              onChange={(e) => setReviewFormData({ ...reviewFormData, reviewPeriod: e.target.value })}
                              placeholder="e.g., Q1 2024"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <Label>Performance Ratings (1-5 scale)</Label>
                          {['technical', 'communication', 'teamwork', 'punctuality', 'initiative'].map((category) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="capitalize">{category}:</span>
                              <select
                                value={reviewFormData.categories?.[category as keyof typeof reviewFormData.categories] || 0}
                                onChange={(e) => setReviewFormData({
                                  ...reviewFormData,
                                  categories: {
                                    ...reviewFormData.categories,
                                    [category]: parseInt(e.target.value)
                                  } as any
                                })}
                                className="px-3 py-1 border border-border rounded-md"
                              >
                                <option value={0}>Select Rating</option>
                                <option value={1}>1 - Poor</option>
                                <option value={2}>2 - Below Average</option>
                                <option value={3}>3 - Average</option>
                                <option value={4}>4 - Good</option>
                                <option value={5}>5 - Excellent</option>
                              </select>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <Label>Feedback</Label>
                          <textarea
                            value={reviewFormData.feedback || ''}
                            onChange={(e) => setReviewFormData({ ...reviewFormData, feedback: e.target.value })}
                            placeholder="Detailed feedback and comments"
                            className="w-full px-3 py-2 border border-border rounded-md"
                            rows={4}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddReview}>Create Review</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="size-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">{review.staffName}</h3>
                          <p className="text-sm text-muted-foreground">{review.reviewPeriod}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRatingColor(review.overallRating)}`}>
                          {review.overallRating.toFixed(1)}
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`size-3 ${
                                star <= review.overallRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Reviewed by: {review.reviewedBy}</p>
                      <p>Date: {review.reviewDate}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        review.status === 'Completed' ? 'bg-green-100 text-primary' :
                        review.status === 'Approved' ? 'bg-blue-100 text-primary' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'goals' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Goals & Objectives</CardTitle>
                <div className="flex items-center gap-4">
                  <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="size-4 mr-2" />
                        New Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Goal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Staff Member *</Label>
                          <select
                            value={goalFormData.staffId || ''}
                            onChange={(e) => setGoalFormData({ ...goalFormData, staffId: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md"
                          >
                            <option value="">Select staff member</option>
                            {staff.map(member => (
                              <option key={member.id} value={member.id}>{member.name} - {member.role}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Goal Title *</Label>
                          <Input
                            value={goalFormData.title || ''}
                            onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })}
                            placeholder="Enter goal title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <textarea
                            value={goalFormData.description || ''}
                            onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
                            placeholder="Detailed description of the goal"
                            className="w-full px-3 py-2 border border-border rounded-md"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Target Date *</Label>
                          <Input
                            type="date"
                            value={goalFormData.targetDate || ''}
                            onChange={(e) => setGoalFormData({ ...goalFormData, targetDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsGoalModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddGoal}>Create Goal</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      placeholder="Search goals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredGoals.map((goal) => (
                  <div key={goal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">{goal.staffName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-3">{goal.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Target: {goal.targetDate}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{goal.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

