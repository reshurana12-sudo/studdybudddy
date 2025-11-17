// @ts-nocheck
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Flame } from "lucide-react";

interface DashboardHeaderProps {
  user: User;
}

export const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold">
        Welcome back, {profile?.display_name || "Student"}! 👋
      </h1>
      <p className="text-muted-foreground">
        Ready to continue your learning journey?
      </p>
      
      <div className="flex gap-4 pt-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20">
          <Trophy className="w-5 h-5 text-accent" />
          <div>
            <p className="text-sm font-medium">{profile?.points || 0} Points</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <Flame className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-sm font-medium">{profile?.streak_days || 0} Day Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
};
