import { NavLink } from "react-router-dom";
import { Brain, BookOpen, FileText, Sparkles, LayoutDashboard, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/auth");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/notes", icon: BookOpen, label: "Notes" },
    { to: "/quizzes", icon: FileText, label: "Quizzes" },
    { to: "/flashcards", icon: Sparkles, label: "Flashcards" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <aside className="w-64 glass border-r border-border/20 flex flex-col bg-card/95 backdrop-blur-xl shrink-0">
      <div className="p-6 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">Study Buddy</h2>
            <p className="text-xs text-muted-foreground">Learn smarter</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "gradient-primary text-white shadow-glow neon-glow"
                  : "text-foreground/70 hover:bg-secondary/50 hover:text-foreground"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border/20">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 border-border/50 hover:bg-destructive/10 text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};
