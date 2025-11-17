import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Plus, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WelcomeBannerProps {
  user: User;
}

export const WelcomeBanner = ({ user }: WelcomeBannerProps) => {
  const navigate = useNavigate();
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl gradient-hero p-6 sm:p-8 lg:p-12 text-white shadow-intense particles transition-all duration-300 hover:shadow-glow">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-6 left-6 sm:top-10 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 w-28 h-28 sm:w-40 sm:h-40 bg-purple-300 rounded-full blur-3xl animate-float transition-all duration-300" style={{ animationDelay: "1s" }} />
      </div>
      
      <div className="relative z-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 animate-fade-in-up">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-4 sm:mb-6 lg:mb-8 max-w-2xl">
          Ready to supercharge your learning? Create a new note or review your flashcards to keep your knowledge fresh.
        </p>
        
        <div className="flex flex-col xs:flex-row flex-wrap gap-2 sm:gap-4">
          <Button
            size="lg"
            onClick={() => navigate("/notes")}
            className="glass-intense border-frosted text-white hover:bg-white/30 h-10 sm:h-12 px-4 sm:px-6 transition-all duration-300 hover:scale-105"
          >
            <Plus className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Create New Note</span>
          </Button>
          <Button
            size="lg"
            onClick={() => navigate("/flashcards")}
            className="glass-intense border-frosted text-white hover:bg-white/30 h-10 sm:h-12 px-4 sm:px-6 transition-all duration-300 hover:scale-105"
          >
            <Brain className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Review Flashcards</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
