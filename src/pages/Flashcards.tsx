// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCw, ChevronLeft, ChevronRight, Target, Zap, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const Flashcards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { toast } = useToast();

  const { data: flashcards, refetch } = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateFlashcard = useMutation({
    mutationFn: async ({ id, difficulty }: { id: string; difficulty: "easy" | "medium" | "hard" }) => {
      const card = flashcards?.find((f) => f.id === id);
      if (!card) return;

      let newInterval = card.interval_days;
      let newEaseFactor = card.ease_factor;
      let newRepetitions = card.repetitions;

      if (difficulty === "easy") {
        newInterval = Math.round(card.interval_days * card.ease_factor * 1.3);
        newEaseFactor = Math.min(card.ease_factor + 0.15, 2.5);
        newRepetitions = card.repetitions + 1;
      } else if (difficulty === "medium") {
        newInterval = Math.round(card.interval_days * card.ease_factor);
        newRepetitions = card.repetitions + 1;
      } else {
        newInterval = 1;
        newEaseFactor = Math.max(card.ease_factor - 0.2, 1.3);
        newRepetitions = 0;
      }

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + newInterval);

      const { error } = await supabase
        .from("flashcards")
        .update({
          interval_days: newInterval,
          ease_factor: newEaseFactor,
          repetitions: newRepetitions,
          next_review: nextReview.toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      handleNext();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (flashcards && currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleDifficulty = (difficulty: "easy" | "medium" | "hard") => {
    if (flashcards && flashcards[currentIndex]) {
      updateFlashcard.mutate({ id: flashcards[currentIndex].id, difficulty });
    }
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6 md:space-y-8 p-4 md:p-6">
          {/* Header Section */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 via-teal-500/20 to-emerald-500/20 blur-3xl opacity-30 animate-pulse-glow" />
            <div className="relative space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold flex items-center gap-2 md:gap-3 lg:gap-4 bg-gradient-to-r from-green-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                <Zap className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-green-500 animate-pulse" />
                Flashcards
              </h1>
              <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
                Master concepts with spaced repetition learning
              </p>
            </div>
          </div>

          {/* Empty State */}
          <div className="col-span-full flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 text-center px-4">
            <div className="relative w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-teal-500/20 blur-3xl animate-pulse-glow" />
              <GlassCard className="relative p-6 md:p-8 lg:p-12 max-w-lg mx-auto">
                <div className="space-y-4 md:space-y-6">
                  <div className="relative inline-block">
                    <Zap className="w-16 h-16 md:w-20 md:h-20 text-green-500 mx-auto animate-pulse" />
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-teal-400 absolute -top-1 -right-1 md:-top-2 md:-right-2 animate-pulse" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
                      No flashcards yet
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                      Create a note and generate flashcards from it to start studying with spaced repetition!
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = "/notes"} 
                    className="gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:shadow-lg hover:shadow-green-500/50 text-white mt-2 md:mt-4"
                    size="lg"
                  >
                    <Target className="w-4 h-4 md:w-5 md:h-5" />
                    Go to Notes
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentCard = flashcards[currentIndex];

  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 p-4 sm:p-6 animate-fade-in-up">
        {/* Header with animated gradient glow */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 via-emerald-600/20 to-teal-500/20 blur-3xl opacity-30 animate-pulse-glow" />
          <div className="relative glass rounded-2xl p-4 sm:p-6 border border-border/20 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-500 animate-pulse" />
                  Flashcards
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                  Master your knowledge with spaced repetition
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                  {currentIndex + 1}<span className="text-muted-foreground">/{flashcards.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Cards completed</p>
              </div>
            </div>
          
            {/* Animated Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2.5 sm:h-3 bg-secondary/50 transition-all duration-300 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-emerald-600" />
              <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                <span>{currentIndex + 1} reviewed</span>
                <span>{flashcards.length - currentIndex - 1} remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Flip Card with Holographic Effects */}
        <div className="relative perspective-1000">
          <div 
            className={`flip-card-container ${isFlipped ? 'flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front of Card */}
            <GlassCard className={`flip-card-face flip-card-front absolute inset-0 h-[350px] sm:h-[400px] md:h-[450px] cursor-pointer border-2 border-green-500/20 shadow-lg shadow-green-500/20 transition-all duration-500 hover-scale hover:shadow-green-500/40 hover:border-green-500/40 ${!isFlipped ? 'holographic-glow' : ''}`}>
              <GlassCardContent className="pt-6 w-full h-full flex flex-col items-center justify-center">
                <div className="text-center space-y-4 sm:space-y-6 px-4 sm:px-8">
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-green-600 mb-2 sm:mb-4 animate-pulse">
                    <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium">Click to reveal answer</span>
                  </div>

                  <div className="text-xl sm:text-2xl md:text-3xl font-bold px-2 sm:px-4 leading-relaxed text-foreground group-hover:text-green-600 transition-colors duration-300">
                    {currentCard.front}
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-500/10 border border-green-500/20 transition-all duration-300">
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium text-green-600">Question</span>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Back of Card */}
            <GlassCard className={`flip-card-face flip-card-back absolute inset-0 h-[350px] sm:h-[400px] md:h-[450px] cursor-pointer border-2 border-teal-500/20 shadow-lg shadow-teal-500/20 transition-all duration-500 hover-scale hover:shadow-teal-500/40 hover:border-teal-500/40 ${isFlipped ? 'holographic-glow' : ''}`}>
              <GlassCardContent className="pt-6 w-full h-full flex flex-col items-center justify-center">
                <div className="text-center space-y-4 sm:space-y-6 px-4 sm:px-8">
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-teal-600 mb-2 sm:mb-4">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium">Rate your understanding</span>
                  </div>

                  <div className="text-xl sm:text-2xl md:text-3xl font-bold px-2 sm:px-4 leading-relaxed text-foreground group-hover:text-teal-600 transition-colors duration-300">
                    {currentCard.back}
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-teal-500/10 border border-teal-500/20 transition-all duration-300">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
                    <span className="text-xs sm:text-sm font-medium text-teal-600">Answer</span>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>

        {/* Difficulty Rating Buttons */}
        {isFlipped && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 animate-fade-in">
            <Button
              onClick={() => handleDifficulty("hard")}
              variant="outline"
              size="lg"
              className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 border-2 border-destructive/50 bg-destructive/5 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:scale-105 hover:shadow-glow transition-all duration-300 group"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-destructive animate-pulse" />
                <span className="font-bold text-sm sm:text-lg">Hard</span>
              </div>
              <span className="text-[10px] sm:text-xs opacity-70 group-hover:opacity-100">Review tomorrow</span>
            </Button>
            <Button
              onClick={() => handleDifficulty("medium")}
              variant="outline"
              size="lg"
              className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 border-2 border-accent/50 bg-accent/5 text-accent hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:shadow-glow transition-all duration-300 group"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-accent animate-pulse" />
                <span className="font-bold text-sm sm:text-lg">Medium</span>
              </div>
              <span className="text-[10px] sm:text-xs opacity-70 group-hover:opacity-100">Review in 3 days</span>
            </Button>
            <Button
              onClick={() => handleDifficulty("easy")}
              variant="outline"
              size="lg"
              className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 border-2 border-success/50 bg-success/5 text-success hover:bg-success hover:text-success-foreground hover:scale-105 hover:shadow-glow transition-all duration-300 group"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-success animate-pulse" />
                <span className="font-bold text-sm sm:text-lg">Easy</span>
              </div>
              <span className="text-[10px] sm:text-xs opacity-70 group-hover:opacity-100">Review in a week</span>
            </Button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-1.5 sm:gap-2 glass border-border/50 hover:border-green-500/50 hover:bg-green-500/10 disabled:opacity-30 transition-all duration-300 flex-1 sm:flex-initial hover-scale"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="gap-1.5 sm:gap-2 glass border-border/50 hover:border-green-500/50 hover:bg-green-500/10 disabled:opacity-30 transition-all duration-300 flex-1 sm:flex-initial hover-scale"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Study Progress Stats */}
        <GlassCard className="border-border/20 holographic-glow transition-all duration-300 hover-scale">
          <GlassCardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Learning Progress</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="space-y-0.5 sm:space-y-1 p-2.5 sm:p-4 rounded-lg bg-green-500/5 border border-green-500/20 transition-all duration-300 hover:bg-green-500/10 hover:border-green-500/30">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Repetitions</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{currentCard.repetitions}</p>
              </div>
              <div className="space-y-0.5 sm:space-y-1 p-2.5 sm:p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-500/30">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Next Review</p>
                <p className="text-xs sm:text-sm font-bold text-emerald-600">
                  {new Date(currentCard.next_review).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="space-y-0.5 sm:space-y-1 p-2.5 sm:p-4 rounded-lg bg-teal-500/5 border border-teal-500/20 transition-all duration-300 hover:bg-teal-500/10 hover:border-teal-500/30">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Interval</p>
                <p className="text-xl sm:text-2xl font-bold text-teal-600">{currentCard.interval_days}<span className="text-xs sm:text-sm"> days</span></p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default Flashcards;
