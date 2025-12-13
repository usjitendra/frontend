"use client";

import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Phone, PhoneOff, Plus } from "lucide-react";
interface AssistantCardProps {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'training';
  calls: string;
  avgTime: string;
  voiceName: string;
  gradientFrom: string;
  gradientTo: string;
  isNewCard?: boolean;
  onClick?: () => void;
  isActive?: boolean;
  isSpeaking?: boolean;
  isConnecting?: boolean;
  isCallConnected?: boolean;
  onTestAssistant?: () => void;
}

const AssistantCard: React.FC<AssistantCardProps> = ({
  id,
  name,
  description,
  status,
  calls,
  avgTime,
  voiceName,
  gradientFrom,
  gradientTo,
  onClick,
  isActive = false,
  isSpeaking = false,
  isConnecting = false,
  isCallConnected = false,
  onTestAssistant,
}) => {
  // Status indicator styling
  const statusColors = {
    active: "bg-green-500 text-green-600",
    inactive: "bg-red-500 text-red-600",
    training: "bg-yellow-500 text-yellow-600"
  };

  // Gradient styling helper
  const getGradientClass = (): string => {
    if (gradientFrom && gradientTo) {
      return `bg-gradient-to-br from-${gradientFrom} to-${gradientTo}`;
    }
    // Default fallback gradient
    return "bg-gradient-to-br from-gray-400 to-gray-600";
  };

  // Render main assistant card
  return (
    <Card 
      id={`assistant-card-${id}`} 
      className={`transition-all h-full flex flex-col ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
    >
      <CardContent className="p-6 flex-grow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg border-2 border-indigo-300 shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-700">
                <Bot className="h-5 w-5 text-white drop-shadow-md" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 bg-black/10 transition-opacity duration-200"></div>
          </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 capitalize">{name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${statusColors[status].split(' ')[0]}`}></span>
                <span className={`text-xs font-medium ${statusColors[status].split(' ')[1]}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(isSpeaking || isCallConnected) && (
              <div className="flex gap-1 items-center">
                <span className="w-1 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1 h-2.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></span>
                <span className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "450ms" }}></span>
                <span className="w-1 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "600ms" }}></span>
              </div>
            )}
            {isConnecting && (
              <span className="text-xs text-blue-500">Connecting...</span>
            )}
            {onTestAssistant && (
              <Button
                size="sm"
                variant={isActive ? "destructive" : "secondary"}
                className="rounded-full w-8 h-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onTestAssistant();
                }}
              >
                {isActive ? <PhoneOff size={16} /> : <Phone size={16} />}
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter className="px-4 py-3 bg-gray-50 rounded-b-lg border-t">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 rounded-lg">
              <AvatarFallback className="text-xs">{voiceName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">
              {voiceName}
            </span>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            className="px-3 py-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AssistantCard;