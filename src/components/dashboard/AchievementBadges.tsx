// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Trophy, Award, Star, Zap, BookOpen, Brain, Target, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  unlocked: boolean;
  progress?: number;
  requirement: number;
}

export const AchievementBadges = () => {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch user stats
      const [notesRes, quizzesRes, flashcardsRes, attemptsRes, profileRes] = await Promise.all([
        supabase.from("notes").select("*", { count: "exact" }).eq("user_id", user.id) as any,
        supabase.from("quizzes").select("*", { count: "exact" }).eq("user_id", user.id) as any,
        supabase.from("flashcards").select("*", { count: "exact" }).eq("user_id", user.id) as any,
        supabase.from("quiz_attempts").select("*").eq("user_id", user.id) as any,
        supabase.from("profiles").select("*").eq("user_id", user.id).single() as any,
      ]);

      const notesCount = notesRes.count || 0;
      const quizzesCount = quizzesRes.count || 0;
      const flashcardsCount = flashcardsRes.count || 0;
      const attemptsCount = attemptsRes.data?.length || 0;
      const streakDays = profileRes.data?.streak_days || 0;

      // Calculate average quiz score
      const avgScore = attemptsRes.data && attemptsRes.data.length > 0
        ? attemptsRes.data.reduce((sum, a) => sum + (a.score / a.total_questions) * 100, 0) / attemptsRes.data.length
        : 0;

      const achievementsList: Achievement[] = [
        {
          id: "first_note",
          title: "First Steps",
          description: "Create your first note",
          icon: BookOpen,
          color: "text-blue-500",
          gradient: "from-blue-500 to-cyan-500",
          unlocked: notesCount >= 1,
          progress: notesCount,
          requirement: 1,
        },
        {
          id: "note_master",
          title: "Note Master",
          description: "Create 10 notes",
          icon: Star,
          color: "text-yellow-500",
          gradient: "from-yellow-500 to-orange-500",
          unlocked: notesCount >= 10,
          progress: notesCount,
          requirement: 10,
        },
        {
          id: "quiz_champion",
          title: "Quiz Champion",
          description: "Complete 20 quizzes",
          icon: Trophy,
          color: "text-purple-500",
          gradient: "from-purple-500 to-pink-500",
          unlocked: attemptsCount >= 20,
          progress: attemptsCount,
          requirement: 20,
        },
        {
          id: "perfect_score",
          title: "Perfectionist",
          description: "Maintain 90%+ average score",
          icon: Crown,
          color: "text-amber-500",
          gradient: "from-amber-500 to-yellow-500",
          unlocked: avgScore >= 90,
          progress: Math.round(avgScore),
          requirement: 90,
        },
        {
          id: "flashcard_enthusiast",
          title: "Card Collector",
          description: "Generate 50 flashcards",
          icon: Zap,
          color: "text-green-500",
          gradient: "from-green-500 to-emerald-500",
          unlocked: flashcardsCount >= 50,
          progress: flashcardsCount,
          requirement: 50,
        },
        {
          id: "streak_master",
          title: "Streak Master",
          description: "Maintain a 7-day streak",
          icon: Target,
          color: "text-orange-500",
          gradient: "from-orange-500 to-red-500",
          unlocked: streakDays >= 7,
          progress: streakDays,
          requirement: 7,
        },
        {
          id: "knowledge_seeker",
          title: "Knowledge Seeker",
          description: "Study for 5 consecutive days",
          icon: Brain,
          color: "text-indigo-500",
          gradient: "from-indigo-500 to-purple-500",
          unlocked: streakDays >= 5,
          progress: streakDays,
          requirement: 5,
        },
        {
          id: "dedicated_learner",
          title: "Dedicated Learner",
          description: "Create 5 quizzes",
          icon: Award,
          color: "text-rose-500",
          gradient: "from-rose-500 to-pink-500",
          unlocked: quizzesCount >= 5,
          progress: quizzesCount,
          requirement: 5,
        },
      ];

      return achievementsList;
    },
  });

  const unlockedCount = achievements?.filter((a) => a.unlocked).length || 0;
  const totalCount = achievements?.length || 0;

  return (
    <GlassCard className="transition-all duration-300 hover:border-success/20">
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <GlassCardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              Achievements
            </GlassCardTitle>
            <GlassCardDescription className="text-xs sm:text-sm">
              {unlockedCount} of {totalCount} unlocked
            </GlassCardDescription>
          </div>
          <Badge variant="secondary" className="text-xs sm:text-sm font-semibold">
            {Math.round((unlockedCount / totalCount) * 100)}%
          </Badge>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="pt-2 sm:pt-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 sm:h-24 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {achievements?.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`relative p-3 sm:p-4 rounded-xl border transition-all duration-300 hover-lift ${
                    achievement.unlocked
                      ? "bg-card border-border shadow-card hover:shadow-glow"
                      : "bg-muted/30 border-muted opacity-60 hover:opacity-80"
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${achievement.gradient} opacity-0 ${
                      achievement.unlocked ? "opacity-5" : ""
                    } rounded-xl transition-opacity duration-300`}
                  />
                  <div className="relative">
                    <div
                      className={`inline-flex p-1.5 sm:p-2 rounded-lg mb-1.5 sm:mb-2 transition-all duration-300 ${
                        achievement.unlocked
                          ? `bg-gradient-to-br ${achievement.gradient} shadow-glow hover:scale-110`
                          : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          achievement.unlocked ? "text-white" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <h4 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-1">{achievement.title}</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 line-clamp-2">
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <div className="text-[10px] sm:text-xs font-medium text-primary">
                        {achievement.progress}/{achievement.requirement}
                      </div>
                    )}
                    {achievement.unlocked && (
                      <div className="text-[10px] sm:text-xs font-medium text-success flex items-center gap-1">
                        <span>✓</span> Unlocked
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};