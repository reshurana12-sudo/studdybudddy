import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentNotes } from "@/components/dashboard/RecentNotes";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { StudyStreakTracker } from "@/components/dashboard/StudyStreakTracker";
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";
import { AnalyticsCards } from "@/components/dashboard/AnalyticsCards";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh particles">
        <div className="glass rounded-2xl p-8 shadow-card">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-12 xl:p-16 space-y-6 lg:space-y-8 max-w-7xl mx-auto animate-fade-in-up">
        <WelcomeBanner user={user} />
        
        {/* Original Stats Cards */}
        <StatsCards />
        
        {/* New Analytics Cards */}
        <div className="space-y-1.5 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gradient">Analytics Overview</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Track your learning progress and performance</p>
        </div>
        <AnalyticsCards />
        
        {/* Performance Chart and Streak Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <PerformanceChart />
          <StudyStreakTracker />
        </div>
        
        {/* Recent Notes and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <RecentNotes />
          <AchievementBadges />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
