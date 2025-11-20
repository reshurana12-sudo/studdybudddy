// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Clock, BarChart3, CheckCircle2, TrendingUp } from "lucide-react";
import { differenceInDays, differenceInHours } from "date-fns";

export const AnalyticsCards = () => {
  const { data: analytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const [notesRes, attemptsRes, flashcardsRes] = await Promise.all([
        supabase.from("notes").select("*").eq("user_id", user.id) as any,
        supabase.from("quiz_attempts").select("*").eq("user_id", user.id) as any,
        supabase.from("flashcards").select("*").eq("user_id", user.id) as any,
      ]);

      const notes = notesRes.data || [];
      const attempts = attemptsRes.data || [];
      const flashcards = flashcardsRes.data || [];

      // Calculate learning velocity (notes created per week)
      const oldestNote = notes.length > 0 
        ? new Date(Math.min(...notes.map(n => new Date(n.created_at).getTime())))
        : new Date();
      const daysSinceStart = Math.max(differenceInDays(new Date(), oldestNote), 1);
      const weeksSinceStart = Math.max(daysSinceStart / 7, 1);
      const learningVelocity = notes.length / weeksSinceStart;

      // Calculate retention rate (average quiz score)
      const retentionRate = attempts.length > 0
        ? (attempts.reduce((sum, a) => sum + (a.score / a.total_questions) * 100, 0) / attempts.length)
        : 0;

      // Calculate time spent studying (estimate based on quiz attempts)
      // Assume avg 2 minutes per quiz question
      const totalQuestions = attempts.reduce((sum, a) => sum + a.total_questions, 0);
      const studyMinutes = totalQuestions * 2;
      const studyHours = Math.round(studyMinutes / 60);

      // Calculate completion rate
      const totalQuizzes = attempts.length;
      const completedQuizzes = attempts.filter(a => a.score > 0).length;
      const completionRate = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;

      return {
        learningVelocity: learningVelocity.toFixed(1),
        retentionRate: Math.round(retentionRate),
        studyHours,
        completionRate: Math.round(completionRate),
      };
    },
  });

  const cards = [
    {
      title: "Learning Velocity",
      value: `${analytics?.learningVelocity || 0}`,
      unit: "notes/week",
      icon: TrendingUp,
      gradient: "from-emerald-500 via-green-600 to-teal-500",
      description: "Your study pace",
    },
    {
      title: "Retention Rate",
      value: `${analytics?.retentionRate || 0}%`,
      unit: "",
      icon: BarChart3,
      gradient: "from-violet-500 via-purple-600 to-indigo-500",
      description: "Average quiz performance",
    },
    {
      title: "Study Time",
      value: `${analytics?.studyHours || 0}`,
      unit: "hours",
      icon: Clock,
      gradient: "from-amber-500 via-orange-600 to-red-500",
      description: "Total time invested",
    },
    {
      title: "Completion Rate",
      value: `${analytics?.completionRate || 0}%`,
      unit: "",
      icon: CheckCircle2,
      gradient: "from-cyan-500 via-blue-600 to-indigo-500",
      description: "Quizzes completed",
    },
  ];

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <GlassCard 
            key={card.title} 
            className="relative overflow-hidden group hover:-translate-y-1 hover:scale-[1.02] animate-slide-up transition-all duration-500 ease-out" 
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {/* Gradient overlay that reveals on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-15 transition-opacity duration-500`} />
            
            {/* Glow border effect */}
            <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-primary/30 transition-all duration-500" />
            
            {/* Shadow glow effect */}
            <div className="absolute inset-0 shadow-none group-hover:shadow-glow-primary transition-shadow duration-500" />
            <div className="relative p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground block mb-1">
                    {card.title}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient">
                      {card.value}
                    </span>
                    {card.unit && (
                      <span className="text-xs sm:text-sm text-muted-foreground ml-1">{card.unit}</span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">{card.description}</p>
                </div>
                <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-glow group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};