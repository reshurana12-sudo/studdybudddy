import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Brain, BookOpen, FileText, Sparkles, LayoutDashboard, LogOut, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/auth");
    setOpen(false);
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/notes", icon: BookOpen, label: "Notes" },
    { to: "/quizzes", icon: FileText, label: "Quizzes" },
    { to: "/flashcards", icon: Sparkles, label: "Flashcards" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary">
              <Brain className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Study Buddy
          </h2>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 glass border-r border-border/10">
            <div className="flex flex-col h-full bg-gradient-to-b from-card/98 to-card/95 relative overflow-hidden">
              {/* Decorative gradient orbs */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
              
              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1.5 relative z-10 mt-6">
                {navItems.map((item, index) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                        isActive
                          ? "gradient-primary text-white shadow-glow-primary"
                          : "text-foreground/70 hover:text-foreground hover:bg-secondary/40 hover:shadow-md"
                      }`
                    }
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl" />
                        )}
                        {!isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        )}
                        <div className={`relative z-10 ${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-transform`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className={`font-medium relative z-10 ${isActive ? 'font-semibold' : ''}`}>
                          {item.label}
                        </span>
                        {isActive && (
                          <div className="absolute right-2 w-1.5 h-8 bg-white/80 rounded-full" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* Footer with logout button */}
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
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
