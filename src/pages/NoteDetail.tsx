// @ts-nocheck
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { ArrowLeft, Sparkles, FileText, Zap, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { TypeAnimation } from 'react-type-animation';

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [showTypingEffect, setShowTypingEffect] = useState(false);

  const { data: note, refetch } = useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const deleteNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });
      navigate("/notes");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateSummary = async () => {
    if (!note) return;
    setIsGeneratingSummary(true);

    try {
      const { data, error } = await supabase.functions.invoke("summarize-note", {
        body: { noteId: note.id, content: note.content },
      });

      if (error) throw error;

      toast({
        title: "Summary generated!",
        description: "Your note summary is ready.",
      });

      setShowTypingEffect(true);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!note) return;
    setIsGeneratingQuiz(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { noteId: note.id, content: note.content, title: note.title },
      });

      if (error) throw error;

      toast({
        title: "Quiz generated!",
        description: "Your quiz is ready to take.",
      });

      navigate(`/quizzes/${data.quizId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!note) return;
    setIsGeneratingFlashcards(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-flashcards", {
        body: { noteId: note.id, content: note.content },
      });

      if (error) throw error;

      toast({
        title: "Flashcards generated!",
        description: `${data.count} flashcards created.`,
      });

      navigate("/flashcards");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  useEffect(() => {
    if (note?.summary && showTypingEffect) {
      const timer = setTimeout(() => setShowTypingEffect(false), 100);
      return () => clearTimeout(timer);
    }
  }, [note?.summary, showTypingEffect]);

  if (!note) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 relative overflow-hidden">
        {/* Particle Effect Background */}
        {isGeneratingSummary && (
          <div className="particle-container">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between relative z-10">
          <Button
            variant="outline"
            onClick={() => navigate("/notes")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-blue-500" />
            Back to Notes
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteNote.mutate()}
            disabled={deleteNote.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
            {note.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Created {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
          <Button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            className="gap-2 hover-scale bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/50 text-white"
          >
            {isGeneratingSummary ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {note.summary ? "Regenerate Summary" : "Generate Summary"}
          </Button>

          <Button
            onClick={handleGenerateQuiz}
            disabled={isGeneratingQuiz}
            className="gap-2 hover-scale bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 text-white"
          >
            {isGeneratingQuiz ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Generate Quiz
          </Button>

          <Button
            onClick={handleGenerateFlashcards}
            disabled={isGeneratingFlashcards}
            className="gap-2 hover-scale bg-gradient-to-r from-green-500 to-teal-500 hover:shadow-lg hover:shadow-green-500/50 text-white"
          >
            {isGeneratingFlashcards ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Generate Flashcards
          </Button>
        </div>

        {/* Split Panel Layout */}
        <div className={`grid gap-6 relative z-10 ${note.summary ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          {/* AI Summary Panel */}
          {note.summary && (
            <div className="space-y-4">
              <GlassCard className="animated-gradient-border relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 animate-pulse-glow" />
                <GlassCardContent className="pt-8 relative z-10">
                  <div className="flex items-start gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-blue-500 shrink-0 mt-1 animate-pulse" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        AI Summary
                      </h3>
                    </div>
                  </div>
                  
                  <div className="prose prose-sm max-w-none text-foreground/90">
                    {showTypingEffect ? (
                      <TypeAnimation
                        sequence={[note.summary]}
                        wrapper="div"
                        speed={80}
                        style={{ whiteSpace: 'pre-wrap', display: 'block' }}
                        repeat={0}
                        cursor={false}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{note.summary}</p>
                    )}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          )}

          {/* Note Content Panel */}
          <div className={note.summary ? '' : 'max-w-4xl mx-auto w-full'}>
            <GlassCard>
              <GlassCardContent className="pt-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Note Content
                </h3>
                <div className="prose prose-sm max-w-none text-foreground/90">
                  <p className="whitespace-pre-wrap leading-relaxed">{note.content}</p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NoteDetail;
