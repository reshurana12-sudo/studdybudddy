// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Flame, Target, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { differenceInDays, startOfDay } from "date-fns";

export const StudyStreakTracker = () => {
  const { data: streakData, isLoading } = useQuery({
    queryKey: ["studyStreak"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single() as any;

      // Get all quiz attempts to calculate streak
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false }) as any;

      // Calculate current streak
      let currentStreak = 0;
      if (attempts && attempts.length > 0) {
        const today = startOfDay(new Date());
        const dates = new Set(
          attempts.map((a) => startOfDay(new Date(a.completed_at)).toISOString())
        );

        let checkDate = today;
        while (dates.has(checkDate.toISOString())) {
          currentStreak++;
          checkDate = new Date(checkDate);
          checkDate.setDate(checkDate.getDate() - 1);
          checkDate = startOfDay(checkDate);
        }
      }

      // Calculate today's goal progress
      const todayAttempts = attempts?.filter(
        (a) => differenceInDays(new Date(), new Date(a.completed_at)) === 0
      ).length || 0;

      const dailyGoal = 3; // Target: 3 study sessions per day
      const goalProgress = Math.min((todayAttempts / dailyGoal) * 100, 100);

      return {
        currentStreak,
        longestStreak: profile?.streak_days || 0,
        todayProgress: goalProgress,
        todaySessions: todayAttempts,
        dailyGoal,
        totalPoints: profile?.points || 0,
      };
    },
  });

  return (
    <GlassCard className="group overflow-hidden hover:-translate-y-1 hover:scale-[1.02] hover:shadow-glow-primary transition-all duration-500 ease-out">
      {/* Gradient overlay that reveals on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-accent/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow border effect */}
      <div className="absolute inset-0 rounded-xl border border-accent/0 group-hover:border-accent/30 transition-all duration-500" />
      <GlassCardHeader className="relative z-10">
        <GlassCardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          Study Streak
        </GlassCardTitle>
        <GlassCardDescription className="text-xs sm:text-sm">Keep your momentum going!</GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent className="pt-2 sm:pt-4 relative z-10">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-20 sm:h-24 bg-muted/30 animate-pulse rounded-lg" />
            <div className="h-16 sm:h-20 bg-muted/30 animate-pulse rounded-lg" />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Current Streak Display */}
            <div className="relative p-4 sm:p-6 rounded-2xl gradient-primary text-white overflow-hidden transition-all duration-300 hover:shadow-glow-primary">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full blur-3xl animate-float" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium opacity-90">Current Streak</span>
                  <Flame className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-4xl sm:text-5xl font-bold">{streakData?.currentStreak || 0}</span>
                  <span className="text-base sm:text-lg opacity-90">days</span>
                </div>
                <div className="mt-2 sm:mt-3 text-xs sm:text-sm opacity-75">
                  Longest: {streakData?.longestStreak || 0} days
                </div>
              </div>
            </div>

            {/* Daily Goal Progress */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-xs sm:text-sm font-medium">Today's Goal</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-primary">
                  {streakData?.todaySessions || 0}/{streakData?.dailyGoal || 3}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={streakData?.todayProgress || 0} 
                  className="h-2 sm:h-3 transition-all duration-300" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-bold text-primary-foreground/80">
                    {Math.round(streakData?.todayProgress || 0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Total Points */}
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 transition-all duration-300 hover:bg-accent/15">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                <span className="text-xs sm:text-sm font-medium">Total Points</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gradient">{streakData?.totalPoints || 0}</span>
            </div>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};