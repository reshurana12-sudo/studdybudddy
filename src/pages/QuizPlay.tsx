// @ts-nocheck
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";

interface Question {
  question: string;
  options: string[];
  answer_index: number;
  explanation_short?: string;
}

const QuizPlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);

  const { data: quiz } = useQuery({
    queryKey: ["quiz", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const submitAttempt = useMutation({
    mutationFn: async (score: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        quiz_id: id,
        score,
        total_questions: questions.length,
        answers: selectedAnswers,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Quiz completed!",
        description: "Your results have been saved.",
      });
    },
  });

  if (!quiz) return null;

  const questions: Question[] = Array.isArray(quiz.questions) 
    ? (quiz.questions as unknown as Question[]) 
    : [];

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const score = selectedAnswers.reduce((acc, answer, idx) => {
      return acc + (answer === questions[idx]?.answer_index ? 1 : 0);
    }, 0);

    submitAttempt.mutate(score);
    setShowResults(true);
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((acc, answer, idx) => {
      return acc + (answer === questions[idx]?.answer_index ? 1 : 0);
    }, 0);
  };

  if (questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">No questions available for this quiz.</p>
          <Button onClick={() => navigate("/quizzes")} className="mt-4">
            Back to Quizzes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 p-4 md:p-6">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardContent className="pt-4 md:pt-6 p-4 md:p-6 text-center space-y-3 md:space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">Quiz Complete! 🎉</h2>
              <div className="text-6xl font-bold text-purple-500">{percentage}%</div>
              <p className="text-xl">
                You scored {score} out of {questions.length}
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button onClick={() => navigate("/quizzes")} variant="outline">
                  Back to Quizzes
                </Button>
                <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 text-white">
                  Retry Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Review Answers</h3>
            {questions.map((q, idx) => {
              const userAnswer = selectedAnswers[idx];
              const isCorrect = userAnswer === q.answer_index;

              return (
                <Card key={idx} className={isCorrect ? "border-success" : "border-destructive"}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">{q.question}</p>
                        <p className="text-sm text-muted-foreground">
                          Your answer: {q.options[userAnswer]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-success">
                            Correct answer: {q.options[q.answer_index]}
                          </p>
                        )}
                        {q.explanation_short && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {q.explanation_short}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto relative">
        <div className="flex gap-6">
          {/* Main Quiz Area */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navigate("/quizzes")}
                className="gap-2 glass"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowNavigator(!showNavigator)}
                className="gap-2 glass lg:hidden"
              >
                <List className="w-4 h-4" />
                Navigator
              </Button>

              <div className="text-sm font-medium bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 text-purple-600">
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>

            {/* Animated Gradient Progress Bar */}
            <div className="relative space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/50 backdrop-blur-xl">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-purple-500/80 to-pink-500 rounded-full transition-all duration-500 ease-out shadow-lg shadow-purple-500/50 animate-pulse-glow"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Frosted Glass Question Card */}
            <GlassCard className="animate-fade-in shadow-lg shadow-purple-500/20 border-purple-500/20">
              <GlassCardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-medium border border-purple-500/20">
                    Question {currentQuestion + 1}
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {question.question}
                  </h2>
                </div>

                <div className="space-y-3">
                  {question.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx)}
                      className={`group w-full p-5 text-left rounded-xl border-2 backdrop-blur-xl transition-all duration-300 ${
                        selectedAnswers[currentQuestion] === idx
                          ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/50 scale-[1.02]"
                          : "border-border/50 bg-card/30 hover:border-purple-500/50 hover:bg-card/50 hover:shadow-lg hover:scale-[1.01]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedAnswers[currentQuestion] === idx
                              ? "border-purple-500 bg-purple-500 shadow-lg shadow-purple-500/50"
                              : "border-muted-foreground/50 group-hover:border-purple-500/50"
                          }`}
                        >
                          {selectedAnswers[currentQuestion] === idx && (
                            <div className="w-3 h-3 rounded-full bg-primary-foreground animate-scale-in" />
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestion] === undefined}
                  className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 text-white hover:scale-[1.02] transition-all"
                  size="lg"
                >
                  {currentQuestion === questions.length - 1 ? "Finish Quiz 🎯" : "Next Question →"}
                </Button>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Floating Question Navigator Sidebar */}
          <div
            className={`${
              showNavigator ? "fixed" : "hidden lg:block"
            } lg:sticky top-6 right-0 lg:w-64 h-fit z-50 transition-all duration-300`}
          >
            {showNavigator && (
              <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm lg:hidden"
                onClick={() => setShowNavigator(false)}
              />
            )}
            <GlassCard className={`${
              showNavigator ? "fixed right-4 top-4 w-80" : ""
            } lg:relative lg:right-auto lg:top-auto lg:w-full shadow-xl`}>
              <GlassCardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">Question Navigator</h3>
                  {showNavigator && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNavigator(false)}
                      className="lg:hidden"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, idx) => {
                    const isAnswered = selectedAnswers[idx] !== undefined;
                    const isCurrent = idx === currentQuestion;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestion(idx)}
                        className={`aspect-square rounded-lg border-2 font-bold text-sm transition-all duration-300 ${
                          isCurrent
                            ? "border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/50 scale-110"
                            : isAnswered
                            ? "border-purple-500/50 bg-purple-500/20 text-purple-600 hover:scale-105"
                            : "border-border/50 bg-card/30 text-muted-foreground hover:border-purple-500/30 hover:scale-105"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 text-xs pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-500" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-purple-500/50 bg-purple-500/20" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-border/50 bg-card/30" />
                    <span>Not Answered</span>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuizPlay;
