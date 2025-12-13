"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BotIcon,
  PhoneIcon,
  PlusCircle,
  ListPlus,
  Activity,
  Phone,
  Zap,
  Clock,
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  KeyRound,
  Play,
  Pause,
} from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { getCallListApi, getCompanyStatisticsApi } from "@/network/Api";
import { useSelector } from "react-redux";

export default function Home() {
  const [companyStatistics, setCompanyStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callList, setCallList] = useState<any[]>([]);
  const [filteredCallList, setFilteredCallList] = useState<any[]>([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const billingUsageData = useSelector(
    (state: any) => state.account.billingUsageData
  );
  const currentSubscriptionData = useSelector(
    (state: any) => state.account.currentSubscriptionData
  );

  const fetchCompanyStatistics = async () => {
    setIsLoading(true);
    getCompanyStatisticsApi()
      .then((res) => {
        if (res.data) {
          console.log("companyStatistics", res?.data?.data);
          setCompanyStatistics(res?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchCallList = async () => {
    setIsLoading(true);
    getCallListApi(1, 5)
      .then((res) => {
        if (res?.data) {
          console.log(res?.data?.data?.calls);
          const calls = res?.data?.data?.calls || [];
          setCallList(calls);
          setFilteredCallList(calls);
          setTotalCalls(res?.data?.data?.total || 0);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCompanyStatistics();
    fetchCallList();
  }, []);

  const { toggleSidebar, open } = useSidebar();

  useEffect(() => {
    if (!open) {
      toggleSidebar();
    }
  }, []);

  const callsData = [
    { name: "Mon", calls: 24 },
    { name: "Tue", calls: 32 },
    { name: "Wed", calls: 45 },
    { name: "Thu", calls: 38 },
    { name: "Fri", calls: 56 },
    { name: "Sat", calls: 32 },
    { name: "Sun", calls: 18 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen w-full p-6 overflow-auto bg-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6  overflow-auto bg-gray-100">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 text-transparent bg-clip-text">
              Dashboard
            </h1>
            {companyStatistics && (
              <p className="text-sm text-gray-600 mt-1">
                {companyStatistics.name} • {companyStatistics.subscription_plan}{" "}
                Plan
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              className="border-indigo-300 hover:bg-indigo-50"
            >
              <Link href="/agents">
                <BotIcon className="mr-2 h-4 w-4 text-indigo-500" />
                View Agents
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
            >
              <Link href="/agents">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Agent
              </Link>
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-indigo-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shadow-inner">
                <Phone className="h-5 w-5 text-indigo-600 drop-shadow-sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {companyStatistics?.calls || 0}
              </div>
              <p className="text-xs text-indigo-400">Total calls made</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Call Duration
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-inner">
                <Clock className="h-5 w-5 text-emerald-600 drop-shadow-sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {companyStatistics?.average_call_duration
                  ? `${companyStatistics.average_call_duration.toFixed(1)}`
                  : "0.0"}
              </div>
              <p className="text-xs text-emerald-400">Minutes per call</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assistants</CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-inner">
                <BotIcon className="h-5 w-5 text-purple-600 drop-shadow-sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {companyStatistics?.assistant || 0}
              </div>
              <p className="text-xs text-purple-400">Active assistants</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Phone Numbers
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-inner">
                <PhoneIcon className="h-5 w-5 text-blue-600 drop-shadow-sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {companyStatistics?.phone_numbers || 0}
              </div>
              <p className="text-xs text-blue-400">Active numbers</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-inner">
                <Calendar className="h-5 w-5 text-green-600 drop-shadow-sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {companyStatistics?.bookings || 0}
              </div>
              <p className="text-xs text-green-400">Total bookings</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shadow-inner">
                <MessageSquare className="h-5 w-5 text-orange-600 drop-shadow-sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {billingUsageData?.sms || 0}
              </div>
              <p className="text-xs text-orange-400">
                Additional SMS Sent{" "}
                {billingUsageData?.sms >
                currentSubscriptionData?.plan?.features?.sms_included
                  ? billingUsageData?.sms -
                    currentSubscriptionData?.plan?.features?.sms_included
                  : 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-pink-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center shadow-inner">
                <Mail className="h-5 w-5 text-pink-600 drop-shadow-sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {billingUsageData?.email || 0}
              </div>
              <p className="text-xs text-pink-400">
                Additional Email Sent{" "}
                {billingUsageData?.email >
                currentSubscriptionData?.plan?.features?.emails_included
                  ? billingUsageData?.email -
                    currentSubscriptionData?.plan?.features?.emails_included
                  : 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Minutes Used
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-inner">
                <Clock className="h-5 w-5 text-amber-600 drop-shadow-sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {billingUsageData?.minutes
                  ? billingUsageData?.minutes.toFixed(1)
                  : "0.0"}
              </div>
              <p className="text-xs text-amber-400">
                Additional Minutes Used{" "}
                {billingUsageData?.minutes >
                currentSubscriptionData?.plan?.features?.minutes_included
                  ? billingUsageData?.minutes -
                    currentSubscriptionData?.plan?.features?.minutes_included
                  : 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {/* <Card className="col-span-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gradient bg-gradient-to-r from-indigo-600 to-indigo-800 text-transparent bg-clip-text">Call Analytics</CardTitle>
            <CardDescription>Call volume over the past week</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={callsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Bar dataKey="calls" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mr-3 shadow-md">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                asChild
                variant="outline"
                className="justify-start hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Link href="/agents">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                    <PlusCircle className="h-4 w-4 text-indigo-600" />
                  </div>
                  Create New Agent
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Link href="/actions-all">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                    <ListPlus className="h-4 w-4 text-purple-600" />
                  </div>
                  Add New Action
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Link href="/phone-numbers">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  Manage Phone Numbers
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Link href="/billings">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  View Statements
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Link href="/accounts">
                  <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                    <KeyRound className="h-4 w-4 text-orange-600" />
                  </div>
                  Change Password
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                Recent Call Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {callList.length > 0 ? (
                  callList.slice(0, 5).map((call, i) => {
                    const duration = Math.round(call.duration_ms / 1000); // Convert to seconds
                    const minutes = Math.floor(duration / 60);
                    const seconds = duration % 60;
                    const durationText =
                      minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

                    const callTime = new Date(call.started_at);
                    const endTime = new Date(call.ended_at);
                    const now = new Date();
                    const diffMs = now.getTime() - callTime.getTime();
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffDays = Math.floor(diffHours / 24);

                    let timeAgo;
                    if (diffDays > 0) {
                      timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
                    } else if (diffHours > 0) {
                      timeAgo = `${diffHours} hour${
                        diffHours > 1 ? "s" : ""
                      } ago`;
                    } else {
                      const diffMinutes = Math.floor(diffMs / (1000 * 60));
                      timeAgo =
                        diffMinutes > 0 ? `${diffMinutes} min ago` : "Just now";
                    }

                    const formatTime = (date: Date) => {
                      return date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });
                    };

                    const formatDate = (date: Date) => {
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    };

                    const handlePlayPause = (
                      callId: string,
                      recordingUrl: string
                    ) => {
                      const audioElement = document.getElementById(
                        `audio-${callId}`
                      ) as HTMLAudioElement;

                      if (playingCallId === callId) {
                        audioElement.pause();
                        setPlayingCallId(null);
                      } else {
                        // Pause any currently playing audio
                        if (playingCallId) {
                          const currentlyPlaying = document.getElementById(
                            `audio-${playingCallId}`
                          ) as HTMLAudioElement;
                          if (currentlyPlaying) {
                            currentlyPlaying.pause();
                          }
                        }

                        audioElement.play();
                        setPlayingCallId(callId);
                      }
                    };

                    return (
                      <div
                        key={call.id}
                        className="flex items-start gap-4 border-b pb-4 hover:bg-slate-50 p-3 rounded-md transition-colors"
                      >
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md transform hover:scale-105 transition-transform flex-shrink-0">
                          <Phone className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            Call from {call.caller}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Duration: {durationText} • {timeAgo}
                          </p>
                          <div className="mt-1 text-xs text-muted-foreground">
                            <span className="inline-block">
                              Start: {formatDate(callTime)}{" "}
                              {formatTime(callTime)}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="inline-block">
                              End: {formatTime(endTime)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {call.recording_url && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handlePlayPause(call.id, call.recording_url)
                                }
                                className="hover:bg-green-50 p-2"
                                title={
                                  playingCallId === call.id
                                    ? "Pause recording"
                                    : "Play recording"
                                }
                              >
                                {playingCallId === call.id ? (
                                  <Pause className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Play className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                              <audio
                                id={`audio-${call.id}`}
                                src={call.recording_url}
                                onEnded={() => setPlayingCallId(null)}
                                preload="none"
                              />
                            </>
                          )}
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="hover:bg-indigo-50 p-2"
                          >
                            <Link href={`/call-logs/${call.id}`}>
                              <Activity className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <div className="text-center">
                      <Phone className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p className="text-sm">No call logs available</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
