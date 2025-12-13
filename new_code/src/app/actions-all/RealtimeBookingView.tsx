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
} from "lucide-react";
import { useEffect, useState } from "react";
import { getActionsApi } from "@/network/Api";
import { toast } from "@/hooks/use-toast";

const RealtimeBookingView = () => {
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
              action.atype === "calendar_availability"
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

  const getActionIcon = (atype: string) => {
    switch (atype) {
      case "calendar_booking":
        return CalendarDays;
      case "calendar_availability":
        return CheckCircle;
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
    // Handle delete action here
    console.log(`Deleting action ${actionName} with ID: ${actionId}`);
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
    <div className="flex-1 overflow-y-auto bg-gray-100">
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
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Action
            </Button>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="text-gray-500">Loading actions...</div>
            </div>
          ) : actions.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="text-gray-500">No calendar actions found</div>
            </div>
          ) : (
            actions.map((action: any, index: number) => {
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
                            className="h-7 px-3 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                          >
                            <Edit className="h-3 w-3 mr-1.5" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash className="h-3 w-3" />
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
                                >
                                  Delete
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

export default RealtimeBookingView;
