import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Sparkles, Check, Brain, Zap, Target } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data: authData, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;

        toast({
          title: "Account created!",
          description: "You're all set. Logging you in...",
        });
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex gradient-mesh particles">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-8 xl:p-16">
        <div className="max-w-2xl space-y-6 xl:space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center px-3 xl:px-4 py-1.5 xl:py-2 rounded-full glass border-frosted mb-4 xl:mb-6">
            <Sparkles className="w-3.5 xl:w-4 h-3.5 xl:h-4 mr-2 text-accent" />
            <span className="text-xs xl:text-sm font-medium">Powered by AI</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gradient leading-tight">
            Study Smarter with AI
          </h1>
          
          <p className="text-lg xl:text-xl text-muted-foreground leading-relaxed">
            Transform your learning with AI-powered summaries, intelligent quizzes, 
            and adaptive flashcards. Your personal study companion that grows with you.
          </p>
          
          <div className="space-y-3 xl:space-y-4 pt-6 xl:pt-8">
            {[
              { icon: Brain, text: "AI-Powered Summaries" },
              { icon: Zap, text: "Instant Quiz Generation" },
              { icon: Target, text: "Smart Flashcards" },
              { icon: Sparkles, text: "Personalized Learning" }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="flex items-center space-x-2.5 xl:space-x-3 animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-9 xl:w-10 h-9 xl:h-10 rounded-full gradient-primary flex items-center justify-center shadow-glow shrink-0">
                  <Check className="w-4 xl:w-5 h-4 xl:h-5 text-white" />
                </div>
                <span className="text-base xl:text-lg font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Floating 3D shapes */}
          <div className="absolute top-20 left-20 w-28 xl:w-32 h-28 xl:h-32 rounded-lg gradient-accent opacity-20 blur-2xl animate-float" />
          <div className="absolute bottom-20 right-20 w-36 xl:w-40 h-36 xl:h-40 rounded-full gradient-primary opacity-20 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-md space-y-6 md:space-y-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 gradient-primary rounded-xl blur-md opacity-75" />
                <div className="relative w-16 h-16 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary">
                  <Brain className="w-9 h-9 text-white animate-pulse" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gradient">Study Buddy</h2>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? "Create your account" : "Welcome back"}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAuth} className="glass rounded-2xl p-8 shadow-card hover-lift">
            <div className="space-y-6">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 bg-transparent border-white/20 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-background/5"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-transparent border-white/20 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-background/5"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-transparent border-white/20 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-background/5"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 gradient-primary text-white font-medium shadow-glow-primary hover:shadow-intense transition-all"
              >
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium text-primary hover:text-accent transition-colors"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="glass rounded-lg p-4 border-frosted">
            <p className="text-xs text-muted-foreground text-center font-mono">
              Demo: demo@example.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
