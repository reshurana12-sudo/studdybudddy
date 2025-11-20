// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Sparkles, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export const RecentNotes = () => {
  const navigate = useNavigate();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["recentNotes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <GlassCard className="group overflow-hidden hover:-translate-y-1 hover:scale-[1.02] hover:shadow-glow-primary transition-all duration-500 ease-out">
      {/* Gradient overlay that reveals on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow border effect */}
      <div className="absolute inset-0 rounded-xl border border-primary/0 group-hover:border-primary/30 transition-all duration-500" />
      <GlassCardHeader className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <GlassCardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span className="truncate">Recent Notes</span>
            </GlassCardTitle>
            <GlassCardDescription className="text-xs sm:text-sm">Your latest study materials</GlassCardDescription>
          </div>
          <Button onClick={() => navigate("/notes")} variant="gradient" size="sm" className="flex-shrink-0 text-xs sm:text-sm">
            <Plus className="mr-0 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">New Note</span>
          </Button>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="pt-2 sm:pt-4 relative z-10">
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 sm:h-20 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group/note relative flex items-start gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-xl border-l-4 border-primary bg-card/50 hover:bg-card cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 ease-out"
                onClick={() => navigate(`/notes/${note.id}`)}
              >
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover/note:bg-primary/20 transition-colors duration-300 flex-shrink-0">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover/note:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold truncate mb-0.5 sm:mb-1 group-hover/note:text-primary transition-colors duration-300">{note.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-1 sm:mb-2">
                    {note.content.substring(0, 100)}...
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="opacity-0 group-hover/note:opacity-100 transition-opacity duration-300 flex-shrink-0">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary animate-glow" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-flex p-3 sm:p-4 rounded-full gradient-accent mb-3 sm:mb-4">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 px-4">No notes yet. Create your first note to get started!</p>
            <Button onClick={() => navigate("/notes")} variant="outline" size="sm">
              <Plus className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Create Note
            </Button>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};
