// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { BookOpen, FileText, Sparkles, TrendingUp } from "lucide-react";

export const StatsCards = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const [notesCount, quizzesCount, flashcardsCount, attemptsCount] = await Promise.all([
        supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quizzes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("flashcards").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quiz_attempts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      return {
        notes: notesCount.count || 0,
        quizzes: quizzesCount.count || 0,
        flashcards: flashcardsCount.count || 0,
        attempts: attemptsCount.count || 0,
      };
    },
  });

  const cards = [
    {
      title: "Total Notes",
      value: stats?.notes || 0,
      icon: BookOpen,
      gradient: "from-blue-500 via-blue-600 to-cyan-500",
    },
    {
      title: "Quizzes Created",
      value: stats?.quizzes || 0,
      icon: FileText,
      gradient: "from-purple-500 via-purple-600 to-pink-500",
    },
    {
      title: "Flashcards",
      value: stats?.flashcards || 0,
      icon: Sparkles,
      gradient: "from-green-500 via-emerald-600 to-teal-500",
    },
    {
      title: "Quiz Attempts",
      value: stats?.attempts || 0,
      icon: TrendingUp,
      gradient: "from-orange-500 via-red-500 to-rose-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <GlassCard 
          key={card.title} 
          className="card-hover-dashboard relative overflow-hidden group animate-slide-up" 
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="relative p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">{card.title}</span>
              <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-glow transition-all duration-300 group-hover:scale-110`}>
                <card.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient">{card.value}</div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};
