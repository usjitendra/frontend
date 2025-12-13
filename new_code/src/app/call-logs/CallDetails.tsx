"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Bot,
  Wrench,
  CheckCircle,
  Play,
  Pause,
  Square,
  Volume2,
  FileText,
  Copy,
  PhoneCall,
  Download,
  ArrowLeft,
  CalendarCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCallDetailsApi } from "@/network/Api";
import { toast } from "@/hooks/use-toast";

const CallDetails = ({ id }: { id: string }) => {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [callDetails, setCallDetails] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  // Use provided recording URL or fallback to mock URL
  // const audioUrl = recordingUrl || "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";

  const initializeAudio = () => {
    if (!audioRef && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      audio.addEventListener("error", (e) => {
        console.log("Audio loading error:", e);
        toast({
          title: "Audio Error",
          description: "Failed to load the recording. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      });
      setAudioRef(audio);
    }
  };

  console.log("callDetails mai hu ", callDetails);

  const handlePlayPause = async () => {
    if (!audioUrl) return;

    if (!audioRef) {
      initializeAudio();
      return;
    }

    setIsLoading(true);

    try {
      if (isPlaying) {
        audioRef.pause();
        setIsPlaying(false);
      } else {
        await handlePlay();
      }
    } catch (error) {
      console.log("Audio playback error:", error);
      toast({
        title: "Playback Error",
        description: "Failed to play the recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = async () => {
    if (audioRef) {
      await audioRef.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSeek = (newTime: number) => {
    if (audioRef) {
      audioRef.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(",", " •");
    } catch (error) {
      return dateString;
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return "N/A";
    const totalSeconds = Math.round(minutes * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    if (mins === 0) {
      return `${secs} sec`;
    } else if (secs === 0) {
      return `${mins} min`;
    } else {
      return `${mins} min ${secs} sec`;
    }
  };

  const formatTimeFromSeconds = (secondsFromStart: number) => {
    if (!secondsFromStart && secondsFromStart !== 0) return "";
    const minutes = Math.floor(secondsFromStart / 60);
    const seconds = Math.floor(secondsFromStart % 60);
    const totalTime = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    return totalTime;
  };

  const renderMessage = (message: any, index: number) => {
    const timeFromStart = formatTimeFromSeconds(message.secondsFromStart);

    // Skip system messages as they're not part of the conversation
    if (message.role === "system") return null;

    // Handle tool calls
    if (message.role === "tool_calls") {
      return (
        <div key={index} className="relative flex items-start gap-6">
          <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">
                System Action
              </h4>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {timeFromStart}
              </span>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900 p-4 rounded-xl border border-orange-200 dark:border-orange-800 shadow-sm">
              {message.toolCalls?.map((toolCall: any, toolIndex: number) => (
                <div key={toolIndex} className="mb-3 last:mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Wrench className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                        {toolCall.function.name}
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Function call executed
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 border-blue-200"
                      >
                        Processing
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-background/50 border border-orange-200 dark:border-orange-800 p-3 rounded-lg">
                    <pre className="text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(
                        JSON.parse(toolCall.function.arguments),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Handle tool call results
    if (message.role === "tool_call_result") {
      return (
        <div key={index} className="relative flex items-start gap-6">
          <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">
                System Result
              </h4>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {timeFromStart}
              </span>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900 p-4 rounded-xl border border-orange-200 dark:border-orange-800 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    {message.name}
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Function result
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={
                      message.result === "No result returned."
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-green-100 text-green-700 border-green-200"
                    }
                  >
                    {message.result === "No result returned."
                      ? "No Result"
                      : "Success"}
                  </Badge>
                </div>
              </div>
              <div className="bg-background/50 border border-orange-200 dark:border-orange-800 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  {typeof message.result === "object"
                    ? JSON.stringify(message.result, null, 2)
                    : message.result}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Handle bot messages
    if (message.role === "bot") {
      return (
        <div key={index} className="relative flex items-start gap-6">
          <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">
                AI Assistant
              </h4>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {timeFromStart}
              </span>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Mary (AI Assistant)
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {message.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Handle user messages
    if (message.role === "user") {
      return (
        <div key={index} className="relative flex items-start gap-6">
          <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">Caller</h4>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {timeFromStart}
              </span>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900 p-4 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Caller
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {message.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const fetchCallDetails = async () => {
    setIsLoading(true);
    getCallDetailsApi(id)
      .then((res: any) => {
        if (res?.data) {
          setCallDetails(res.data?.data);
          setAudioUrl(res.data?.data?.recording_url);
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
    if (id) {
      fetchCallDetails();
    }
  }, [id]);

  // Initialize audio when audioUrl is available
  useEffect(() => {
    if (audioUrl && !audioRef) {
      initializeAudio();
    }

    // Cleanup function to pause and remove audio when component unmounts
    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.removeEventListener("loadedmetadata", () => {});
        audioRef.removeEventListener("timeupdate", () => {});
        audioRef.removeEventListener("ended", () => {});
        audioRef.removeEventListener("error", () => {});
      }
    };
  }, [audioUrl]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioUrl) return;
    const link = document.createElement("a");
    link.href = audioUrl;
    // link.target = "_blank";
    link.download = `call_recording_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //   const handleDownload = async (e: React.MouseEvent) => {
  //     e.stopPropagation();
  //     if (!audioUrl) return;

  //     try {
  //       // Fetch the file
  //       const response = await fetch(audioUrl);
  //       console.log("response11111 featch..", response);
  //       const blob = await response.blob();

  //       // Create a blob URL
  //       const url = window.URL.createObjectURL(blob);

  //       // Create <a> tag with download attribute
  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.download = `call_recording_${Date.now()}.mp3`;
  //       document.body.appendChild(link);
  //       link.click();

  //       // Cleanup
  //       link.remove();
  //       window.URL.revokeObjectURL(url);
  //     } catch (error) {
  //       console.error("Download failed:", error);
  //     }
  //   };

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Call Details
              </h1>
              <p className="text-sm text-muted-foreground">
                Review appointment booking call information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex" style={{ height: "calc(100vh - 89px)" }}>
        {/* Left Column - Call Information (Fixed) */}
        <div className="w-96 flex-shrink-0 border-r bg-card p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Assistant & Call Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Call Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Assistant Section */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                    Assistant
                  </h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg border-2 border-indigo-300 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-700">
                        <Bot className="h-5 w-5 text-white drop-shadow-md" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {callDetails?.assistant?.name}
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />

                {/* Call Summary Section */}
                <div className="space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Duration
                      </span>
                      <span className="text-sm font-medium">
                        {formatDuration(callDetails?.duration_minutes)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Start Time
                      </span>
                      <span className="text-sm font-medium">
                        {formatDateTime(callDetails?.started_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        End Time
                      </span>
                      <span className="text-sm font-medium">
                        {formatDateTime(callDetails?.ended_at)}
                      </span>
                    </div>

                    {callDetails?.call?.type !== "webCall" && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Phone Number
                        </span>
                        <span className="text-sm font-medium">
                          {callDetails?.caller}
                        </span>
                      </div>
                    )}
                    {callDetails?.call?.type == "webCall" && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Call Type
                        </span>
                        <span className="text-sm font-medium">Web Call</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call Recording Player Card */}
            {audioUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Call Recording
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {/* Control Buttons */}
                    <div className="flex items-center justify-center gap-3">
                      {/* Play / Pause */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePlayPause}
                        disabled={isLoading}
                        className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-white hover:text-white transition-all duration-200"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5 ml-0.5" />
                        )}
                      </Button>

                      {/* Stop */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleStop}
                        disabled={isLoading || !audioRef}
                        className="h-10 w-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-600 hover:text-red-700 transition-all duration-200"
                      >
                        <Square className="h-4 w-4" />
                      </Button>

                      {/* ✅ Download Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownload}
                        disabled={isLoading}
                        className="h-10 w-10 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-2">
                      {/* Time Display */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-mono">
                          {formatTimeFromSeconds(currentTime)}
                        </span>
                        <span className="font-mono">
                          {formatTimeFromSeconds(duration)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-200 ease-out"
                            style={{
                              width:
                                duration > 0
                                  ? `${(currentTime / duration) * 100}%`
                                  : "0%",
                            }}
                          />
                        </div>
                        {/* Clickable overlay for seeking */}
                        <div
                          className="absolute inset-0 cursor-pointer"
                          onClick={(e) => {
                            if (duration > 0) {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const clickX = e.clientX - rect.left;
                              const newTime = (clickX / rect.width) * duration;
                              handleSeek(newTime);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Playing Animation & Status */}
                    <div className="flex items-center justify-center gap-2">
                      {!audioRef && !isLoading && (
                        <span className="text-xs text-muted-foreground">
                          Loading audio...
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {/* <Card className="mt-0">
            <CardHeader className="pt-2 ">
              <CardTitle className=" text-lg font-semibold">Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{"No feedback yet."}</p>
            </CardContent>
          </Card> */}
        </div>

        {/* Right Column - Conversation Timeline (Scrollable) */}
        <div className="flex-1 flex flex-col overflow-y-scroll">
          <Card className="flex-1 flex flex-col m-4">
            <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">
                Conversation Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
              {/* Call Summary */}
              {callDetails?.summary && (
                <div className="flex-shrink-0 border-b border-border pb-6 mb-6 px-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl shadow-sm">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold mb-2">
                        Call Summary
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {callDetails.summary}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Container - This is the scrollable part */}
              <div className="flex-1 overflow-y-scroll px-6 pb-6">
                <div className="relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent"></div>

                  <div className="space-y-8 pr-2">
                    {/* Render dynamic conversation messages */}
                    {callDetails?.messages?.map((message: any, index: number) =>
                      renderMessage(message, index)
                    )}

                    {/* Show loading message if no conversation data */}
                    {(!callDetails?.messages ||
                      callDetails.messages.length === 0) && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <PhoneCall className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                          No conversation data available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CallDetails;
