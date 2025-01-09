import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  Users, 
  FileText, 
  Bot, 
  ArrowRight, 
  X 
} from "lucide-react";

const tourSteps = [
  {
    title: "Welcome to ChatGenius",
    description: "Let's take a quick tour of the key features that will help you collaborate effectively.",
    icon: MessageSquare,
  },
  {
    title: "Channels & Direct Messages",
    description: "Join channels for team discussions or start private conversations with colleagues.",
    icon: Users,
  },
  {
    title: "File Sharing",
    description: "Share and organize files directly in your conversations with drag-and-drop simplicity.",
    icon: FileText,
  },
  {
    title: "AI Assistant",
    description: "Get help from our AI assistant for summaries, translations, and quick answers.",
    icon: Bot,
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const CurrentIcon = tourSteps[currentStep].icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-2">
          <Progress value={progress} className="mb-8" />

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <CurrentIcon className="w-8 h-8 text-primary" />
            </div>

            <DialogHeader>
              <DialogTitle className="text-2xl mb-4">
                {tourSteps[currentStep].title}
              </DialogTitle>
            </DialogHeader>

            <p className="text-muted-foreground">
              {tourSteps[currentStep].description}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Skip Tour
            </Button>
            <Button onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
