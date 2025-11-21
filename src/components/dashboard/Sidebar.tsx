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
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "dashboard" },
    { to: "/notes", icon: BookOpen, label: "Notes", color: "notes" },
    { to: "/quizzes", icon: FileText, label: "Quizzes", color: "quizzes" },
    { to: "/flashcards", icon: Sparkles, label: "Flashcards", color: "flashcards" },
    { to: "/profile", icon: User, label: "Profile", color: "profile" },
  ];

  return (
    <aside className="w-64 glass border-r border-border/10 flex flex-col bg-gradient-to-b from-card/98 to-card/95 backdrop-blur-xl shrink-0 relative overflow-hidden md:flex hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      {/* Header with enhanced logo */}
      <div className="p-6 border-b border-border/10 relative z-10">
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 gradient-primary rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary transform group-hover:scale-105 transition-transform">
              <Brain className="w-7 h-7 text-white animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Study Buddy
            </h2>
            <p className="text-xs text-muted-foreground font-medium tracking-wide">Learn smarter, not harder</p>
          </div>
        </div>
      </div>

      {/* Navigation with enhanced styling */}
      <nav className="flex-1 p-4 space-y-1.5 relative z-10">
        {navItems.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item-${item.color} flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-500 group relative overflow-hidden ${
                isActive
                  ? "nav-item-active shadow-glow-primary"
                  : "text-foreground/70 hover:text-foreground hover:scale-[1.02] hover:-translate-y-0.5"
              }`
            }
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {({ isActive }) => (
              <>
                {/* Active state background with identity color */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl" />
                  </>
                )}
                
                {/* Hover state with identity color highlight */}
                {!isActive && (
                  <>
                    <div className={`absolute inset-0 nav-item-${item.color}-bg opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`} />
                    <div className={`absolute -inset-[1px] nav-item-${item.color}-glow opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 rounded-xl -z-10`} />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </>
                )}
                
                <div className={`relative z-10 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-all duration-300`}>
                  <item.icon className={`w-5 h-5 ${!isActive ? `group-hover:nav-item-${item.color}-icon` : ''}`} />
                </div>
                <span className={`font-medium relative z-10 ${isActive ? 'font-semibold' : ''} transition-all duration-300`}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-l-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer with enhanced logout button */}
      <div className="p-4 border-t border-border/10 relative z-10">
        <Button
          className="w-full justify-start gap-3 bg-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,55%)] text-white transition-all duration-300 group relative overflow-hidden shadow-md hover:shadow-lg hover:shadow-red-500/20"
          onClick={handleLogout}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <LogOut className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
          <span className="relative z-10 font-medium">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};
