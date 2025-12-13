import { Button } from "@/components/ui/button";
import { Settings, MessageSquare, Zap, ArrowLeft, Phone, Server, BookOpen } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type Step = "configure" | "prompt" | "actions" | "phone" | "providers" | "knowledge-base";

interface StepsSidebarProps {
  onStepChange: (step: Step) => void;
  activeStep: Step;
  assistantName: string;
}

export function StepsSidebar({ onStepChange, activeStep, assistantName }: StepsSidebarProps) {
  const router = useRouter();
  
  const steps = [
    {
      id: "configure",
      icon: Settings,
      title: "Configure",
      description: "Basic setup & voice settings",
    },
    {
      id: "prompt",
      icon: MessageSquare,
      title: "Prompt",
      description: "Define behavior & responses",
    },
    {
      id: "phone",
      icon: Phone,
      title: "Phone Number",
      description: "Configure phone settings",
    },
    {
      id: "providers",
      icon: Server,
      title: "Providers",
      description: "Select AI & voice providers",
    },
    {
      id: "actions",
      icon: Zap,
      title: "Actions",
      description: "Set up automated tasks",
    },
    {
      id: "knowledge-base",
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Configure knowledge base",
    },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full shadow-sm flex flex-col">
      <div className="p-6 border-b border-gray-200">        
        <h2 className="text-xl font-semibold text-gray-900">{assistantName||"Assistant Setup"}</h2>
        <p className="text-sm text-gray-500 mt-1">Complete all steps to create your assistant</p>
      </div>
      
      <div className="p-4 flex-1 overflow-auto">
        <div id="setup-steps" className="space-y-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => onStepChange(step.id as Step)}
              className={`w-full px-4 py-3 rounded-xl flex items-center text-left ${
                activeStep === step.id
                  ? "bg-indigo-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                activeStep === step.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}>
                <step.icon className="h-4 w-4" />
              </div>
              <div>
                <span className={`block text-sm font-medium ${
                  activeStep === step.id
                    ? "text-indigo-600"
                    : "text-gray-700"
                }`}>{step.title}</span>
                <span className={`text-xs ${
                  activeStep === step.id
                    ? "text-indigo-500"
                    : "text-gray-500"
                }`}>{step.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 