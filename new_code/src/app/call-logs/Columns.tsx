"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Download,
} from "lucide-react";

export const getColumns = (
  handlePlayRecording: (url: string, id: string) => void,
  currentlyPlaying: string | null,
  assistantsList: any[],
  router: any,
  feedbacks: { [key: string]: string },
  setFeedbacks: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>,
  handleSaveFeedback: (id: string) => void,
  feedbackLoading: { [key: string]: boolean }, // ← add this
  setFeedbackLoading: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
) => {
  return [
    {
      header: "Assistant",
      accessorKey: "assistant_id",
      cell: (row: any) => {
        const assistant = assistantsList.find(
          (a: any) => a.id === row.assistant_id
        );
        return assistant ? assistant.name : row.assistant_id;
      },
    },

    {
      header: "Date",
      accessorKey: "started_at",
      cell: (row: any) => {
        if (!row.started_at) return "-";

        const date = new Date(row.started_at);
        let formatted = date.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return <span>{formatted}</span>;
      },
    },

    {
      header: "Duration",
      accessorKey: "duration_ms",
      cell: (row: any) => {
        const durationMs = row.duration_ms;
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        return (
          <span>
            {minutes}m {seconds}s
          </span>
        );
      },
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (row: any) => {
        const isInbound = row.type === "inbound";
        return (
          <div className="flex items-center gap-2">
            {!isInbound ? (
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowUpRight className="h-4 w-4 text-blue-600" />
            )}
            <span
              className={`text-sm font-medium ${
                !isInbound ? "text-green-600" : "text-blue-600"
              }`}
            >
              {!isInbound ? "Inbound" : "Outbound"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "recording",
      cell: (row: any) => {
        const handlePlayClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          handlePlayRecording(row.recording_url, row.id);
        };

        const handleViewDetailsClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          router.push(`/call-logs/${row.id}`);
        };

        const handleDownloadClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (!row.recording_url) return;
          console.log("download url", row.recording_url);

          const link = document.createElement("a");
          link.href = row.recording_url;
          // link.target = "_blank";
          link.download = `call_${row.id || Date.now()}.mp3`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="inline-flex items-center gap-1 text-gray-600 hover:text-indigo-600 p-1"
              onClick={handlePlayClick}
              disabled={!row.recording_url}
            >
              {currentlyPlaying === row.id ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>

            <Button
              variant="ghost"
              className="inline-flex items-center gap-1 text-gray-600 hover:text-indigo-600 p-1"
              onClick={handleViewDetailsClick}
            >
              <Eye className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              className="inline-flex items-center gap-1 text-gray-600 hover:text-indigo-600 p-1"
              onClick={handleDownloadClick}
              disabled={!row.recording_url}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },

    // ✅ this is Feedback column....
    {
      header: "Feedback",
      accessorKey: "feedback",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Enter feedback..."
            value={feedbacks[row.id] || ""}
            onChange={(e) =>
              setFeedbacks({ ...feedbacks, [row.id]: e.target.value })
            }
            className="w-40 h-8 text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSaveFeedback(row.id)}
            disabled={feedbackLoading[row.id]} // disable button while loading
          >
            {feedbackLoading[row.id] ? "Saving..." : "Save"}
          </Button>
        </div>
      ),
    },
  ];
};
