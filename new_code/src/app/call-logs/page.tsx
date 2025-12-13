"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Search,
  RotateCw,
  ArrowDownToLine,
  ArrowUpToLine,
  Play,
  Pause,
  Share,
  Trash,
  CheckCircle,
} from "lucide-react";
import {
  getAssistantListApi,
  getCallListApi,
  getCallAssistantApi,
  feedbackApi,
} from "@/network/Api";
import { useEffect, useState, useRef } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./Columns";
import { useRouter } from "next/navigation";
import axios from "axios";

const url = process.env.NEXT_PUBLIC_API_URL_TOOLS;

const CallLogs = () => {
  const router = useRouter();
  const [callList, setCallList] = useState([]);
  const [filteredCallList, setFilteredCallList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCalls, setTotalCalls] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [assistantsList, setAssistantsList] = useState([]);
  const [assistantsLoading, setAssistantsLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState("all-assistants");
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: string }>({});
  const [feedbackLoading, setFeedbackLoading] = useState<{
    [key: string]: boolean;
  }>({});

  const fetchCallList = async () => {
    setIsLoading(true);
    if (selectedAssistant === "all-assistants") {
      getCallListApi(currentPage, pageSize)
        .then((res) => {
          if (res?.data) {
            // console.log(res?.data?.data?.calls);
            const calls = res?.data?.data?.calls || [];
            setCallList(calls);
            setFilteredCallList(calls);
            setTotalCalls(res?.data?.data?.total || 0);
          }
        })
        .catch((err) => {
          // console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      getCallAssistantApi(selectedAssistant, currentPage, pageSize)
        .then((res) => {
          if (res?.data) {
            // console.log(res?.data?.data?.calls);
            const calls = res?.data?.data?.calls || [];
            setCallList(calls);
            setFilteredCallList(calls);
            setTotalCalls(res?.data?.data?.total || 0);
          }
        })
        .catch((err) => {
          // console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  // const fetchCallList = async () => {
  //   setIsLoading(true);
  //   try {
  //     let response;
  //     if (selectedAssistant === "all-assistants") {
  //       response = await axios.get(
  //         `${url}api/v1/call/list?page=${currentPage}&limit=${pageSize}`,
  //         {
  //           headers: {
  //             Accept: "application/json",
  //             "ngrok-skip-browser-warning": "69420",
  //           },
  //         }
  //       );
  //     } else {
  //       response = await axios.get(
  //         `${url}api/v1/call/assistant/${selectedAssistant}?page=${currentPage}&limit=${pageSize}`,
  //         {
  //           headers: {
  //             Accept: "application/json",
  //             "ngrok-skip-browser-warning": "69420",
  //           },
  //         }
  //       );
  //     }

  //     const calls = response?.data?.data?.calls || [];
  //     setCallList(calls);
  //     setFilteredCallList(calls);
  //     setTotalCalls(response?.data?.data?.total || 0);

  //     console.log(calls);
  //   } catch (err) {
  //     console.log(err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchAssistants = () => {
    const page = 1;
    const page_size = 100;
    setAssistantsLoading(true);
    getAssistantListApi(page, page_size)
      .then((res) => {
        if (res?.data) {
          // console.log("res?.data", res?.data);
          setAssistantsList(res?.data?.data?.assistants);
        }
      })
      .catch((err) => {
        console.log("err", err);
      })
      .finally(() => {
        setAssistantsLoading(false);
      });
  };

  useEffect(() => {
    fetchCallList();
  }, [selectedAssistant, currentPage, pageSize]);

  useEffect(() => {
    fetchAssistants();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCallList(callList);
      setTotalCalls(callList.length);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = callList.filter(
        (call: any) =>
          (call.patientName &&
            call.patientName.toLowerCase().includes(lowercasedQuery)) ||
          (call.patientPhone &&
            call.patientPhone.toLowerCase().includes(lowercasedQuery)) ||
          (call.assistant &&
            call.assistant.toLowerCase().includes(lowercasedQuery)) ||
          (call.dateTime &&
            call.dateTime.toLowerCase().includes(lowercasedQuery)) ||
          (call.type && call.type.toLowerCase().includes(lowercasedQuery)) ||
          (call.status && call.status.toLowerCase().includes(lowercasedQuery))
      );
      setFilteredCallList(filtered);
      setTotalCalls(filtered.length);
    }
    setCurrentPage(1);
  }, [searchQuery, callList]);

  const totalPages = Math.ceil(totalCalls / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePlayRecording = (recordingUrl: string, callId: string) => {
    if (currentlyPlaying === callId) {
      // Pause the current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentlyPlaying(null);
    } else {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Create and play new audio
      audioRef.current = new Audio(recordingUrl);
      audioRef.current.play();
      setCurrentlyPlaying(callId);

      // Add event listener to reset when audio ends
      audioRef.current.addEventListener("ended", () => {
        setCurrentlyPlaying(null);
      });
    }
  };

  //  this is handel  save feed back button bhai

  // const handleSaveFeedback = async (callId: string) => {
  //   const feedback = feedbacks[callId] || "";
  //   if (!feedback.trim()) {
  //     alert("Please enter feedback before saving");
  //     return;
  //   }

  //   try {
  //     // Set this call's feedback button loading to true
  //     setFeedbackLoading((prev) => ({ ...prev, [callId]: true }));

  //     const payload = {
  //       call_id: callId,
  //       feedback: feedback,
  //     };

  //     const result = await axios.post(`${url}api/v1/call/feedback`, payload);

  //     console.log("Feedback saved:", result);
  //   } catch (err) {
  //     console.error("Error saving feedback:", err);
  //   } finally {
  //     // Set loading to false after response/error
  //     setFeedbackLoading((prev) => ({ ...prev, [callId]: false }));
  //   }
  // };

  const handleSaveFeedback = async (callId: string) => {
    const feedback = feedbacks[callId] || "";
    if (!feedback.trim()) {
      alert("Please enter feedback before saving");
      return;
    }
    try {
      // Set this call's feedback button loading to true
      setFeedbackLoading((prev) => ({ ...prev, [callId]: true }));
      const payload = {
        feedback: feedback,
      };
      // console.log("this is id..12121", callId);
      // return;
      // const result = await axios.post(`${url}api/v1/call/feedback`, payload);
      const result = await feedbackApi(callId, payload);

      console.log("Feedback saved:", result);
    } catch (err) {
      console.error("Error saving feedback:", err);
    } finally {
      // Set loading to false after response/error
      setFeedbackLoading((prev) => ({ ...prev, [callId]: false }));
    }
  };

  // console.log("call list", callList);

  useEffect(() => {
    if (callList.length > 0) {
      const initialFeedbacks: { [key: string]: string } = {};
      callList.forEach((call: any) => {
        if (call.feedback) {
          initialFeedbacks[call.id] = call.feedback;
        }
      });
      setFeedbacks(initialFeedbacks);
    }
  }, [callList]);

  return (
    <div id="main-content" className="flex-1 overflow-auto h-full bg-gray-100">
      {/* header start */}
      <div className="w-full flex items-center justify-between py-4 px-8 border-b bg-white">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Call Logs</h2>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all your call recordings
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* <div className="relative">
            <Input
              type="text"
              placeholder="Search calls..."
              className="pl-10 pr-4 py-2.5 bg-gray-50 text-sm rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={isLoading || callList.length === 0}
            />
            <Search className="absolute left-3.5 top-3 text-gray-400 h-4 w-4" />
          </div>  */}
          <Select
            defaultValue="all-assistants"
            onValueChange={(value) => setSelectedAssistant(value)}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="All Assistants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-assistants">All Assistants</SelectItem>
              {assistantsList.map((assistant: any) => (
                <SelectItem key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div id="call-logs-content" className="p-8 h-full">
        <div id="call-logs-table" className="h-full">
          <div className="mb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">
                  All Call Logs
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl"
                  onClick={() => fetchCallList()}
                >
                  <RotateCw className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Showing{" "}
                {totalCalls > 0
                  ? `${(currentPage - 1) * pageSize + 1}-${Math.min(
                      currentPage * pageSize,
                      totalCalls
                    )} of ${totalCalls}`
                  : "0"}{" "}
                calls
              </p>
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <DataTable
              columns={getColumns(
                handlePlayRecording,
                currentlyPlaying,
                assistantsList,
                router,
                feedbacks,
                setFeedbacks,
                handleSaveFeedback,
                feedbackLoading,
                setFeedbackLoading
              )}
              data={filteredCallList}
              className="rounded-2xl shadow-sm"
            />
          )}
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      className={`px-3 py-1.5 text-sm ${
                        currentPage === pageNum
                          ? "text-white bg-indigo-600"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      } rounded-lg`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    ...
                  </Button>
                )}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
              <Select
                defaultValue={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[150px] bg-white">
                  <SelectValue placeholder={`${pageSize} per page`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallLogs;
