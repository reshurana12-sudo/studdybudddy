// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

export const PerformanceChart = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["performanceChart"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get data for the last 7 days
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          date: startOfDay(date).toISOString(),
          label: format(date, "EEE"),
        };
      });

      // Fetch quiz attempts for the last 7 days
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user.id)
        .gte("completed_at", days[0].date) as any;

      // Fetch flashcard reviews for the last 7 days
      const { data: flashcards } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", days[0].date) as any;

      // Fetch notes for the last 7 days
      const { data: notes } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", days[0].date) as any;

      // Calculate daily stats
      const stats = days.map((day) => {
        const dayAttempts = attempts?.filter(
          (a) => startOfDay(new Date(a.completed_at)).toISOString() === day.date
        ) || [];
        
        const dayFlashcards = flashcards?.filter(
          (f) => startOfDay(new Date(f.created_at)).toISOString() === day.date
        ) || [];
        
        const dayNotes = notes?.filter(
          (n) => startOfDay(new Date(n.created_at)).toISOString() === day.date
        ) || [];

        const avgScore = dayAttempts.length > 0
          ? dayAttempts.reduce((sum, a) => sum + (a.score / a.total_questions) * 100, 0) / dayAttempts.length
          : 0;

        return {
          day: day.label,
          "Quiz Score": Math.round(avgScore),
          "Flashcards": dayFlashcards.length,
          "Notes": dayNotes.length,
          "Study Sessions": dayAttempts.length,
        };
      });

      return stats;
    },
  });

  return (
    <GlassCard className="lg:col-span-2 group overflow-hidden hover:-translate-y-1 hover:scale-[1.02] hover:shadow-glow-primary transition-all duration-500 ease-out">
      {/* Gradient overlay that reveals on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-500/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow border effect */}
      <div className="absolute inset-0 rounded-xl border border-primary/0 group-hover:border-primary/30 transition-all duration-500" />
      <GlassCardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <GlassCardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Performance Analytics
            </GlassCardTitle>
            <GlassCardDescription className="text-xs sm:text-sm">Your study activity over the last 7 days</GlassCardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-success">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="font-semibold">Trending Up</span>
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="pt-2 sm:pt-4 relative z-10">
        {isLoading ? (
          <div className="h-[200px] sm:h-[300px] bg-muted/30 animate-pulse rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFlashcards" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 70%, 54%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(142, 70%, 54%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  padding: '0.5rem'
                }}
                itemStyle={{ fontSize: '0.75rem' }}
                labelStyle={{ fontSize: '0.75rem', fontWeight: 600 }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '0.75rem' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="Quiz Score"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                fill="url(#colorScore)"
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="Flashcards"
                stroke="hsl(262, 83%, 58%)"
                strokeWidth={2}
                fill="url(#colorFlashcards)"
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="Notes"
                stroke="hsl(142, 70%, 54%)"
                strokeWidth={2}
                fill="url(#colorNotes)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};