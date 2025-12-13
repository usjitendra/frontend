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
  PhoneForwarded,
  CheckCircle,
  Clock,
  Loader2,
  ChevronDown,
  RotateCcw,
  X,
  Users,
  PhoneCall,
  PlusCircleIcon,
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

const CallTransferPage = () => {
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
          // Filter actions to only show transfer call-related ones
          const transferActions = allActions.filter(
            (action: any) => action.type === "transferCall"
          );
          setActions(transferActions);
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
  const hasTransferAction = actions.some((action: any) =>
    action.name?.includes("transfer_call")
  );
  const hasForwardAction = actions.some((action: any) =>
    action.name?.includes("forward_call")
  );
  const hasLiveAgentAction = actions.some((action: any) =>
    action.name?.includes("live_agent")
  );
  const hasAllActions =
    hasTransferAction && hasForwardAction && hasLiveAgentAction;

  const getActionIcon = (action: any) => {
    const actionName = action.name?.toLowerCase() || "";
    if (
      actionName.includes("transfer_call") ||
      actionName.includes("transfer_to")
    ) {
      return PhoneForwarded;
    } else if (actionName.includes("forward_call")) {
      return PhoneCall;
    } else if (actionName.includes("live_agent")) {
      return Users;
    }
    return PhoneForwarded;
  };

  const getActionIconBg = (action: any) => {
    const actionName = action.name?.toLowerCase() || "";
    if (
      actionName.includes("transfer_call") ||
      actionName.includes("transfer_to")
    ) {
      return "from-amber-500 to-amber-600";
    } else if (actionName.includes("forward_call")) {
      return "from-blue-500 to-blue-600";
    } else if (actionName.includes("live_agent")) {
      return "from-emerald-500 to-emerald-600";
    }
    return "from-gray-500 to-gray-600";
  };

  const getActionTitle = (action: any) => {
    const actionName = action.name?.toLowerCase() || "";
    if (
      actionName.includes("transfer_call") ||
      actionName.includes("transfer_to")
    ) {
      return "Call Transfer";
    } else if (actionName.includes("forward_call")) {
      return "Call Forwarding";
    } else if (actionName.includes("live_agent")) {
      return "Live Agent Transfer";
    }
    return action.name || "Unknown Action";
  };

  const getActionDescription = (action: any) => {
    if (action.function?.description) {
      return action.function.description;
    }
    if (action.destinations?.[0]?.description) {
      return action.destinations[0].description;
    }
    return "No description available";
  };

  const getDestinationNumber = (action: any) => {
    if (action.destinations?.[0]?.number) {
      return action.destinations[0].number;
    }
    return "No number specified";
  };

  const getTransferMessage = (action: any) => {
    if (action.destinations?.[0]?.transfer_plan?.message) {
      return action.destinations[0].transfer_plan.message;
    }
    return "No transfer message";
  };

  const getActionParameters = (action: any) => {
    // For transfer call actions, parameters are in the destinations array
    if (action.destinations && action.destinations.length > 0) {
      const destination = action.destinations[0];
      const params = [];
      if (destination.number) params.push("destination_number");
      if (destination.transfer_plan?.message) params.push("transfer_message");
      return params;
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

  const handleCreateCallTransferAction = () => {
    setIsLoading(true);
    const payload = {
      type: "transferCall",
      name: "transfer_call_to_destination",
      async_: null,
      messages: [
        {
          contents: null,
          content: "Please wait while I transfer your call.",
          conditions: null,
          type: "request-start",
          blocking: true,
        },
        {
          contents: null,
          content: "Call transferred successfully",
          conditions: null,
          type: "request-complete",
          role: null,
          end_call_after_spoken_enabled: false,
        },
        {
          contents: null,
          content: "Failed to transfer call",
          conditions: null,
          type: "request-failed",
          end_call_after_spoken_enabled: true,
        },
      ],
      function: {
        name: "transfer_call_to_destination",
      },
      config: null,
      folder_id: null,
      destinations: [
        {
          message: null,
          description: "Use this tool to transfer call to destination",
          type: "number",
          number: "+16474616565",
          transfer_plan: {
            mode: "blind-transfer",
            message: "Transferred call",
          },
        },
      ],
    };

    createActionApi(payload)
      .then((res: any) => {
        if (res.data) {
          setIsLoading(false);
          toast({
            title: "Call transfer action created successfully",
            description: "Call transfer action created successfully",
            variant: "default",
          });
          fetchActions();
        }
      })
      .catch((err: any) => {
        setIsLoading(false);
        console.log(err);
        toast({
          title: "Failed to create call transfer action",
          description:
            "Failed to create call transfer action. Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleCreateCallForwardAction = () => {
    setIsLoading(true);
    const payload = {
      type: "transferCall",
      name: "forward_call_to_destination",
      async_: null,
      messages: [
        {
          contents: null,
          content: "Please wait while I forward your call.",
          conditions: null,
          type: "request-start",
          blocking: true,
        },
        {
          contents: null,
          content: "Call forwarded successfully",
          conditions: null,
          type: "request-complete",
          role: null,
          end_call_after_spoken_enabled: false,
        },
        {
          contents: null,
          content: "Failed to forward call",
          conditions: null,
          type: "request-failed",
          end_call_after_spoken_enabled: true,
        },
      ],
      function: {
        name: "forward_call_to_destination",
      },
      config: null,
      folder_id: null,
      destinations: [
        {
          message: null,
          description: "Use this tool to forward call to destination",
          type: "number",
          number: "+16474616565",
          transfer_plan: {
            mode: "blind-transfer",
            message: "Forwarded call",
          },
        },
      ],
    };

    createActionApi(payload)
      .then((res: any) => {
        if (res.data) {
          setIsLoading(false);
          toast({
            title: "Call forward action created successfully",
            description: "Call forward action created successfully",
            variant: "default",
          });
          fetchActions();
        }
      })
      .catch((err: any) => {
        setIsLoading(false);
        console.log(err);
        toast({
          title: "Failed to create call forward action",
          description:
            "Failed to create call forward action. Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleCreateLiveAgentTransferAction = () => {
    setIsLoading(true);
    const payload = {
      type: "transferCall",
      name: "transfer_to_live_agent",
      async_: null,
      messages: [
        {
          contents: null,
          content: "Please wait while I connect you to a live agent.",
          conditions: null,
          type: "request-start",
          blocking: true,
        },
        {
          contents: null,
          content: "Connected to live agent successfully",
          conditions: null,
          type: "request-complete",
          role: null,
          end_call_after_spoken_enabled: false,
        },
        {
          contents: null,
          content: "Failed to connect to live agent",
          conditions: null,
          type: "request-failed",
          end_call_after_spoken_enabled: true,
        },
      ],
      function: {
        name: "transfer_to_live_agent",
      },
      config: null,
      folder_id: null,
      destinations: [
        {
          message: null,
          description: "Use this tool to transfer call to live agent",
          type: "number",
          number: "+16474616565",
          transfer_plan: {
            mode: "blind-transfer",
            message: "Transferred to live agent",
          },
        },
      ],
    };

    createActionApi(payload)
      .then((res: any) => {
        if (res.data) {
          setIsLoading(false);
          toast({
            title: "Live agent transfer action created successfully",
            description: "Live agent transfer action created successfully",
            variant: "default",
          });
          fetchActions();
        }
      })
      .catch((err: any) => {
        setIsLoading(false);
        console.log(err);
        toast({
          title: "Failed to create live agent transfer action",
          description:
            "Failed to create live agent transfer action. Please try again.",
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
              <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white bg-amber-500">
                <PhoneForwarded className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Call Transfer
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage call transfer and forwarding workflows
                </p>
              </div>
            </div>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => router.push("/actions-all/call-transfer/create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Action
              <PlusCircleIcon className="h-4 w-4 ml-2" />
            </Button>
            {/* <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {!hasTransferAction && (
                                    <DropdownMenuItem
                                        onClick={() => handleCreateCallTransferAction()}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <div className="h-7 w-7 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white">
                                            <PhoneForwarded className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Call Transfer Action</div>
                                        </div>
                                    </DropdownMenuItem>
                                )}
                                {!hasForwardAction && (
                                    <DropdownMenuItem
                                        onClick={() => handleCreateCallForwardAction()}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                            <PhoneCall className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Call Forward Action</div>
                                        </div>
                                    </DropdownMenuItem>
                                )}
                                {!hasLiveAgentAction && (
                                    <DropdownMenuItem
                                        onClick={() => handleCreateLiveAgentTransferAction()}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <div className="h-7 w-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Live Agent Transfer</div>
                                        </div>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => router.push("/actions-all/call-transfer/create")}
                                    className="flex items-center gap-3 cursor-pointer"
                                >
                                    <div className="h-7 w-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                        <Plus className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Custom Action</div>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu> */}
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
              <div className="text-gray-500">
                No call transfer actions found
              </div>
            </div>
          ) : (
            actions?.map((action: any, index: number) => {
              const ActionIcon = getActionIcon(action);
              const iconBg = getActionIconBg(action);
              const title = getActionTitle(action);
              const parameters = getActionParameters(action);
              const createdDate = formatDate(action.created_at);

              return (
                <Card
                  key={action.id || index}
                  className="group hover:shadow-lg hover:border-amber-200 transition-all duration-300 h-[400px] flex flex-col"
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
                            {action.name
                              ?.replace(/_/g, " ")
                              .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </h3>
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500"></div>
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 flex-grow">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <PhoneForwarded className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Description
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {getActionDescription(action)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <PhoneCall className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Destination
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          {getDestinationNumber(action)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <PhoneForwarded className="h-3 w-3 text-gray-400" />
                          <span>Created {createdDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const actionName =
                                action.name?.toLowerCase() || "";
                              let atype = "call_transfer";
                              if (actionName.includes("forward_call")) {
                                atype = "call_forward";
                              } else if (actionName.includes("live_agent")) {
                                atype = "live_agent_transfer";
                              }
                              router.push(
                                `/actions-all/call-transfer/create?actionId=${action.id}&atype=${atype}`
                              );
                            }}
                            className="h-7 px-3 text-amber-700 bg-amber-50 hover:bg-amber-100"
                          >
                            <Edit className="h-3 w-3 mr-1.5" />
                            Edit
                          </Button>
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

export default CallTransferPage;
