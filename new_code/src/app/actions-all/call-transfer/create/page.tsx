"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, PhoneForwarded, PhoneCall, Users, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getActionsApi, createActionApi, updateActionApi } from "@/network/Api";

// Zod validation schema
const callTransferActionSchema = z.object({
  actionName: z.string().min(2, {
    message: "Action name must be at least 2 characters.",
  }),
  atype: z.string().optional().nullable(),
  description: z.string().optional().or(z.string().min(5, {
    message: "If provided, description must be at least 5 characters.",
  })),
  startMessage: z.string().optional().or(z.string().min(5, {
    message: "If provided, start message must be at least 5 characters.",
  })),
  completeMessage: z.string().optional().or(z.string().min(5, {
    message: "If provided, complete message must be at least 5 characters.",
  })),
  failedMessage: z.string().optional().or(z.string().min(5, {
    message: "If provided, failed message must be at least 5 characters.",
  })),
  destinationNumber: z.string().optional(),
  transferReason: z.string().optional(),
  agentId: z.string().optional(),
  department: z.string().optional(),
});

type CallTransferActionFormData = z.infer<typeof callTransferActionSchema>;

const CreateCallTransferActionPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionId = searchParams.get('actionId');
  const atype = searchParams.get('atype');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionData, setActionData] = useState<any>(null);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<CallTransferActionFormData>({
    resolver: zodResolver(callTransferActionSchema),
    defaultValues: {
      actionName: "",
      atype: atype || null,
      description: "",
      startMessage: "",
      completeMessage: "",
      failedMessage: "",
      destinationNumber: "",
      transferReason: "",
      agentId: "",
      department: "",
    },
  });

  const selectedActionType = form.watch('atype');

  const getActionTypeDetails = (atype: string) => {
    switch (atype) {
      case 'call_transfer':
        return {
          title: "Call Transfer",
          description: "Transfer calls to another number or department",
          icon: PhoneForwarded,
          color: "from-amber-500 to-amber-600"
        };
      case 'call_forward':
        return {
          title: "Call Forward",
          description: "Forward calls to another number",
          icon: PhoneCall,
          color: "from-blue-500 to-blue-600"
        };
      case 'live_agent_transfer':
        return {
          title: "Live Agent Transfer",
          description: "Transfer calls to a live agent",
          icon: Users,
          color: "from-emerald-500 to-emerald-600"
        };
      default:
        return {
          title: "Custom Transfer",
          description: "Custom call transfer action",
          icon: PhoneForwarded,
          color: "from-purple-500 to-purple-600"
        };
    }
  };

  const formatFunctionNameForBackend = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  };

  const fetchActionDetails = () => {
    if (!actionId) return;
    
    setIsLoading(true);
    getActionsApi().then((res: any) => {
      if (res.data) {
        const allActions = res.data?.data?.actions || [];
        const action = allActions.find((a: any) => a.id === actionId);
        if (action) {
          setActionData(action);
          form.setValue('actionName', action.name || '');
          form.setValue('description', action.function?.description || '');
          
          // Determine action type based on name
          const actionName = action.name?.toLowerCase() || '';
          let atype = 'call_transfer';
          if (actionName.includes('forward_call')) {
            atype = 'call_forward';
          } else if (actionName.includes('live_agent')) {
            atype = 'live_agent_transfer';
          }
          form.setValue('atype', atype);
          
          // Set destination number from destinations array
          if (action.destinations && action.destinations.length > 0) {
            const destination = action.destinations[0];
            form.setValue('destinationNumber', destination.number || '');
            form.setValue('transferReason', destination.transfer_plan?.message || '');
            
            // Set specific fields based on action type
            if (atype === 'live_agent_transfer') {
              form.setValue('agentId', destination.number || '');
            }
          }
          
          // Set messages
          const messages = action.messages || [];
          const startMessage = messages.find((m: any) => m.type === 'request-start');
          const completeMessage = messages.find((m: any) => m.type === 'request-complete');
          const failedMessage = messages.find((m: any) => m.type === 'request-failed');
          
          if (startMessage) form.setValue('startMessage', startMessage.content || '');
          if (completeMessage) form.setValue('completeMessage', completeMessage.content || '');
          if (failedMessage) form.setValue('failedMessage', failedMessage.content || '');
        }
      }
    }).catch((err: any) => {
      console.log(err);
      toast({
        title: "Failed to fetch action details",
        description: "Please try again later",
        variant: "destructive"
      });
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const onSubmit = async (data: CallTransferActionFormData) => {
    setIsSubmitting(true);

    console.log("Form data:", data);

    const actionType = data.atype || 'call_transfer'; // Default to call_transfer if atype is null
    const actionTypeDetails = getActionTypeDetails(actionType);

    // Build destinations array based on action type
    let destinations: any[] = [];
    
    switch (actionType) {
      case 'call_transfer':
        destinations = [{
          message: null,
          description: data.description || "Transfer call to the specified destination",
          type: "number",
          number: data.destinationNumber || "+16474616565",
          transfer_plan: {
            mode: "blind-transfer",
            message: data.transferReason || "Transferred call"
          }
        }];
        break;
      
      case 'call_forward':
        destinations = [{
          message: null,
          description: data.description || "Forward call to the specified destination",
          type: "number",
          number: data.destinationNumber || "+16474616565",
          transfer_plan: {
            mode: "blind-transfer",
            message: data.transferReason || "Forwarded call"
          }
        }];
        break;
      
      case 'live_agent_transfer':
        destinations = [{
          message: null,
          description: data.description || "Transfer call to a live agent",
          type: "number",
          number: data.agentId || "+16474616565",
          transfer_plan: {
            mode: "blind-transfer",
            message: data.transferReason || "Transferred to live agent"
          }
        }];
        break;
      
      default:
        // Handle any custom atype value
        destinations = [{
          message: null,
          description: data.description || `Custom ${actionType} action`,
          type: "number",
          number: data.destinationNumber || data.agentId || "+16474616565",
          transfer_plan: {
            mode: "blind-transfer",
            message: data.transferReason || `Custom ${actionType} transfer`
          }
        }];
        break;
    }

    const payload = {
      type: "transferCall",
      name: formatFunctionNameForBackend(data.actionName),
      async_: null,
      messages: [
        ...(data.startMessage ? [{
          "contents": null,
          "content": data.startMessage,
          "conditions": null,
          "type": "request-start",
          "blocking": true
        }] : []),
        ...(data.completeMessage ? [{
          "contents": null,
          "content": data.completeMessage,
          "conditions": null,
          "type": "request-complete",
          "role": null,
          "end_call_after_spoken_enabled": false
        }] : []),
        ...(data.failedMessage ? [{
          "contents": null,
          "content": data.failedMessage,
          "conditions": null,
          "type": "request-failed",
          "end_call_after_spoken_enabled": true
        }] : [])
      ],
      function: {
        name: formatFunctionNameForBackend(data.actionName),
        description: data.description
      },
      config: null,
      folder_id: null,
      destinations
    };

    console.log("Payload:", payload);

    try {
      if (actionId) {
        await updateActionApi(actionId, payload);
        toast({
          title: "Action updated successfully",
          description: "Action updated successfully",
          variant: "default"
        });
      } else {
        await createActionApi(payload);
        toast({
          title: "Action created successfully",
          description: "Action created successfully",
          variant: "default"
        });
      }
      router.push("/actions-all/call-transfer");
    } catch (err: any) {
      console.log("Error:", err);
      toast({
        title: actionId ? "Error updating action" : "Error creating action",
        description: actionId ? "Error updating action" : "Error creating action",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (actionId) {
      fetchActionDetails();
    }
  }, [actionId]);

  useEffect(() => {
    if (atype) {
      form.setValue('atype', atype);
    }
  }, [atype]);

  const actionTypeDetails = getActionTypeDetails(selectedActionType || 'call_transfer'); // Default to call_transfer if selectedActionType is null
  const ActionIcon = actionTypeDetails.icon;

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-100 w-full">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading action details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100 w-full">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 bg-gradient-to-br ${actionTypeDetails.color} rounded-lg flex items-center justify-center text-white`}>
                <ActionIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {actionId ? "Edit" : "Create"} {actionTypeDetails.title}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{actionTypeDetails.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneForwarded className="h-5 w-5 text-amber-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="actionName">Action Name</Label>
                <Input
                  id="actionName"
                  placeholder="Enter action name"
                  {...form.register("actionName")}
                />
                {form.formState.errors.actionName && (
                  <p className="text-sm text-red-600">{form.formState.errors.actionName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description for the action"
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneForwarded className="h-5 w-5 text-amber-600" />
                Action Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(selectedActionType || 'call_transfer') === 'call_transfer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destinationNumber">Destination Number</Label>
                    <Input
                      id="destinationNumber"
                      placeholder="Enter destination phone number"
                      {...form.register("destinationNumber")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferReason">Transfer Reason (Optional)</Label>
                    <Input
                      id="transferReason"
                      placeholder="Enter transfer reason"
                      {...form.register("transferReason")}
                    />
                  </div>
                </div>
              )}

              {(selectedActionType || 'call_transfer') === 'call_forward' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destinationNumber">Forward Number</Label>
                    <Input
                      id="destinationNumber"
                      placeholder="Enter forward phone number"
                      {...form.register("destinationNumber")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferReason">Forward Reason (Optional)</Label>
                    <Input
                      id="transferReason"
                      placeholder="Enter forward reason"
                      {...form.register("transferReason")}
                    />
                  </div>
                </div>
              )}

              {(selectedActionType || 'call_transfer') === 'live_agent_transfer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agentId">Phone Number</Label>
                    <Input
                      id="agentId"
                      placeholder="Enter phone number"
                      {...form.register("agentId")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department (Optional)</Label>
                    <Input
                      id="department"
                      placeholder="Enter department name"
                      {...form.register("department")}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="transferReason">Transfer Reason (Optional)</Label>
                    <Input
                      id="transferReason"
                      placeholder="Enter transfer reason"
                      {...form.register("transferReason")}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneForwarded className="h-5 w-5 text-amber-600" />
                Action Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startMessage">Start Message (Optional)</Label>
                <Textarea
                  id="startMessage"
                  placeholder="Message to show when action starts"
                  {...form.register("startMessage")}
                />
                {form.formState.errors.startMessage && (
                  <p className="text-sm text-red-600">{form.formState.errors.startMessage.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="completeMessage">Complete Message (Optional)</Label>
                <Textarea
                  id="completeMessage"
                  placeholder="Message to show when action completes successfully"
                  {...form.register("completeMessage")}
                />
                {form.formState.errors.completeMessage && (
                  <p className="text-sm text-red-600">{form.formState.errors.completeMessage.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="failedMessage">Failed Message (Optional)</Label>
                <Textarea
                  id="failedMessage"
                  placeholder="Message to show when action fails"
                  {...form.register("failedMessage")}
                />
                {form.formState.errors.failedMessage && (
                  <p className="text-sm text-red-600">{form.formState.errors.failedMessage.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {actionId ? "Updating..." : "Creating..."}
                </>
              ) : (
                actionId ? "Update Action" : "Create Action"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCallTransferActionPage; 