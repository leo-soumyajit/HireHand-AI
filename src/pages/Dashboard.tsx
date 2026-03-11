import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { PositionDetail } from "@/components/dashboard/PositionDetail";
import { JDInput } from "@/components/dashboard/JDInput";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { QuestionList } from "@/components/dashboard/QuestionList";
import { Question } from "@/types/questions";
import { generateQuestionsFromJD } from "@/lib/openrouter";
import { useToast } from "@/hooks/use-toast";

type DashboardView = "home" | "position-detail" | "input" | "loading" | "results";

const Dashboard = () => {
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [view, setView] = useState<DashboardView>("home");
  const [activeSection, setActiveSection] = useState("home");
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleViewPosition = (id: string) => {
    setSelectedPositionId(id);
    setView("position-detail");
  };

  const handleBackToHome = () => {
    setView("home");
    setSelectedPositionId(null);
  };

  const handleGenerate = async (jd: string) => {
    if (!jd.trim()) {
      toast({ title: "Error", description: "Job description cannot be empty", variant: "destructive" });
      return;
    }
    
    setView("loading");
    
    try {
      const generatedQuestions = await generateQuestionsFromJD(jd);
      setQuestions(generatedQuestions);
      setView("results");
    } catch (error) {
      console.error("Failed to generate questions:", error);
      toast({ 
        title: "Generation Failed", 
        description: error instanceof Error ? error.message : "An unexpected error occurred while generating questions.",
        variant: "destructive"
      });
      setView("input");
    }
  };

  const handlePasteJD = () => {
    setView("input");
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (section === "home") {
      handleBackToHome();
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background bg-dot-grid">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onPasteJD={handlePasteJD}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {view === "home" && (
              <DashboardHome key="home" onViewPosition={handleViewPosition} />
            )}
            {view === "position-detail" && selectedPositionId && (
              <PositionDetail
                key="detail"
                positionId={selectedPositionId}
                onBack={handleBackToHome}
              />
            )}
            {view === "input" && (
              <JDInput key="input" onGenerate={handleGenerate} isGenerating={false} />
            )}
            {view === "loading" && <LoadingState key="loading" />}
            {view === "results" && (
              <QuestionList
                key="results"
                questions={questions}
                onUpdateQuestions={setQuestions}
                onBack={handleBackToHome}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
