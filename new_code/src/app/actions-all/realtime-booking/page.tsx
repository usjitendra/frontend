// *********  real time booking...........

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Edit,
  Copy,
  Trash,
  CalendarDays,
  CheckCircle,
  Clock,
  Loader2,
  ChevronDown,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getActionsApi, deleteActionApi, createActionApi } from "@/network/Api";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RealtimeBookingPage = () => {
  const router = useRouter();
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchActions = () => {
    setIsLoading(true);
    getActionsApi()
      .then((res: any) => {
        if (res.data) {
          const allActions = res.data?.data?.actions || [];
          // Filter actions to only show calendar-related ones
          const calendarActions = allActions.filter(
            (action: any) =>
              action.atype === "calendar_booking" ||
              action.atype === "calendar_availability" ||
              action.atype === "calendar_reschedule" ||
              action.atype === "calendar_cancel"
            // || action.atype === 'calendar_booking_lookup'
          );
          setActions(calendarActions);
        }
      })
      .catch((err: any) => {
        console.log(err);
        toast({
          title: "Failed to fetch actions",
          description: "Please try again later",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchActions();
  }, []);

  // Check if specific action types exist
  const hasBookingAction = actions.some(
    (action: any) => action.atype === "calendar_booking"
  );
  const hasAvailabilityAction = actions.some(
    (action: any) => action.atype === "calendar_availability"
  );
  const hasRescheduleAction = actions.some(
    (action: any) => action.atype === "calendar_reschedule"
  );
  const hasCancelAction = actions.some(
    (action: any) => action.atype === "calendar_cancel"
  );
  const hasAllActions =
    hasBookingAction &&
    hasAvailabilityAction &&
    hasRescheduleAction &&
    hasCancelAction;

  const getActionIcon = (atype: string) => {
    switch (atype) {
      case "calendar_booking":
        return CalendarDays;
      case "calendar_availability":
        return CheckCircle;
      case "calendar_reschedule":
        return RotateCcw;
      case "calendar_cancel":
        return X;
      default:
        return Clock;
    }
  };

  const getActionIconBg = (atype: string) => {
    switch (atype) {
      case "calendar_booking":
        return "from-blue-500 to-blue-600";
      case "calendar_availability":
        return "from-emerald-500 to-emerald-600";
      case "calendar_reschedule":
        return "from-orange-500 to-orange-600";
      case "calendar_cancel":
        return "from-red-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getActionTitle = (action: any) => {
    switch (action.atype) {
      case "calendar_booking":
        return "Booking Appointments";
      case "calendar_availability":
        return "Check Availability";
      case "calendar_reschedule":
        return "Reschedule Appointment";
      case "calendar_cancel":
        return "Cancel Appointment";
      default:
        return action.name || "Unknown Action";
    }
  };

  const getActionParameters = (action: any) => {
    if (action.function?.parameters?.properties) {
      return Object.keys(action.function.parameters.properties);
    }
    return [];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const handleDelete = (actionId: string, actionName: string) => {
    setIsDeleting(actionId);
    deleteActionApi(actionId)
      .then((res: any) => {
        if (res.data) {
          toast({
            title: "Action deleted successfully",
            description: "The action has been removed from your list",
            variant: "default",
          });
          fetchActions();
        }
      })
      .catch((err: any) => {
        console.log(err);
        toast({
          title: "Action deletion failed",
          description: "Failed to delete action. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsDeleting(null);
      });
  };

  const handleCreateGetUserBookingAction = () => {
    setIsLoading(true);
    const payload = {
      type: "function",
      atype: "calendar_booking_lookup",
      async: false,
      name: "calendar_booking_lookup",
      function: {
        name: "calendar_booking_lookup",
        strict: false,
        description:
          "Use this function to get the booking details of a user. Ensure that phone number of user is provided when calling this function to avoid errors.",
        parameters: {
          type: "object",
          properties: {
            phone_number: {
              type: "string",
              description: "The phone number of the user",
            },
          },
          required: ["phone_number"],
        },
      },
      messages: [
        {
          content: "Please wait while while I look up the booking details.",
          type: "request-start",
          blocking: true,
        },
        // {
        //     "content": "Here is the booking details.",
        //     "type": "request-complete",
        //     "end_call_after_spoken_enabled": false
        // },
        {
          content: "Failed to find booking details",
          type: "request-failed",
          end_call_after_spoken_enabled: true,
        },
      ],
    };

    createActionApi(payload)
      .then((res: any) => {
        if (res.data) {
          handleCreateRescheduleAction();
        }
      })
      .catch((err: any) => {
        setIsLoading(false);
        console.log(err);
        toast({
          title: "Failed to create calendar booking lookup action",
          description:
            "Failed to create calendar booking lookup action. Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleCreateRescheduleAction = () => {
    const payload = {
      type: "function",
      atype: "calendar_reschedule",
      async: false,
      name: "calendar_reschedule",
      function: {
        name: "calendar_reschedule",
        strict: false,
        description:
          "Use this function to reschedule an appointment in a calendar system. Ensure that start_time and end_time include time zone (in ISO 8601 format). All required fields must be provided when calling this function to avoid errors.",
        parameters: {
          type: "object",
          properties: {
            booking_id: {
              type: "string",
              description: "The ID of the appointment to reschedule",
            },
            start_time: {
              type: "string",
              description: "The new start time for the appointment",
            },
          },
          required: ["booking_id", "start_time"],
        },
      },
      messages: [
        {
          content: "Please wait while I reschedule the appointment",
          type: "request-start",
          blocking: true,
        },
        {
          content: "Appointment rescheduled successfully",
          type: "request-complete",
          end_call_after_spoken_enabled: false,
        },
        {
          content: "Failed to reschedule appointment",
          type: "request-failed",
          end_call_after_spoken_enabled: true,
        },
      ],
    };

    createActionApi(payload)
      .then((res: any) => {
        if (res.data) {
          setIsLoading(false);
          toast({
            title: "Reschedule action created successfully",
            description: "Reschedule action created successfully",
            variant: "default",
          });
          fetchActions();
        }
      })
      .catch((err: any) => {
        setIsLoading(false);
        console.log(err);
        toast({
          title: "Failed to create reschedule action",
          description: "Failed to create reschedule action. Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleCancelAppointmentAction = () => {
    setIsLoading(true);
    const payload = {
      type: "function",
      atype: "calendar_cancel",
      async: false,
      name: "calendar_cancel",
      function: {
        name: "calendar_cancel",
        strict: false,
        description:
          "Use this function to cancel an appointment in a calendar system. Ensure that booking_id is provided when calling this function to avoid errors.",
        parameters: {
          type: "object",
          properties: {
            booking_id: {
              type: "string",
              description: "The ID of the appointment to cancel",
            },
          },
          required: ["booking_id"],
        },
      },
      messages: [
        {
          content: "Please wait while I cancel the appointment",
          type: "request-start",
          blocking: true,
        },
        {
          content: "Appointment cancelled successfully",
          type: "request-complete",
          end_call_after_spoken_enabled: false,
        },
        {
          content: "Failed to cancel appointment",
          type: "request-failed",
          end_call_after_spoken_enabled: true,
        },
      ],
    };

    createActionApi(payload)
      .then((res: any) => {
        if (res.data) {
          setIsLoading(false);
          toast({
            title: "Cancel appointment action created successfully",
            description: "Cancel appointment action created successfully",
            variant: "default",
          });
          fetchActions();
        }
      })
      .catch((err: any) => {
        setIsLoading(false);
        console.log(err);
        toast({
          title: "Failed to create cancel appointment action",
          description:
            "Failed to create cancel appointment action. Please try again.",
          variant: "destructive",
        });
      });
  };

  const renderParameters = (parameters: string[]) => {
    const maxVisible = 5;
    const visibleParams = parameters.slice(0, maxVisible);
    const remainingCount = parameters.length - maxVisible;

    return (
      <div className="flex flex-wrap gap-2">
        {visibleParams.map((param: string, paramIndex: number) => (
          <Badge
            key={paramIndex}
            variant="outline"
            className="text-xs text-black"
          >
            {param.replace(/_/g, " ")}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-xs cursor-cell bg-gray-50 hover:bg-gray-100 text-black"
                >
                  +{remainingCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs bg-white border border-gray-200 shadow-md"
              >
                <div className="space-y-1">
                  <p className="text-xs font-medium text-black">
                    All Parameters:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {parameters.map((param: string, index: number) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 px-2 py-1 rounded text-black"
                      >
                        {param.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100 w-full">
      <div className="">
        {/* Header */}
        <div className="mb-6 bg-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white bg-indigo-500">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Realtime Booking
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Schedule appointments and manage booking
                </p>
              </div>
            </div>
            {!hasAllActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Action
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {!hasBookingAction && (
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          "/actions-all/realtime-booking/create?atype=calendar_booking"
                        )
                      }
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Booking Action
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}
                  {!hasAvailabilityAction && (
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          "/actions-all/realtime-booking/create?atype=calendar_availability"
                        )
                      }
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className="h-7 w-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Check Availability Action
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}
                  {!hasRescheduleAction && (
                    <DropdownMenuItem
                      onClick={() => handleCreateGetUserBookingAction()}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className="h-7 w-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                        <RotateCcw className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Reschedule Appointment
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}
                  {!hasCancelAction && (
                    <DropdownMenuItem
                      onClick={() => handleCancelAppointmentAction()}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className="h-7 w-7 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white">
                        <X className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Cancel Appointment
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="text-gray-500">Loading actions...</div>
            </div>
          ) : actions?.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="text-gray-500">No calendar actions found</div>
            </div>
          ) : (
            actions?.map((action: any, index: number) => {
              const ActionIcon = getActionIcon(action.atype);
              const iconBg = getActionIconBg(action.atype);
              const title = getActionTitle(action);
              const parameters = getActionParameters(action);
              const createdDate = formatDate(action.created_at);

              return (
                <Card
                  key={action.id || index}
                  className="group hover:shadow-lg hover:border-indigo-200 transition-all duration-300 h-[280px] flex flex-col"
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-12 w-12 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}
                        >
                          <ActionIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {title}
                          </h3>
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500"></div>
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 flex-grow">
                      {parameters.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <CalendarDays className="h-3 w-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Required Parameters
                            </span>
                          </div>
                          {renderParameters(parameters)}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <CalendarDays className="h-3 w-3 text-gray-400" />
                          <span>Created {createdDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/actions-all/realtime-booking/create?actionId=${action.id}&atype=${action.atype}`
                              )
                            }
                            className="h-7 px-3 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                          >
                            <Edit className="h-3 w-3 mr-1.5" />
                            Edit
                          </Button>
                          {/* <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <Copy className="h-3 w-3" />
                                                    </Button> */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-red-500 hover:bg-red-50"
                              >
                                {isDeleting === action.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash className="h-3 w-3" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the "{title}" action and
                                  remove all associated data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(action.id, title)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={isDeleting === action.id}
                                >
                                  {isDeleting === action.id ? (
                                    <>
                                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeBookingPage;

///******onely tools show  */

// "use client";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";
// import {
//   Plus,
//   MoreVertical,
//   Edit,
//   Copy,
//   Trash,
//   Bell,
//   Users,
//   Mail,
//   MessageSquare,
//   CalendarDays,
// } from "lucide-react";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "@/hooks/use-toast";
// import { Loader2 } from "lucide-react";
// const baseUrl = process.env.NEXT_PUBLIC_API_URL_TOOLS;

// const CreateToolsPage = () => {
//   const router = useRouter();
//   const [tools, setTools] = useState<any[]>([]);
//   const [cards, setCards] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // 🟢 Edit Function
//   const handleEdit = (card: any) => {
//     console.log("card", card);
//     const params = new URLSearchParams({
//       actionId: JSON.stringify(card),
//       atype: "Edit",
//     });
//     router.push(`/actions-all/create-tools/create?${params.toString()}`);
//   };

//   const fetchTools = async () => {
//     try {
//       // console.log("Fetching all tools...");
//       const response = await axios.get(`${baseUrl}tools`, {
//         headers: {
//           Accept: "application/json",
//           "ngrok-skip-browser-warning": "69420",
//         },
//       });

//       // console.log("Tools Data:", response?.data?.tools);
//       if (response.data?.tools) {
//         setIsLoading(false);
//         setTools(response.data.tools);

//         const cardsData = response.data.tools.map(
//           (tool: any, index: number) => {
//             const parameters = tool?.body?.properties
//               ? Object.keys(tool.body.properties)
//               : [];

//             return {
//               id: index + 1,
//               title: tool?.name || "Untitled Tool",
//               description: tool?.description || "No description available",
//               icon: Bell, // default icon (can make dynamic later)
//               iconBg: "from-amber-500 to-amber-600",
//               status: "Active",
//               firestore_doc_id: tool?.firestore_doc_id || "",
//               url: tool?.url || "",
//               method: tool?.method || "GET",
//               parameters, // dynamic parameters
//               createdDate: new Date().toDateString(),
//             };
//           }
//         );

//         setCards(cardsData);
//       }
//     } catch (error) {
//       console.error("Error fetching tools:", error);
//     }
//   };

//   useEffect(() => {
//     fetchTools();
//   }, []); // Only run once on mount

//   // 🟥 Delete Function
//   type ToolId = {
//     firestore_doc_id: string;
//   };

//   const handleDelete = async (tool: ToolId) => {
//     if (confirm("Are you sure you want to delete this item?")) {
//       try {
//         console.log("Deleting item with ID:", tool.firestore_doc_id);

//         const result = await axios.delete(
//           `${baseUrl}tools/${tool.firestore_doc_id}`
//         );

//         if (result.data.status === "success") {
//           toast({
//             title: "Tools deleted successfully!",
//           });

//           fetchTools();
//         } else {
//           toast({
//             title: "Failed to delete item",
//             description: result.data.message || "Something went wrong",
//             variant: "destructive",
//           });
//         }
//       } catch (error) {
//         console.error("Error deleting item:", error);
//       }
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="w-full flex h-screen items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (

//     <div className="flex-1 overflow-y-auto bg-gray-100">
//       <div className="">
//         {/* Header */}
//         <div className="mb-6 bg-white p-6">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3">
//               <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white bg-amber-500">
//                 <Bell className="h-5 w-5" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">All Tools</h1>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Alert users and teams with automated notifications
//                 </p>
//               </div>
//             </div>
//             <Button
//               onClick={() => router.push("/actions-all/create-tools/create")}
//               className="bg-amber-600 hover:bg-amber-700"
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Create New Tool
//             </Button>
//           </div>
//         </div>

//         {/* Action Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
//           {cards?.map((card) => {
//             const CardIcon = card.icon;
//             return (
//               <Card
//                 key={card.id}
//                 className="group hover:shadow-lg hover:border-amber-200 transition-all duration-300"
//               >
//                 <CardContent className="p-6">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex items-center gap-4">
//                       <div
//                         className={`h-12 w-12 bg-gradient-to-br ${card.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}
//                       >
//                         <CardIcon className="h-6 w-6" />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-gray-900 text-lg mb-1">
//                           {card.title.length > 15
//                             ? card.title.slice(0, 15) + "..."
//                             : card.title}
//                         </h3>
//                         <Badge
//                           className={`${
//                             card.status === "Active"
//                               ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
//                               : "bg-gray-100 text-gray-600 hover:bg-gray-100"
//                           }`}
//                         >
//                           <div
//                             className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
//                               card.status === "Active"
//                                 ? "bg-emerald-500"
//                                 : "bg-gray-400"
//                             }`}
//                           ></div>
//                           {card.status}
//                         </Badge>
//                       </div>
//                     </div>
//                     <Button variant="ghost" size="icon" className="h-8 w-8">
//                       <MoreVertical className="h-4 w-4" />
//                     </Button>
//                   </div>

//                   <p className="text-sm text-gray-600 mb-6 leading-relaxed">
//                     {card.description}
//                   </p>

//                   <div className="space-y-4">
//                     <div>
//                       <div className="flex items-center gap-2 mb-3">
//                         <Bell className="h-3 w-3 text-gray-400" />
//                         <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                           Required Parameters
//                         </span>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         {card.parameters.map(
//                           (param: string, paramIndex: number) => (
//                             <Badge
//                               key={paramIndex}
//                               variant="outline"
//                               className="text-xs"
//                             >
//                               {param}
//                             </Badge>
//                           )
//                         )}
//                       </div>
//                     </div>

//                     <div className="pt-4 border-t border-gray-100">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-1 text-xs text-gray-500">
//                           {/* <CalendarDays className="h-3 w-3 text-gray-400" /> */}
//                           {/* <span>Created {card.createdDate}</span> */}
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Button
//                             onClick={() => handleEdit(card)}
//                             variant="ghost"
//                             size="sm"
//                             className="h-7 px-3 text-amber-700 bg-amber-50 hover:bg-amber-100"
//                           >
//                             <Edit className="h-3 w-3 mr-1.5" />
//                             Edit
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="h-7 w-7 hover:text-red-500 hover:bg-red-50"
//                             onClick={() => handleDelete(card)}
//                           >
//                             <Trash className="h-3 w-3" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateToolsPage;

// "use client";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";
// import {
//   Plus,
//   MoreVertical,
//   Edit,
//   Copy,
//   Trash,
//   Bell,
//   Users,
//   Mail,
//   MessageSquare,
//   CalendarDays,
//   CheckCircle,
//   Clock,
//   RotateCcw,
//   X,
//   ChevronDown,
//   Loader2,
// } from "lucide-react";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "@/hooks/use-toast";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";

// const baseUrl = process.env.NEXT_PUBLIC_API_URL_TOOLS;

// const CreateToolsPage = () => {
//   const router = useRouter();
//   const [tools, setTools] = useState<any[]>([]);
//   const [cards, setCards] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showFallbackUI, setShowFallbackUI] = useState(false);
//   const [isDeleting, setIsDeleting] = useState<string | null>(null);

//   // 🟢 Edit Function
//   const handleEdit = (card: any) => {
//     console.log("card", card);
//     const params = new URLSearchParams({
//       actionId: JSON.stringify(card),
//       atype: "Edit",
//     });
//     router.push(`/actions-all/create-tools/create?${params.toString()}`);
//   };

//   const fetchTools = async () => {
//     try {
//       const response = await axios.get(`${baseUrl}tools`, {
//         headers: {
//           Accept: "application/json",
//           "ngrok-skip-browser-warning": "69420",
//         },
//       });

//       if (response.data?.tools && response.data.tools.length > 0) {
//         setIsLoading(false);
//         setTools(response.data.tools);

//         const cardsData = response.data.tools.map(
//           (tool: any, index: number) => {
//             const parameters = tool?.body?.properties
//               ? Object.keys(tool.body.properties)
//               : [];

//             return {
//               id: index + 1,
//               title: tool?.name || "Untitled Tool",
//               description: tool?.description || "No description available",
//               icon: Bell, // default icon (can make dynamic later)
//               iconBg: "from-amber-500 to-amber-600",
//               status: "Active",
//               firestore_doc_id: tool?.firestore_doc_id || "",
//               url: tool?.url || "",
//               method: tool?.method || "GET",
//               parameters, // dynamic parameters
//               createdDate: new Date().toDateString(),
//             };
//           }
//         );

//         setCards(cardsData);
//         setShowFallbackUI(false);
//       } else {
//         // No tools data, show fallback UI
//         setShowFallbackUI(true);
//         setIsLoading(false);
//       }
//     } catch (error) {
//       console.error("Error fetching tools:", error);
//       // API call failed, show fallback UI
//       setShowFallbackUI(true);
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTools();
//   }, []); // Only run once on mount

//   // 🟥 Delete Function
//   type ToolId = {
//     firestore_doc_id: string;
//   };

//   const handleDelete = async (tool: ToolId) => {
//     if (confirm("Are you sure you want to delete this item?")) {
//       try {
//         console.log("Deleting item with ID:", tool.firestore_doc_id);

//         const result = await axios.delete(
//           `${baseUrl}tools/${tool.firestore_doc_id}`
//         );

//         if (result.data.status === "success") {
//           toast({
//             title: "Tools deleted successfully!",
//           });

//           fetchTools();
//         } else {
//           toast({
//             title: "Failed to delete item",
//             description: result.data.message || "Something went wrong",
//             variant: "destructive",
//           });
//         }
//       } catch (error) {
//         console.error("Error deleting item:", error);
//       }
//     }
//   };

//   // Fallback UI functions (from the commented code)
//   const getActionIcon = (atype: string) => {
//     switch (atype) {
//       case "calendar_booking":
//         return CalendarDays;
//       case "calendar_availability":
//         return CheckCircle;
//       case "calendar_reschedule":
//         return RotateCcw;
//       case "calendar_cancel":
//         return X;
//       default:
//         return Clock;
//     }
//   };

//   const getActionIconBg = (atype: string) => {
//     switch (atype) {
//       case "calendar_booking":
//         return "from-blue-500 to-blue-600";
//       case "calendar_availability":
//         return "from-emerald-500 to-emerald-600";
//       case "calendar_reschedule":
//         return "from-orange-500 to-orange-600";
//       case "calendar_cancel":
//         return "from-red-500 to-red-600";
//       default:
//         return "from-gray-500 to-gray-600";
//     }
//   };

//   const getActionTitle = (action: any) => {
//     switch (action.atype) {
//       case "calendar_booking":
//         return "Booking Appointments";
//       case "calendar_availability":
//         return "Check Availability";
//       case "calendar_reschedule":
//         return "Reschedule Appointment";
//       case "calendar_cancel":
//         return "Cancel Appointment";
//       default:
//         return action.name || "Unknown Action";
//     }
//   };

//   const getActionParameters = (action: any) => {
//     if (action.function?.parameters?.properties) {
//       return Object.keys(action.function.parameters.properties);
//     }
//     return [];
//   };

//   const formatDate = (dateString: string) => {
//     if (!dateString) return "N/A";
//     try {
//       return new Date(dateString).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     } catch {
//       return "N/A";
//     }
//   };

//   const handleCreateGetUserBookingAction = () => {
//     // Implementation from commented code
//     console.log("Create Get User Booking Action");
//   };

//   const handleCreateRescheduleAction = () => {
//     // Implementation from commented code
//     console.log("Create Reschedule Action");
//   };

//   const handleCancelAppointmentAction = () => {
//     // Implementation from commented code
//     console.log("Cancel Appointment Action");
//   };

//   const renderParameters = (parameters: string[]) => {
//     const maxVisible = 5;
//     const visibleParams = parameters.slice(0, maxVisible);
//     const remainingCount = parameters.length - maxVisible;

//     return (
//       <div className="flex flex-wrap gap-2">
//         {visibleParams.map((param: string, paramIndex: number) => (
//           <Badge
//             key={paramIndex}
//             variant="outline"
//             className="text-xs text-black"
//           >
//             {param.replace(/_/g, " ")}
//           </Badge>
//         ))}
//         {remainingCount > 0 && (
//           <Badge
//             variant="outline"
//             className="text-xs cursor-cell bg-gray-50 hover:bg-gray-100 text-black"
//           >
//             +{remainingCount}
//           </Badge>
//         )}
//       </div>
//     );
//   };

//   // Fallback UI data (from the commented code)
//   const fallbackActions = [
//     {
//       id: 1,
//       atype: "calendar_cancel",
//       name: "Cancel Appointment",
//       created_at: "2025-07-29",
//     },
//     {
//       id: 2,
//       atype: "calendar_availability",
//       name: "Check Availability",
//       created_at: "",
//     },
//     {
//       id: 3,
//       atype: "calendar_booking",
//       name: "Booking Appointments",
//       created_at: "",
//     },
//     {
//       id: 4,
//       atype: "calendar_reschedule",
//       name: "Reschedule Appointment",
//       created_at: "",
//     },
//   ];

//   if (isLoading) {
//     return (
//       <div className="w-full flex h-screen items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 overflow-y-auto bg-gray-100">
//       {showFallbackUI ? (
//         // Fallback UI (from the commented code)
//         <div className="">
//           {/* Header */}
//           <div className="mb-6 bg-white p-6">
//             <div className="flex justify-between items-center">
//               <div className="flex items-center gap-3">
//                 <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white bg-indigo-500">
//                   <CalendarDays className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-900">
//                     Realtime Booking
//                   </h1>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Schedule appointments and manage booking
//                   </p>
//                 </div>
//               </div>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button className="bg-indigo-600 hover:bg-indigo-700">
//                     <Plus className="h-4 w-4 mr-2" />
//                     Create New Action
//                     <ChevronDown className="h-4 w-4 ml-2" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-56">
//                   <DropdownMenuItem
//                     onClick={() =>
//                       router.push(
//                         "/actions-all/realtime-booking/create?atype=calendar_booking"
//                       )
//                     }
//                     className="flex items-center gap-3 cursor-pointer"
//                   >
//                     <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
//                       <CalendarDays className="h-4 w-4" />
//                     </div>
//                     <div>
//                       <div className="font-medium text-gray-900">
//                         Booking Action
//                       </div>
//                     </div>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem
//                     onClick={() =>
//                       router.push(
//                         "/actions-all/realtime-booking/create?atype=calendar_availability"
//                       )
//                     }
//                     className="flex items-center gap-3 cursor-pointer"
//                   >
//                     <div className="h-7 w-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
//                       <CheckCircle className="h-4 w-4" />
//                     </div>
//                     <div>
//                       <div className="font-medium text-gray-900">
//                         Check Availability Action
//                       </div>
//                     </div>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem
//                     onClick={() => handleCreateGetUserBookingAction()}
//                     className="flex items-center gap-3 cursor-pointer"
//                   >
//                     <div className="h-7 w-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
//                       <RotateCcw className="h-4 w-4" />
//                     </div>
//                     <div>
//                       <div className="font-medium text-gray-900">
//                         Reschedule Appointment
//                       </div>
//                     </div>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem
//                     onClick={() => handleCancelAppointmentAction()}
//                     className="flex items-center gap-3 cursor-pointer"
//                   >
//                     <div className="h-7 w-7 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white">
//                       <X className="h-4 w-4" />
//                     </div>
//                     <div>
//                       <div className="font-medium text-gray-900">
//                         Cancel Appointment
//                       </div>
//                     </div>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>

//           {/* Action Cards Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-6">
//             {fallbackActions.map((action: any, index: number) => {
//               const ActionIcon = getActionIcon(action.atype);
//               const iconBg = getActionIconBg(action.atype);
//               const title = getActionTitle(action);
//               const parameters = [
//                 "start time",
//                 "end time",
//                 "provider id",
//                 "service id",
//               ]; // Example parameters
//               const createdDate = formatDate(action.created_at);

//               return (
//                 <Card
//                   key={action.id || index}
//                   className="group hover:shadow-lg hover:border-indigo-200 transition-all duration-300 h-[280px] flex flex-col"
//                 >
//                   <CardContent className="p-6 flex flex-col h-full">
//                     <div className="flex items-start justify-between mb-4">
//                       <div className="flex items-center gap-4">
//                         <div
//                           className={`h-12 w-12 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}
//                         >
//                           <ActionIcon className="h-6 w-6" />
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-gray-900 text-lg mb-1">
//                             {title}
//                           </h3>
//                           <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
//                             <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500"></div>
//                             Active
//                           </Badge>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-4 flex-grow">
//                       {parameters.length > 0 && (
//                         <div>
//                           <div className="flex items-center gap-2 mb-3">
//                             <CalendarDays className="h-3 w-3 text-gray-400" />
//                             <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                               Required Parameters
//                             </span>
//                           </div>
//                           {renderParameters(parameters)}
//                         </div>
//                       )}
//                     </div>

//                     <div className="pt-4 border-t border-gray-100 mt-auto">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-1 text-xs text-gray-500">
//                           <CalendarDays className="h-3 w-3 text-gray-400" />
//                           <span>Created {createdDate}</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             className="h-7 px-3 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
//                           >
//                             <Edit className="h-3 w-3 mr-1.5" />
//                             Edit
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="h-7 w-7 hover:text-red-500 hover:bg-red-50"
//                           >
//                             <Trash className="h-3 w-3" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         </div>
//       ) : (
//         // Main UI with tools data
//         <div className="">
//           {/* Header */}
//           <div className="mb-6 bg-white p-6">
//             <div className="flex justify-between items-center">
//               <div className="flex items-center gap-3">
//                 <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white bg-amber-500">
//                   <Bell className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-900">
//                     All Tools
//                   </h1>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Alert users and teams with automated notifications
//                   </p>
//                 </div>
//               </div>
//               <Button
//                 onClick={() => router.push("/actions-all/create-tools/create")}
//                 className="bg-amber-600 hover:bg-amber-700"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Create New Tool
//               </Button>
//             </div>
//           </div>

//           {/* Action Cards Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
//             {cards?.map((card) => {
//               const CardIcon = card.icon;
//               return (
//                 <Card
//                   key={card.id}
//                   className="group hover:shadow-lg hover:border-amber-200 transition-all duration-300"
//                 >
//                   <CardContent className="p-6">
//                     <div className="flex items-start justify-between mb-4">
//                       <div className="flex items-center gap-4">
//                         <div
//                           className={`h-12 w-12 bg-gradient-to-br ${card.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}
//                         >
//                           <CardIcon className="h-6 w-6" />
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-gray-900 text-lg mb-1">
//                             {card.title.length > 15
//                               ? card.title.slice(0, 15) + "..."
//                               : card.title}
//                           </h3>
//                           <Badge
//                             className={`${
//                               card.status === "Active"
//                                 ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
//                                 : "bg-gray-100 text-gray-600 hover:bg-gray-100"
//                             }`}
//                           >
//                             <div
//                               className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
//                                 card.status === "Active"
//                                   ? "bg-emerald-500"
//                                   : "bg-gray-400"
//                               }`}
//                             ></div>
//                             {card.status}
//                           </Badge>
//                         </div>
//                       </div>
//                       <Button variant="ghost" size="icon" className="h-8 w-8">
//                         <MoreVertical className="h-4 w-4" />
//                       </Button>
//                     </div>

//                     <p className="text-sm text-gray-600 mb-6 leading-relaxed">
//                       {card.description}
//                     </p>

//                     <div className="space-y-4">
//                       <div>
//                         <div className="flex items-center gap-2 mb-3">
//                           <Bell className="h-3 w-3 text-gray-400" />
//                           <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                             Required Parameters
//                           </span>
//                         </div>
//                         <div className="flex flex-wrap gap-2">
//                           {card.parameters.map(
//                             (param: string, paramIndex: number) => (
//                               <Badge
//                                 key={paramIndex}
//                                 variant="outline"
//                                 className="text-xs"
//                               >
//                                 {param}
//                               </Badge>
//                             )
//                           )}
//                         </div>
//                       </div>

//                       <div className="pt-4 border-t border-gray-100">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-1 text-xs text-gray-500">
//                             {/* <CalendarDays className="h-3 w-3 text-gray-400" /> */}
//                             {/* <span>Created {card.createdDate}</span> */}
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Button
//                               onClick={() => handleEdit(card)}
//                               variant="ghost"
//                               size="sm"
//                               className="h-7 px-3 text-amber-700 bg-amber-50 hover:bg-amber-100"
//                             >
//                               <Edit className="h-3 w-3 mr-1.5" />
//                               Edit
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-7 w-7 hover:text-red-500 hover:bg-red-50"
//                               onClick={() => handleDelete(card)}
//                             >
//                               <Trash className="h-3 w-3" />
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreateToolsPage;
