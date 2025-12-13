"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bot,
  Calendar,
  Phone,
  Users,
  Clock,
  Play,
  Pause,
  Edit,
  Trash2,
  Download,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import CallRecords from "./CallRecords";

type CallStatus = "completed" | "failed" | "busy" | "no-answer" | "pending";

interface CallRecord {
  id: string;
  phoneNumber: string;
  contactName: string;
  callDuration: string;
  status: CallStatus;
  timestamp: string;
  notes: string;
}

const CampaignSetup = ({ id }: { id: string }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Mock campaign data - in real app this would come from API
  const campaign = {
    id: id,
    name: "Spring Sale Outreach",
    status: "active" as const,
    assistant: "Emma AI",
    createdAt: "Apr 18, 2024",
    phoneCount: 1250,
    completedCalls: 847,
    successfulCalls: 623,
    failedCalls: 224,
    avgCallDuration: "2m 34s",
    description:
      "Outbound campaign to promote our spring sale offers to existing customers and qualified leads.",
  };

  return (
    <div id="main-content" className="flex-1 overflow-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Campaign ID: {campaign.id}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search calls..."
              className="pl-10 pr-4 py-2.5 bg-gray-50 text-sm rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <Phone className="absolute left-3.5 top-3 text-gray-400 h-4 w-4" />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          {campaign.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
            >
              <Play className="h-4 w-4" />
              Resume
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Campaign Overview */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600 h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-blue-600">
                  Contacts
                </span>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-16 mb-1" />
              ) : (
                <h3 className="text-xl font-bold text-gray-900">
                  {campaign.phoneCount.toLocaleString()}
                </h3>
              )}
              <p className="text-xs text-gray-500 mt-0.5">Total contacts</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="text-green-600 h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-green-600">
                  Completed
                </span>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-16 mb-1" />
              ) : (
                <h3 className="text-xl font-bold text-gray-900">
                  {campaign.completedCalls.toLocaleString()}
                </h3>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                {Math.round(
                  (campaign.completedCalls / campaign.phoneCount) * 100
                )}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-indigo-600 h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-indigo-600">
                  Success Rate
                </span>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-16 mb-1" />
              ) : (
                <h3 className="text-xl font-bold text-gray-900">
                  {Math.round(
                    (campaign.successfulCalls / campaign.completedCalls) * 100
                  )}
                  %
                </h3>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                {campaign.successfulCalls} successful calls
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-purple-600 h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-purple-600">
                  Duration
                </span>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-16 mb-1" />
              ) : (
                <h3 className="text-xl font-bold text-gray-900">
                  {campaign.avgCallDuration}
                </h3>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                Average call duration
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Details */}
        <Card className="shadow-sm">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-gray-500" />
              Campaign Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Connected Assistant
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Bot className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-900">{campaign.assistant}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created Date
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{campaign.createdAt}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="text-gray-900 mt-1">{campaign.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Records */}
        <CallRecords campaign={campaign} />
      </div>
    </div>
  );
};

export default CampaignSetup;
