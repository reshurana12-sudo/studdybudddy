// @ts-nocheck
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Sparkles, ArrowRight, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SearchBar } from "@/components/SearchBar";
import { SortDropdown, type SortOption } from "@/components/SortDropdown";

const Quizzes = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { data: quizzes } = useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("quizzes")
        .select("*, notes(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const sortOptions: SortOption[] = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Title A-Z", value: "title-asc" },
    { label: "Title Z-A", value: "title-desc" },
    { label: "Most Questions", value: "questions-desc" },
  ];

  const filteredQuizzes = useMemo(() => {
    let result = quizzes || [];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((quiz) =>
        quiz.title.toLowerCase().includes(query) ||
        quiz.notes?.title?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "questions-desc":
          const countA = Array.isArray(a.questions) ? a.questions.length : 0;
          const countB = Array.isArray(b.questions) ? b.questions.length : 0;
          return countB - countA;
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [quizzes, searchQuery, sortBy]);

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 p-4 md:p-6">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-purple-600/20 to-pink-500/20 blur-3xl opacity-30 animate-pulse-glow" />
          <div className="relative space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold flex items-center gap-2 md:gap-3 lg:gap-4 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              <FileText className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-purple-500 animate-pulse" />
              My Quizzes
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
              Test your knowledge with AI-generated quizzes
            </p>
          </div>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search quizzes by title or topic..."
              className="w-full"
            />
          </div>
          <SortDropdown
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredQuizzes?.map((quiz) => {
            const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
            return (
              <GlassCard
                key={quiz.id}
                className="group cursor-pointer hover-scale relative overflow-hidden transition-all duration-500 hover:shadow-glow hover:border-purple-500/50 hover:-translate-y-1"
                onClick={() => navigate(`/quizzes/${quiz.id}`)}
              >
                {/* Holographic Glow Effect */}
                <div className="holographic-glow" />
                
                <GlassCardHeader className="relative z-10 p-4 md:p-8">
                  <GlassCardTitle className="flex items-start gap-2 md:gap-3 text-lg md:text-2xl">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-500 shrink-0 mt-1 group-hover:animate-pulse" />
                    <span className="line-clamp-2 text-foreground group-hover:text-purple-500 transition-colors duration-300">{quiz.title}</span>
                  </GlassCardTitle>
                </GlassCardHeader>
                
                <GlassCardContent className="space-y-3 md:space-y-4 relative z-10 p-4 md:p-8 pt-0">
                  {/* Question Count Badge */}
                  <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                    <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500" />
                    <span className="text-xs md:text-sm font-medium text-purple-600">
                      {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5 md:gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span className="hidden sm:inline">{formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}</span>
                      <span className="sm:hidden">{formatDistanceToNow(new Date(quiz.created_at))}</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="gap-1.5 md:gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 text-white transition-all duration-300 hover:scale-105 text-xs md:text-sm h-8 md:h-9 px-3 md:px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/quizzes/${quiz.id}`);
                      }}
                    >
                      <Play className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      Start
                    </Button>
                  </div>
                </GlassCardContent>
              </GlassCard>
            );
          })}

          {/* Empty State */}
          {(!quizzes || quizzes.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 text-center px-4">
              <div className="relative w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse-glow" />
                <GlassCard className="relative p-6 md:p-8 lg:p-12 max-w-lg mx-auto">
                  <div className="space-y-4 md:space-y-6">
                    <div className="relative inline-block">
                      <FileText className="w-16 h-16 md:w-20 md:h-20 text-purple-500 mx-auto animate-pulse" />
                      <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-pink-400 absolute -top-1 -right-1 md:-top-2 md:-right-2 animate-pulse" />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        No quizzes yet
                      </h3>
                      <p className="text-muted-foreground text-sm md:text-base">
                        Create a note and generate a quiz from it to start testing your knowledge!
                      </p>
                    </div>
                    <Button 
                      onClick={() => navigate("/notes")} 
                      className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 text-white mt-2 md:mt-4"
                      size="lg"
                    >
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                      Go to Notes
                    </Button>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Quizzes;
