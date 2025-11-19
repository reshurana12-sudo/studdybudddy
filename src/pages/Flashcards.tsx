// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RotateCw, Target, Zap, CheckCircle, Brain, Clock, TrendingUp, BookOpen, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SearchBar } from "@/components/SearchBar";
import { SortDropdown, type SortOption } from "@/components/SortDropdown";
import { formatDistanceToNow } from "date-fns";

const Flashcards = () => {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: flashcards, refetch } = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("flashcards")
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
    { label: "Next Review", value: "review-asc" },
    { label: "Most Mastered", value: "mastery-desc" },
    { label: "Title A-Z", value: "title-asc" },
  ];

  // Group flashcards by note
  const flashcardDecks = useMemo(() => {
    if (!flashcards) return [];
    
    const grouped = flashcards.reduce((acc, card) => {
      const deckId = card.note_id || 'standalone';
      const deckTitle = card.notes?.title || 'Standalone Flashcards';
      
      if (!acc[deckId]) {
        acc[deckId] = {
          id: deckId,
          title: deckTitle,
          cards: [],
          nextReview: new Date(card.next_review),
          totalRepetitions: 0,
          avgEaseFactor: 0,
        };
      }
      
      acc[deckId].cards.push(card);
      acc[deckId].totalRepetitions += card.repetitions || 0;
      acc[deckId].avgEaseFactor += card.ease_factor || 0;
      
      if (new Date(card.next_review) < acc[deckId].nextReview) {
        acc[deckId].nextReview = new Date(card.next_review);
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped).map((deck: any) => ({
      ...deck,
      avgEaseFactor: deck.avgEaseFactor / deck.cards.length,
    }));
  }, [flashcards]);

  const filteredDecks = useMemo(() => {
    let result = flashcardDecks || [];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((deck) =>
        deck.title.toLowerCase().includes(query) ||
        deck.cards.some((card: any) =>
          card.front.toLowerCase().includes(query) ||
          card.back.toLowerCase().includes(query)
        )
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.cards[0].created_at).getTime() - new Date(b.cards[0].created_at).getTime();
        case "review-asc":
          return a.nextReview.getTime() - b.nextReview.getTime();
        case "mastery-desc":
          return b.avgEaseFactor - a.avgEaseFactor;
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "newest":
        default:
          return new Date(b.cards[0].created_at).getTime() - new Date(a.cards[0].created_at).getTime();
      }
    });

    return result;
  }, [flashcardDecks, searchQuery, sortBy]);

  if (!flashcards || flashcards.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6 md:space-y-8 p-4 md:p-6">
          {/* Header Section */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-cyan-500/20 blur-3xl opacity-30 animate-pulse-glow" />
            <div className="relative space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold flex items-center gap-2 md:gap-3 lg:gap-4 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                <Brain className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-teal-500 animate-pulse" />
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
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 blur-3xl animate-pulse-glow" />
              <GlassCard className="relative p-6 md:p-8 lg:p-12 max-w-lg mx-auto">
                <div className="space-y-4 md:space-y-6">
                  <div className="relative inline-block">
                    <Brain className="w-16 h-16 md:w-20 md:h-20 text-teal-500 mx-auto animate-pulse" />
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-emerald-400 absolute -top-1 -right-1 md:-top-2 md:-right-2 animate-pulse" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                      No flashcards yet
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                      Create a note and generate flashcards from it to start studying with spaced repetition!
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate("/notes")} 
                    className="gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:shadow-lg hover:shadow-teal-500/50 text-white mt-2 md:mt-4"
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

  if (selectedDeck) {
    const deck = filteredDecks.find((d) => d.id === selectedDeck);
    if (!deck) {
      setSelectedDeck(null);
      return null;
    }

    return (
      <DashboardLayout>
        <div className="space-y-6 md:space-y-8 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setSelectedDeck(null)}
              className="gap-2"
            >
              ← Back to Decks
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{deck.title}</h2>
              <p className="text-sm text-muted-foreground">{deck.cards.length} cards</p>
            </div>
          </div>

          {/* Study View Component - Keep existing study interface here */}
          <div className="text-center p-12">
            <p className="text-muted-foreground">Study interface will be integrated here</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 p-4 md:p-6 animate-fade-in-up">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-cyan-500/20 blur-3xl opacity-30 animate-pulse-glow" />
          <div className="relative space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold flex items-center gap-2 md:gap-3 lg:gap-4 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              <Brain className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-teal-500 animate-pulse" />
              Flashcard Decks
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
              Master concepts with spaced repetition learning
            </p>
          </div>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search flashcard decks..."
              className="w-full"
            />
          </div>
          <SortDropdown
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-transparent hover-scale transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-500" />
                Total Decks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-500">{filteredDecks.length}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent hover-scale transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                Total Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {flashcards?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent hover-scale transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                Avg Mastery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-500">
                {filteredDecks.length > 0
                  ? Math.round(
                      (filteredDecks.reduce((acc, d) => acc + d.avgEaseFactor, 0) /
                        filteredDecks.length) *
                        100
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flashcard Decks Grid */}
        {filteredDecks.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <GlassCard className="p-8 max-w-md">
              <Brain className="w-16 h-16 text-teal-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No decks found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or create new flashcards from your notes
              </p>
            </GlassCard>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredDecks.map((deck) => (
              <GlassCard
                key={deck.id}
                className="group cursor-pointer border-teal-500/10 hover:border-teal-500/30 transition-all duration-300 hover-scale hover:shadow-lg hover:shadow-teal-500/10"
                onClick={() => setSelectedDeck(deck.id)}
              >
                <GlassCardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <GlassCardTitle className="text-lg font-bold group-hover:text-teal-500 transition-colors line-clamp-2">
                      {deck.title}
                    </GlassCardTitle>
                    <Badge
                      variant="outline"
                      className="bg-teal-500/10 text-teal-600 border-teal-500/20 shrink-0"
                    >
                      {deck.cards.length} cards
                    </Badge>
                  </div>
                </GlassCardHeader>

                <GlassCardContent className="space-y-4">
                  {/* Progress Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <RotateCw className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Reviews</span>
                      </div>
                      <p className="text-xl font-bold text-emerald-600">
                        {deck.totalRepetitions}
                      </p>
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                      <div className="flex items-center gap-1.5 text-cyan-600">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Mastery</span>
                      </div>
                      <p className="text-xl font-bold text-cyan-600">
                        {Math.round(deck.avgEaseFactor * 100)}%
                      </p>
                    </div>
                  </div>

                  {/* Next Review */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/30 border border-border/50">
                    <Clock className="w-4 h-4 text-teal-500" />
                    <span className="font-medium">Next review:</span>
                    <span className="text-foreground">
                      {formatDistanceToNow(deck.nextReview, { addSuffix: true })}
                    </span>
                  </div>

                  {/* Study Button */}
                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDeck(deck.id);
                    }}
                  >
                    <Play className="w-4 h-4" />
                    Start Studying
                  </Button>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Create Flashcards CTA */}
        <div className="mt-8">
          <GlassCard className="border-teal-500/20 bg-gradient-to-r from-teal-500/5 via-emerald-500/5 to-cyan-500/5">
            <GlassCardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Create More Flashcards</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate AI-powered flashcards from your notes
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/notes")}
                  className="gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/20"
                  size="lg"
                >
                  <BookOpen className="w-4 h-4" />
                  Go to Notes
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Flashcards;
