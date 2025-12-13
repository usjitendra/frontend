import { Button } from "@/components/ui/button";
import { Bot, Mic, LineChart, Settings } from "lucide-react";

export function MainSidebar() {
  return (
    <div className="w-20 bg-white shadow-lg flex flex-col items-center py-6">
      <div className="mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Bot className="text-xl text-white" />
        </div>
      </div>
      <div className="space-y-6">
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-gray-50 text-indigo-600">
          <Mic className="text-xl" />
        </Button>
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl text-gray-400">
          <LineChart className="text-xl" />
        </Button>
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl text-gray-400">
          <Settings className="text-xl" />
        </Button>
      </div>
    </div>
  );
} 