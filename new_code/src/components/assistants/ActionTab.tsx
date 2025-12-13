"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getActionsApi } from "@/network/Api";
import { CheckCircle, Circle, Code, Package, Loader2, ExternalLinkIcon, Calendar, CalendarCheck, Bell, Search, CalendarClock, CalendarX, Clock, Phone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ActionTabProps {
  initialValues: any;
  onFormDataChange: (data: any) => void;
}

const ActionTab = ({ initialValues, onFormDataChange }: ActionTabProps) => {
  const router = useRouter();
  const [actions, setActions] = useState<any>([]);
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("during-call");

  const fetchActions = () => {
    setIsLoading(true);
    getActionsApi().then((res: any) => {
      if (res.data) {
        const allActions = res.data?.data?.actions || [];
        // Filter actions to only show calendar_booking, calendar_availability, notification, or call transfer
        const fetchedActions = allActions.filter((action: any) => 
          action.atype === "calendar_booking" || 
          action.atype === "calendar_availability" || 
          action.atype === "notification" ||
          action.atype === "calendar_booking_lookup" ||
          action.atype === "calendar_reschedule" ||
          action.atype === "calendar_cancel" ||
          action.atype === "call_transfer" ||
          action.type === "transferCall"
        );
        
        // Debug: Log call transfer actions
        const callTransferActions = fetchedActions.filter((action: any) => 
          action.type === "transferCall" || action.atype === "call_transfer"
        );
        console.log("Call transfer actions found:", callTransferActions);
        let initialSelectedIds: string[] = [];

        // Mark actions as selected if they were previously selected
        if (initialValues?.actions && Array.isArray(initialValues.actions) && initialValues.actions.length > 0) {
          initialSelectedIds = initialValues.actions;
          
          // Keep track of fetched action IDs to identify missing ones
          const fetchedActionIds = fetchedActions.map((action: any) => action.id);
          
          // Find actions that exist in initialValues but not in fetched actions (deleted/unknown actions)
          const missingActionIds = initialSelectedIds.filter(id => !fetchedActionIds.includes(id));
          
          // Create placeholder objects for missing actions
          const missingActions = missingActionIds.map(id => ({
            id: id,
            name: `Unknown Action (${id.substring(0, 8)}...)`,
            type: "unknown",
            selected: true,
            isDeleted: true
          }));
          
          // Add selected property to fetched actions
          const updatedActions = fetchedActions.map((action: any) => ({
            ...action,
            selected: initialSelectedIds.includes(action.id)
          }));
          
          // Combine fetched actions with missing action placeholders
          setActions([...updatedActions, ...missingActions]);
          setSelectedActionIds(initialSelectedIds);
        } else {
          setActions(fetchedActions);
        }
        setIsInitialized(true);
      }
    }).catch((err: any) => {
      console.log(err);
      setIsInitialized(true);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchActions();
  }, []);

  // Update form data when selectedActionIds changes, but only after initialization
  useEffect(() => {
    if (isInitialized) {
      onFormDataChange({ actions: selectedActionIds });
    }
  }, [selectedActionIds]);

  const toggleActionSelection = (id: string) => {
    setSelectedActionIds((prevIds) => {
      const newIds = prevIds.includes(id)
        ? prevIds.filter(actionId => actionId !== id)
        : [...prevIds, id];
      
      setActions((prevActions: any) =>
        prevActions.map((action: any) => ({
          ...action,
          selected: newIds.includes(action.id)
        }))
      );
      
      return newIds;
    });
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "api": return "bg-blue-100 text-blue-800";
      case "webhook": return "bg-purple-100 text-purple-800";
      case "email": return "bg-green-100 text-green-800";
      case "sms": return "bg-yellow-100 text-yellow-800";
      case "notification": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  const getActionIcon = (atype: string) => {
    switch (atype) {
      case "calendar_booking":
        return <Calendar className="w-6 h-6 text-blue-600" />;
      case "calendar_availability":
        return <CalendarCheck className="w-6 h-6 text-green-600" />;
      case "notification":
        return <Bell className="w-6 h-6 text-red-600" />;
      case "calendar_booking_lookup":
        return <Search className="w-6 h-6 text-purple-600" />;
      case "calendar_reschedule":
        return <CalendarClock className="w-6 h-6 text-orange-600" />;
      case "calendar_cancel":
        return <CalendarX className="w-6 h-6 text-red-600" />;
      case "transferCall":
        return <Phone className="w-6 h-6 text-teal-600" />;
      case "google_calender":
        return (
          <Image
            src="/Google_cal_logo.webp"
            alt="Google Calendar"
            width={24}
            height={24}
            className="rounded-sm"
          />
        );
      default:
        return <Code className="w-6 h-6 text-indigo-600" />;
    }
  }

  const getIconBackgroundColor = (atype: string) => {
    switch (atype) {
      case "calendar_booking":
        return "bg-blue-50";
      case "calendar_availability":
        return "bg-green-50";
      case "notification":
        return "bg-red-50";
      case "calendar_booking_lookup":
        return "bg-purple-50";
      case "calendar_reschedule":
        return "bg-orange-50";
      case "calendar_cancel":
        return "bg-red-50";
      case "transferCall":
        return "bg-teal-50";
      case "google_calender":
        return "bg-blue-50";
      default:
        return "bg-indigo-50";
    }
  }

  const getActionTypeDisplayText = (atype: string) => {
    switch (atype) {
      case "calendar_booking":
        return "Calendar Booking";
      case "calendar_availability":
        return "Calendar Availability";
      case "notification":
        return "Notification";
      case "calendar_booking_lookup":
        return "Booking Lookup";
      case "calendar_reschedule":
        return "Reschedule";
      case "calendar_cancel":
        return "Cancel Booking";
      case "transferCall":
        return "Transfer Call";
      case "google_calender":
        return "Google Calendar";
      default:
        return atype || "Function";
    }
  }

  const getActionCategory = (action: any) => {
    const atype = action.atype;
    const type = action.type;
    
    // Handle call transfer actions that might have type: "transferCall"
    if (type === "transferCall" || atype === "call_transfer") {
      return 'transferCall';
    }
    
    if (atype?.includes('calendar') || atype === 'google_calender') {
      return 'calendar';
    }
    if (atype === 'notification') {
      return 'notification';
    }
    return 'other';
  }

  const groupActionsByCategory = (actions: any[]) => {
    const grouped = actions.reduce((acc: any, action: any) => {
      const category = getActionCategory(action);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(action);
      return acc;
    }, {});

    return grouped;
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'calendar':
        return {
          title: 'Calendar Actions',
          description: 'Manage appointments, bookings, and availability',
          icon: <Calendar className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'notification':
        return {
          title: 'Notification Actions',
          description: 'Send notifications and alerts',
          icon: <Bell className="w-5 h-5 text-red-600" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'transferCall':
        return {
          title: 'Transfer Call Actions',
          description: 'Manage calls and transfers',
          icon: <Phone className="w-5 h-5 text-teal-600" />,
          bgColor: 'bg-teal-50',
          borderColor: 'border-teal-200'
        };
      case 'other':
        return {
          title: 'Other Actions',
          description: 'Additional custom actions',
          icon: <Code className="w-5 h-5 text-gray-600" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          title: 'Actions',
          description: 'Available actions',
          icon: <Code className="w-5 h-5 text-gray-600" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  }

  const tabs = [
    { id: "during-call", label: "During the call" },
    { id: "after-call", label: "After the call" }
  ];

  return (
    <div className="py-4">
      <div className="px-4 mb-4">
        <div className="flex border-b border-gray-200 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-0 px-3 py-1">
            {selectedActionIds.length} of {actions.length} action{actions.length !== 1 ? 's' : ''} selected
          </Badge>
          <Button className="flex items-center gap-2" onClick={()=>router.push("/actions-all/realtime-booking")}>
            <ExternalLinkIcon size={16} />
            Create Action
          </Button>
        </div>
      </div>

      <ScrollArea className="h-full">
        <div className="space-y-4 px-4">
          {activeTab === "during-call" && (
            <>
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-2 text-gray-600">Loading actions...</span>
                </div>
              ) : actions.length > 0 ? (
                (() => {
                  const groupedActions = groupActionsByCategory(actions);
                  const categoryOrder = ['calendar', 'notification','transferCall', 'other'];
                  
                  return categoryOrder.map(category => {
                    const categoryActions = groupedActions[category];
                    if (!categoryActions || categoryActions.length === 0) return null;
                    
                    const categoryInfo = getCategoryInfo(category);
                    
                    return (
                      <div key={category} className="mb-8">
                        <div className={`flex items-center gap-3 p-4 rounded-lg border ${categoryInfo.borderColor} ${categoryInfo.bgColor} mb-4`}>
                          {categoryInfo.icon}
                          <div>
                            <h3 className="font-semibold text-gray-800">{categoryInfo.title}</h3>
                            <p className="text-sm text-gray-600">{categoryInfo.description}</p>
                          </div>
                          <div className="ml-auto">
                            <Badge variant="outline" className="bg-white border-gray-300">
                              {categoryActions.length} action{categoryActions.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-3 ml-2">
                          {categoryActions.map((action: any) => (
                            <Card key={action.id} className={`border ${action.selected ? 'border-primary border-2' : 'border-border'} transition-all hover:shadow-md`}>
                              <CardContent className="p-4 flex items-center justify-between">
                                <div className={`mr-4 flex items-center justify-center w-12 h-12 rounded-full ${getIconBackgroundColor(action.atype)}`}>
                                  {getActionIcon(action.atype)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-800">
                                      {action?.name ?
                                        action.name.split('_').map((word: string) =>
                                          word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ') :
                                        "Action"
                                      }
                                    </h3>
                                    <Badge className={`${getBadgeColor(action.type || "function")} font-normal`}>
                                      {getActionTypeDisplayText(action.atype)}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                    {action?.function?.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant={action.selected ? "default" : "outline"}
                                    onClick={() => toggleActionSelection(action.id)}
                                    className={action.selected ? "bg-primary hover:bg-primary/90" : "hover:bg-gray-100"}
                                    size="sm"
                                  >
                                    {action.selected ? (
                                      <><CheckCircle className="w-4 h-4 mr-1" /> Selected</>
                                    ) : (
                                      <><Circle className="w-4 h-4 mr-1" /> Select</>
                                    )}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  }).filter(Boolean);
                })()
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>No actions found.</p>
                  <p className="text-sm mt-1">Create a new action to get started.</p>
                </div>
              )}
            </>
          )}

          {activeTab === "after-call" && (
            <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No after-call actions configured.</p>
              <p className="text-sm mt-1">After-call actions coming soon.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ActionTab;