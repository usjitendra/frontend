"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Badge, Check } from "lucide-react";

interface AgentCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  usedBy: string;
  isPopular?: boolean;
  isNew?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  icon,
  title,
  description,
  usedBy,
  isPopular = false,
  isNew = false,
  isSelected = false,
  onSelect,
}) => {
  return (
    <Card 
      className={`p-4 flex flex-col h-full cursor-pointer transition-colors ${
        isSelected 
          ? "border-blue-500 ring-2 ring-blue-500" 
          : "hover:border-blue-400"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div className="flex gap-2">
          {isSelected && (
            <div className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
              <Check size={16} />
            </div>
          )}          
        </div>
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-gray-500 text-sm mb-2">{description}</p>
      <p className="text-gray-400 text-xs mt-auto">{usedBy}</p>
    </Card>
  );
};

const PreConfiguredAssistant = () => {
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number | null>(null);

  const agents = [
    {
      icon: (
        <div className="bg-purple-500 w-full h-full rounded-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 13L12 7L18 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 17L12 11L18 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ),
      title: "Restaurant Reservation",
      description: "Manage restaurant bookings efficiently.",
      usedBy: "Used by 2.3k teams",
      isPopular: true,
    },
    {
      icon: (
        <div className="bg-blue-500 w-full h-full rounded-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 16.92V19.92C22 20.4704 21.7893 20.9978 21.4142 21.3728C21.0391 21.7479 20.5117 21.9586 19.96 21.96C18.44 22.0561 16.93 21.9077 15.48 21.52C13.2971 20.8882 11.3016 19.7775 9.63 18.27C8.0744 16.8621 6.79903 15.1751 5.87 13.31C5.38272 11.8778 5.14087 10.3763 5.16 8.86C5.16135 8.31207 5.37057 7.78823 5.74317 7.41357C6.11577 7.03891 6.63811 6.82687 7.18 6.82H10.18C11.0941 6.81588 11.8691 7.50171 12 8.4C12.08 8.99 12.21 9.57 12.39 10.13C12.6354 10.8978 12.4453 11.7458 11.89 12.32L10.9 13.31C11.7548 14.9209 12.9589 16.3188 14.42 17.38L15.41 16.39C15.9842 15.8347 16.8322 15.6446 17.6 15.89C18.16 16.07 18.74 16.2 19.33 16.28C20.2506 16.4125 20.94 17.2044 21 18.12V16.92H22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ),
      title: "Debt Collection",
      description: "Automate and streamline debt recovery.",
      usedBy: "Used by 1.8k teams",
    },
    {
      icon: (
        <div className="bg-emerald-500 w-full h-full rounded-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ),
      title: "Job Hiring",
      description: "Automate recruitment and hiring processes.",
      usedBy: "Used by 3.1k teams",
      isPopular: true,
    },
    {
      icon: (
        <div className="bg-amber-500 w-full h-full rounded-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ),
      title: "Customer Support",
      description: "Provide 24/7 automated customer assistance.",
      usedBy: "Used by 4.2k teams",
      isPopular: true,
    },
    {
      icon: (
        <div className="bg-pink-500 w-full h-full rounded-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ),
      title: "Appointment Scheduler",
      description: "Automate appointment booking and reminders.",
      usedBy: "Used by 1.5k teams",
      isNew: true,
    },
    {
      icon: (
        <div className="bg-red-500 w-full h-full rounded-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 20V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ),
      title: "Sales Representative",
      description: "Boost sales with automated outreach.",
      usedBy: "Used by 2.7k teams",
    },
  ];

  const handleSelectAgent = (index: number) => {
    setSelectedAgentIndex(index === selectedAgentIndex ? null : index);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {agents.map((agent, index) => (
        <AgentCard
          key={index}
          icon={agent.icon}
          title={agent.title}
          description={agent.description}
          usedBy={agent.usedBy}
          isPopular={agent.isPopular}
          isNew={agent.isNew}
          isSelected={index === selectedAgentIndex}
          onSelect={() => handleSelectAgent(index)}
        />
      ))}
    </div>
  );
};

export default PreConfiguredAssistant;