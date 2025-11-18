// @ts-nocheck
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Sparkles, FileText, Clock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/SearchBar";
import { SortDropdown, type SortOption } from "@/components/SortDropdown";

const Notes = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<"all" | "with-summary" | "recent">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: notes, refetch } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notes")
        .select("*")
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
  ];

  const filteredNotes = useMemo(() => {
    let result = notes || [];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filter === "with-summary") {
      result = result.filter((note) => note.summary);
    } else if (filter === "recent") {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      result = result.filter((note) => new Date(note.created_at) > threeDaysAgo);
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
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [notes, searchQuery, filter, sortBy]);

  const handleCreate = async () => {
    if (!title || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        title,
        content,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Note created!",
      description: "Your note has been saved successfully.",
    });

    setTitle("");
    setContent("");
    setIsCreating(false);
    refetch();
    navigate(`/notes/${data.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 p-4 md:p-6 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold flex items-center gap-2 md:gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-blue-500 animate-float" />
              My Notes
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
              Create and manage your study notes with AI-powered tools
            </p>
          </div>

          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-glow-primary hover:scale-105 transition-all duration-300 text-white text-sm md:text-base border-0">
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Introduction to Calculus"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your notes here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="resize-none"
                  />
                </div>

                <Button onClick={handleCreate} className="w-full">
                  Create Note
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search notes by title or content..."
              className="w-full"
            />
          </div>
          <SortDropdown
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>

        {/* Animated Tag Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <Badge
            variant={filter === "all" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:scale-105 px-4 py-2 text-sm whitespace-nowrap",
              filter === "all" && "shadow-glow-primary animate-pulse-glow"
            )}
            onClick={() => setFilter("all")}
          >
            <FileText className="w-4 h-4 mr-2" />
            All Notes
          </Badge>
          <Badge
            variant={filter === "with-summary" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:scale-105 px-4 py-2 text-sm whitespace-nowrap",
              filter === "with-summary" && "shadow-glow-primary animate-pulse-glow"
            )}
            onClick={() => setFilter("with-summary")}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            With Summary
          </Badge>
          <Badge
            variant={filter === "recent" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:scale-105 px-4 py-2 text-sm whitespace-nowrap",
              filter === "recent" && "shadow-glow-primary animate-pulse-glow"
            )}
            onClick={() => setFilter("recent")}
          >
            <Clock className="w-4 h-4 mr-2" />
            Recent
          </Badge>
        </div>

        {/* 3-Column Grid with Glassmorphism Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredNotes?.map((note, index) => (
            <Card
              key={note.id}
              className={cn(
                "glass cursor-pointer group relative overflow-hidden",
                "border border-border/50 backdrop-blur-xl bg-card/50",
                "hover:shadow-glow-primary hover:border-primary/50",
                "transition-all duration-500 hover:scale-[1.02]",
                "hover:-translate-y-1"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
              onClick={() => navigate(`/notes/${note.id}`)}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Glow Effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 -z-10" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2 group-hover:text-blue-500 transition-colors duration-300">
                    {note.title}
                  </span>
                  <Zap className="w-5 h-5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {note.content}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </span>
                  <div className="flex gap-2">
                    {note.summary && (
                      <div className="p-1.5 rounded-md bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!filteredNotes || filteredNotes.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 text-center px-4">
              <div className="relative w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse-glow" />
                <Card className="glass relative p-6 md:p-8 lg:p-12 max-w-lg mx-auto">
                  <div className="space-y-4 md:space-y-6">
                    <div className="relative inline-block">
                      <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-blue-500 mx-auto animate-pulse" />
                      <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 absolute -top-1 -right-1 md:-top-2 md:-right-2 animate-pulse" />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        {filter === "all" ? "No notes yet" : "No notes found"}
                      </h3>
                      <p className="text-muted-foreground text-sm md:text-base">
                        {filter === "all" 
                          ? "Create your first note to get started with AI-powered study tools!" 
                          : "Try adjusting your filter or create a new note."}
                      </p>
                    </div>
                    {filter === "all" && (
                      <Button 
                        onClick={() => setIsCreating(true)} 
                        className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/50 text-white mt-2 md:mt-4"
                        size="lg"
                      >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                        Create Note
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notes;
