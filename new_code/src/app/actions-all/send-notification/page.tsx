"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Plus, Edit, Trash, Bell, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getActionsApi, deleteActionApi, getActionAgentListApi } from "@/network/Api";
import { toast } from "@/hooks/use-toast";
import CreateNotification from "@/components/action/send-notification/CreateNotification";

const SendNotificationPage = () => {
    const [actions, setActions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [showCreateNotification, setShowCreateNotification] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedAction, setSelectedAction] = useState<any>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const [actionToDelete, setActionToDelete] = useState<any>(null);
    const [actionAgents, setActionAgents] = useState<{ [key: string]: any[] }>({});

    const fetchActions = () => {
        setIsLoading(true);
        getActionsApi()
            .then((res: any) => {
                if (res.data) {
                    const allActions = res.data?.data?.actions || [];
                    // Filter actions to only show notification-related ones
                    const notificationActions = allActions.filter((action: any) => 
                        action.atype === 'notification'
                    );
                    setActions(notificationActions);
                }
            })
            .catch((err: any) => {
                console.log(err);
                toast({
                    title: "Failed to fetch actions",
                    description: "Please try again later",
                    variant: "destructive"
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const getActionIcon = (atype: string) => {
        switch (atype) {
            case 'notification':
                return Bell;
            default:
                return Bell;
        }
    };

    const getActionIconBg = (atype: string) => {
        switch (atype) {
            case 'notification':
                return "from-amber-500 to-amber-600";
            default:
                return "from-amber-500 to-amber-600";
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
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return "N/A";
        }
    };

    const resetActionState = () => {
        setShowCreateNotification(false);
        setIsEdit(false);
        setSelectedAction(null);
    };

    const handleDeleteClick = async (action: any) => {
        setActionToDelete(action);
        setDeleteConfirmationText("");
        
        // Fetch agents for this action
        try {
            const res = await getActionAgentListApi(action.id);
            if (res.data?.data?.assistants) {
                setActionAgents(prev => ({
                    ...prev,
                    [action.id]: res.data.data.assistants
                }));
            }
        } catch (err) {
            console.log("Error fetching agents:", err);
            setActionAgents(prev => ({
                ...prev,
                [action.id]: []
            }));
        }
    };

    const handleDelete = (actionId: string, actionName: string) => {
        setIsDeleting(actionId);
        deleteActionApi(actionId).then((res: any) => {
            if (res.data) {
                toast({
                    title: "Action deleted successfully",
                    description: "The action has been removed from your list",
                    variant: "default"
                });
                fetchActions();
            }
        }).catch((err: any) => {
            console.log(err);
            toast({
                title: "Action deletion failed",
                description: "Failed to delete action. Please try again.",
                variant: "destructive"
            });
        }).finally(() => {
            setIsDeleting(null);
            setActionToDelete(null);
            setDeleteConfirmationText("");
        });
    };

    useEffect(() => {
        fetchActions();
    }, []);

    const renderParameters = (parameters: string[]) => {
        // Estimate how many parameters can fit in roughly 2 lines
        // This is a rough estimation based on average parameter length
        const maxVisible = Math.min(parameters.length, 6); // Start with up to 6 parameters
        const visibleParams = parameters.slice(0, maxVisible);
        const remainingCount = parameters.length - maxVisible;

        return (
            <div className="h-12 overflow-hidden relative">
                <div className="flex flex-wrap gap-1">
                    {visibleParams.map((param: string, paramIndex: number) => (
                        <Badge key={paramIndex} variant="outline" className="text-xs text-black">
                            {param.replace(/_/g, ' ')}
                        </Badge>
                    ))}
                    {remainingCount > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="text-xs cursor-cell bg-gray-50 hover:bg-gray-100 text-black">
                                        +{remainingCount}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs bg-white border border-gray-200 shadow-md">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-black">All Parameters:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {parameters.map((param: string, index: number) => (
                                                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded text-black">
                                                    {param.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-100">
            {!showCreateNotification && <div className="">
                {/* Header */}
                <div className="mb-6 bg-white p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white bg-amber-500">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Send Notification</h1>
                                <p className="text-sm text-gray-500 mt-1">Configure email, SMS, and notification workflows</p>
                            </div>
                        </div>
                        <Button className="bg-amber-600 hover:bg-amber-700"
                        // onClick={()=>router.push("/actions-all/send-notification/create")}
                        onClick={()=>setShowCreateNotification(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Action
                        </Button>
                    </div>
                </div>                  

                {/* Action Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-6">
                    {isLoading ? (
                        // Skeleton loading cards
                        Array.from({ length: 6 }).map((_, index) => (
                            <Card key={`skeleton-${index}`} className="group hover:shadow-lg hover:border-amber-200 transition-all duration-300 h-[300px] flex flex-col">
                                <CardContent className="p-4 flex-1 flex flex-col">
                                    {/* Header Skeleton */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 rounded bg-gray-200"></div>
                                            <div className="h-8 w-8 rounded bg-gray-200"></div>
                                        </div>
                                    </div>

                                    {/* Content Skeleton */}
                                    <div className="flex-1">
                                        <div className="h-5 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                                        
                                        {/* Parameters Skeleton */}
                                        <div className="mb-4">
                                            <div className="h-3 bg-gray-200 rounded mb-2 w-20"></div>
                                            <div className="flex flex-wrap gap-2">
                                                <div className="h-5 w-16 bg-gray-200 rounded"></div>
                                                <div className="h-5 w-20 bg-gray-200 rounded"></div>
                                                <div className="h-5 w-14 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Skeleton */}
                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                                            <div className="h-5 w-16 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : actions.length === 0 ? (
                        <div className="col-span-full flex flex-col justify-center items-center py-16">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Bell className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No notification actions found</h3>
                            <p className="text-gray-500 text-center mb-6 max-w-md">
                                Get started by creating your first notification action to send emails and SMS messages.
                            </p>
                            <Button 
                                className="bg-amber-600 hover:bg-amber-700"
                                onClick={() => setShowCreateNotification(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Action
                            </Button>
                        </div>
                    ) : (
                        actions?.map((action: any, index: number) => {
                            const ActionIcon = getActionIcon(action.atype);
                            const iconBg = getActionIconBg(action.atype);
                            const title = action?.name ? action.name.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';
                            const parameters = getActionParameters(action);
                            const createdDate = formatDate(action.created_at);
                            
                            return (
                                <Card key={action?.id || index} className="group hover:shadow-lg hover:border-amber-200 transition-all duration-300 h-[310px] flex flex-col">
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-r ${iconBg}`}>
                                                <ActionIcon className="h-5 w-5" />
                                            </div>
                                            <div className="flex gap-2 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    // onClick={() => router.push(`/actions-all/send-notification/create?actionId=${action.id}`)}
                                                    onClick={()=>{
                                                        setShowCreateNotification(true);
                                                        setIsEdit(true);
                                                        setSelectedAction(action);
                                                    }}
                                                    className="h-8 w-8 p-0 hover:bg-gray-100"
                                                    disabled={isDeleting === action.id}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            disabled={isDeleting === action.id}
                                                            onClick={() => handleDeleteClick(action)}
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
                                                            <AlertDialogTitle>Delete Action</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{title}"? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <div className="px-6 pb-4">
                                                            <div className="mb-4">
                                                                <div className="text-sm font-medium text-gray-700 mb-2">This action is currently attached to:</div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {actionAgents[action.id] && actionAgents[action.id].length > 0 ? (
                                                                        actionAgents[action.id].map((agent: any, agentIndex: number) => (
                                                                            <Badge key={agentIndex} variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">
                                                                                {agent.name}
                                                                            </Badge>
                                                                        ))
                                                                    ) : (
                                                                        <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-700">
                                                                            No agents attached
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-sm text-gray-600 mb-3">
                                                                Type <strong>{title}</strong> to confirm deletion:
                                                            </div>
                                                        </div>
                                                        <div className="px-6 pb-4">
                                                            <Input
                                                                type="text"
                                                                placeholder={`Type "${title}" to confirm`}
                                                                value={deleteConfirmationText}
                                                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel onClick={() => {
                                                                setActionToDelete(null);
                                                                setDeleteConfirmationText("");
                                                            }}>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                onClick={() => handleDelete(action.id, title)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                                disabled={isDeleting === action.id || deleteConfirmationText !== title}
                                                            >
                                                                {isDeleting === action.id ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                        Deleting...
                                                                    </>
                                                                ) : (
                                                                    'Delete'
                                                                )}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <h3 className="text-md font-semibold text-gray-900 mb-2 line-clamp-1 truncate">{title}</h3>
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {action?.function?.description || "No description available"}
                                            </p>
                                            
                                            {/* Parameters */}
                                            <div className="mb-4">
                                                <p className="text-xs font-medium text-gray-500 mb-2">Parameters:</p>
                                                {parameters?.length > 0 ? (
                                                    renderParameters(parameters)
                                                ) : (
                                                    <p className="text-xs text-gray-400">No parameters</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span>Created: {createdDate}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {action.atype?.replace(/_/g, ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>}
            {showCreateNotification && <CreateNotification 
                        setShowCreateNotification={setShowCreateNotification} 
                        isEdit={isEdit} 
                        actionData={selectedAction}
                        resetActionState={resetActionState}
                        fetchActions={fetchActions}
                    />}
        </div>
    );
};

export default SendNotificationPage; 