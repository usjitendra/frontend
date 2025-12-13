"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CalendarDays,
  Info,
  MessageSquare,
  Save,
  X,
  Code,
  Loader2,
  CheckCircle,
  Calendar,
  CalendarX,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createActionApi,
  getActionByIdApi,
  getGlobalVariableApi,
  updateActionApi,
} from "@/network/Api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { formatActionName } from "@/_utils/general";

// Zod validation schema
const bookingActionSchema = z.object({
  actionName: z.string().min(2, {
    message: "Action name must be at least 2 characters.",
  }),
  atype: z
    .enum(
      [
        "calendar_availability",
        "calendar_booking",
        "calendar_reschedule",
        "calendar_cancel",
      ],
      {
        required_error: "Please select an action type.",
      }
    )
    .default("calendar_availability"),
  startMessage: z
    .string()
    .optional()
    .or(
      z.string().min(5, {
        message: "If provided, start message must be at least 5 characters.",
      })
    ),
  completeMessage: z
    .string()
    .optional()
    .or(
      z.string().min(5, {
        message: "If provided, complete message must be at least 5 characters.",
      })
    ),
  failedMessage: z
    .string()
    .optional()
    .or(
      z.string().min(5, {
        message: "If provided, failed message must be at least 5 characters.",
      })
    ),
  selectedVariables: z
    .record(
      z.object({
        type: z.string(),
        description: z.string(),
        enum: z.any().nullable(),
        folder_id: z.string().nullable().optional(),
      })
    )
    .optional(),
});

type BookingActionFormData = z.infer<typeof bookingActionSchema>;

const CreateBookingActionPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionId = searchParams.get("actionId");
  const atype = searchParams.get("atype");
  const [variableCategory, setVariableCategory] = useState(
    actionId ? "" : "all"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalVariables, setGlobalVariables] = useState<any[]>([]);
  const [globalVariablesLoading, setGlobalVariablesLoading] = useState(false);
  const [actionData, setActionData] = useState<any>(null);
  const [lockedFolderGroup, setLockedFolderGroup] = useState<string | null>(
    null
  );

  // Initialize form with react-hook-form and zod validation
  const form = useForm<BookingActionFormData>({
    resolver: zodResolver(bookingActionSchema),
    defaultValues: {
      actionName: "",
      atype: (atype as any) || "calendar_availability",
      startMessage: "",
      completeMessage: "",
      failedMessage: "",
      selectedVariables: {},
    },
  });

  const selectedVariables = form.watch("selectedVariables");

  // Check if there are any selected variables from global folders and determine locked folder
  const getSelectedGlobalVariablesFolderGroup = () => {
    if (!selectedVariables || !globalVariables.length) return null;

    for (const [variableName, variableData] of Object.entries(
      selectedVariables
    )) {
      if (variableData.folder_id) {
        // Find which folder this variable belongs to
        const folder = globalVariables.find(
          (f) => f.id === variableData.folder_id
        );
        if (folder) {
          return folder.name;
        }
      }
    }
    return null;
  };

  const selectedGlobalVariablesFolderGroup =
    getSelectedGlobalVariablesFolderGroup();
  const hasSelectedGlobalVariables =
    selectedGlobalVariablesFolderGroup !== null;

  // Function to clear all selected global variables
  const clearAllSelectedGlobalVariables = () => {
    const currentSelected = form.getValues("selectedVariables");
    if (!currentSelected) return;

    // Keep only required properties and external properties (non-global variables)
    const filteredVariables = Object.fromEntries(
      Object.entries(currentSelected).filter(([key, value]) => {
        // Keep required properties
        if (requiredProperties[key as keyof typeof requiredProperties]) {
          return true;
        }
        // Keep external properties (those without folder_id)
        if (!value.folder_id) {
          return true;
        }
        return false;
      })
    );

    form.setValue("selectedVariables", filteredVariables);
    setLockedFolderGroup(null);
  };

  // Group variables by folder for global variables
  const groupedGlobalVariables = globalVariables.map((folder) => ({
    folderName: folder.name,
    variables: Object.entries(folder.properties).map(
      ([key, value]: [string, any]) => ({
        id: `${folder.id}_${key}`,
        name: key,
        type: value.type || "String",
        description: value.description || "Global variable",
        enum: value.enum,
      })
    ),
  }));

  // Get unique folder names for the dropdown
  const folderNames = globalVariables.map((folder) => folder.name);

  // Filter grouped variables to show only selected folder
  const filteredGroupedVariables = groupedGlobalVariables.filter(
    (folder) => folder.folderName === variableCategory
  );

  // Get all properties from actionData for external properties
  const actionProperties = actionData?.function?.parameters?.properties || {};
  const actionPropertyNames = Object.keys(actionProperties);

  // Required properties that cannot be deselected - dynamic based on action type
  const getRequiredProperties = (actionType: string) => {
    switch (actionType) {
      case "calendar_availability":
      case "calendar_booking":
        return {
          start_time: {
            description: "Start time of the booking.",
            type: "string",
          },
          end_time: {
            description: "End time of the booking.",
            type: "string",
          },
          provider_id: {
            description: "Provider ID to book the appointment with.",
            type: "string",
          },
          service_id: {
            description: "Service ID to book the appointment for.",
            type: "string",
          },
          urgent_appointment: {
            description:
              "Indicates if the booking is for urgent care or emergency.",
            type: "boolean",
          },
        };
      case "calendar_reschedule":
        return {
          booking_id: {
            type: "string",
            description: "The ID of the appointment to reschedule",
          },
          start_time: {
            type: "string",
            description: "The new start time for the appointment",
          },
        };
      case "calendar_cancel":
        return {
          booking_id: {
            type: "string",
            description: "The ID of the appointment to cancel",
          },
        };
      default:
        return {};
    }
  };

  const requiredProperties = getRequiredProperties(form.watch("atype"));

  // Create external properties (properties in actionData but not in global variables)
  const externalProperties = actionPropertyNames
    .filter((propertyName) => {
      // Check if this property exists in any global variable folder
      return !globalVariables.some((folder) =>
        Object.keys(folder.properties).includes(propertyName)
      );
    })
    .map((propertyName) => ({
      id: `external_${propertyName}`,
      name: propertyName,
      type: (actionProperties[propertyName] as any)?.type || "string",
      description:
        (actionProperties[propertyName] as any)?.description ||
        "External property",
      isExternal: true,
      enum: (actionProperties[propertyName] as any)?.enum || null,
    }));

  const handleVariableToggle = (
    variableId: string,
    variableName: string,
    variableDetails: any,
    folderId?: string
  ) => {
    // Don't allow deselection of required properties
    if (requiredProperties[variableName as keyof typeof requiredProperties]) {
      return;
    }

    const currentSelected = form.getValues("selectedVariables");

    if (currentSelected && currentSelected[variableName]) {
      // Remove variable
      const { [variableName]: removed, ...rest } = currentSelected;
      form.setValue("selectedVariables", rest);

      // If no more global variables are selected, unlock the folder group
      const remainingGlobalVars = Object.values(rest).some((v) => v.folder_id);
      if (!remainingGlobalVars) {
        setLockedFolderGroup(null);
      }
    } else {
      // Add variable - check folder group restriction for global variables
      if (folderId) {
        const folderName = globalVariables.find((f) => f.id === folderId)?.name;

        // If there are already selected global variables from a different folder, prevent selection
        if (
          hasSelectedGlobalVariables &&
          selectedGlobalVariablesFolderGroup !== folderName
        ) {
          toast({
            title: "Cannot select from different folder",
            description: `You can only select variables from one folder group. Currently selected from: ${selectedGlobalVariablesFolderGroup}. Clear all variables to change folder group.`,
            variant: "destructive",
          });
          return;
        }

        // Lock the folder group on first selection
        if (!hasSelectedGlobalVariables && folderName) {
          setLockedFolderGroup(folderName);
        }
      }

      // Add variable
      form.setValue("selectedVariables", {
        ...currentSelected,
        [variableName]: {
          type: variableDetails.type,
          description: variableDetails.description,
          enum: variableDetails.enum,
          folder_id: folderId || null, // Include folder_id for global variables
        },
      });
    }
  };

  const fetchActionDetails = async () => {
    if (!actionId) return;

    setIsLoading(true);
    try {
      const response = await getActionByIdApi(actionId);
      if (response.data) {
        console.log("Action:", response.data?.data?.action);
        // Pre-populate form with existing data if editing
        const actionData = response.data?.data?.action;
        if (actionData) {
          // Extract properties from actionData function parameters
          const actionProperties =
            actionData?.function?.parameters?.properties || {};

          // Create selectedVariables object from action properties
          // If action has a folder_id, apply it to all global variables (non-required properties)
          const actionFolderId = actionData.folder_id || null;
          console.log("ActionData folder_id:", actionFolderId);
          console.log("Full actionData:", actionData);

          const selectedVariablesObj = Object.entries(actionProperties).reduce(
            (acc, [key, value]) => {
              // Determine if this is a global variable (not a required property)
              const isGlobalVariable =
                !requiredProperties[key as keyof typeof requiredProperties];

              acc[key] = {
                type: (value as any).type,
                description: (value as any).description,
                enum: (value as any).enum,
                folder_id: isGlobalVariable ? actionFolderId : null,
              };
              return acc;
            },
            {} as Record<string, any>
          );

          form.reset({
            actionName: formatActionName(actionData.name) || "",
            atype: actionData.atype || "calendar_availability",
            startMessage:
              actionData?.messages?.find(
                (msg: any) => msg.type === "request-start"
              )?.content || "",
            completeMessage:
              actionData?.messages?.find(
                (msg: any) => msg.type === "request-complete"
              )?.content || "",
            failedMessage:
              actionData?.messages?.find(
                (msg: any) => msg.type === "request-failed"
              )?.content || "",
            selectedVariables: selectedVariablesObj,
          });
          setActionData(actionData);

          // If we have globalVariables already loaded, set the folder category immediately
          if (actionFolderId && globalVariables.length > 0) {
            const folder = globalVariables.find((f) => f.id === actionFolderId);
            if (folder) {
              console.log("Setting folder category immediately:", folder.name);
              setVariableCategory(folder.name);
              setLockedFolderGroup(folder.name);
            }
          }
        }
      }
    } catch (error) {
      console.log("Error fetching action details:", error);
    } finally {
      setIsLoading(false);
      console.log("Action details fetched");
    }
  };

  const fetchGlobalVariables = async () => {
    setGlobalVariablesLoading(true);
    try {
      const res = await getGlobalVariableApi();
      if (res.data?.data?.folders) {
        console.log("Global variables:", res.data?.data?.folders);
        setGlobalVariables(res.data?.data?.folders);
        // Set the first folder as default selection only if not editing
        if (res.data?.data?.folders.length > 0 && !actionId) {
          console.log(
            "Setting default folder category to:",
            res.data?.data?.folders[0].name
          );
          setVariableCategory(res.data?.data?.folders[0].name);
        } else if (actionId) {
          console.log(
            "Edit mode - not setting default folder, waiting for action data"
          );
        }
      }
    } catch (err) {
      console.log("Error fetching global variables:", err);
    } finally {
      console.log("Global variables fetched");
      setGlobalVariablesLoading(false);
    }
  };

  // Convert function name to lowercase with underscores for backend
  const formatFunctionNameForBackend = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, "_");
  };

  const onSubmit = async (data: BookingActionFormData) => {
    console.log("data", data);

    setIsSubmitting(true);

    // Always include required properties in the final payload
    const finalProperties = {
      ...requiredProperties,
      ...Object.fromEntries(
        Object.entries(data.selectedVariables || {})
          .filter(([key]) => key !== "calendar_id" && key !== "call_type")
          .map(([key, value]) => [
            key,
            {
              type: value.type,
              description: value.description,
              enum: value.enum,
            },
          ])
      ),
    };

    // Extract single folder_id from selected global variables
    const selectedFolderId = (() => {
      if (!data.selectedVariables) return null;

      for (const [variableName, variableData] of Object.entries(
        data.selectedVariables
      )) {
        if (variableData.folder_id) {
          return variableData.folder_id;
        }
      }
      return null;
    })();

    console.log("finalProperties", data.selectedVariables);
    console.log("selectedFolderId", selectedFolderId);

    // Get function name and description based on action type
    const getFunctionDetails = (atype: string) => {
      switch (atype) {
        case "calendar_availability":
          return {
            name: "calendar_availability_check",
            description:
              "Use this function to check availibilty appointment in a calendar system. Ensure that start_time and end_time include time zone (in ISO 8601 format). All required fields must be provided when calling this function to avoid errors. The start_time must be aligned to 15-minute intervals — valid times include 12:00, 4:15, 1:30, 2:45, etc. • Do not use times like 4:02, 4:19, or 4:37. When checking availability or scheduling for any day other than today, start_time must be 00:00 (midnight) or later, unless user mention for spcific time.",
          };
        case "calendar_booking":
          return {
            name: "calendar_booking",
            description:
              "Use this function to schedule a booking or appointment in a calendar system. Ensure that start_time and end_time include time zone (in ISO 8601 format). All required fields must be provided when calling this function to avoid errors.",
          };
        case "calendar_reschedule":
          return {
            name: "calendar_reschedule",
            description:
              "Use this function to reschedule an existing appointment in a calendar system. Ensure that new_start_time and new_end_time include time zone (in ISO 8601 format). All required fields including appointment_id must be provided when calling this function to avoid errors.",
          };
        case "calendar_cancel":
          return {
            name: "calendar_cancel",
            description:
              "Use this function to cancel an existing appointment in a calendar system. The appointment_id is required to identify which appointment to cancel.",
          };
        default:
          return {
            name: "calendar_function",
            description: "Calendar function",
          };
      }
    };

    const functionDetails = getFunctionDetails(data?.atype);

    const payload = {
      type: "function",
      atype: data?.atype,
      async: false,
      name: formatFunctionNameForBackend(data.actionName),
      function: {
        name: functionDetails.name,
        strict: false,
        description: functionDetails.description,
        parameters: {
          type: "object",
          properties: finalProperties,
          required: Object.keys(finalProperties),
        },
      },
      // Include single folder_id for selected global variables
      folder_id: selectedFolderId,
      messages: [
        {
          content: data.startMessage,
          type: "request-start",
          blocking: true,
        },
        ...(data.atype !== "calendar_availability"
          ? [
              {
                content: data.completeMessage,
                type: "request-complete",
                end_call_after_spoken_enabled: false,
              },
            ]
          : []),
        {
          content: data.failedMessage,
          type: "request-failed",
          end_call_after_spoken_enabled: true,
        },
      ],
    };
    console.log("payload", payload);
    if (actionId) {
      updateActionApi(actionId, payload)
        .then((res: any) => {
          console.log("res", res);
          if (res.data) {
            toast({
              title: "Action updated successfully",
              description: "Action updated successfully",
              variant: "default",
            });
            router.push(`/actions-all/realtime-booking`);
            setIsSubmitting(false);
          }
        })
        .catch((err: any) => {
          console.log("err", err);
          setIsSubmitting(false);
          toast({
            title: "Error updating action",
            description: "Error updating action",
            variant: "destructive",
          });
        });
    } else {
      createActionApi(payload)
        .then((res: any) => {
          console.log("res", res);
          if (res.data) {
            toast({
              title: "Action created successfully",
              description: "Action created successfully",
              variant: "default",
            });
            router.push(`/actions-all/realtime-booking`);
            setIsSubmitting(false);
          }
        })
        .catch((err: any) => {
          console.log("err", err);
          setIsSubmitting(false);
          toast({
            title: "Error creating action",
            description: "Error creating action",
            variant: "destructive",
          });
        });
    }
  };

  useEffect(() => {
    if (actionId) {
      fetchActionDetails();
    }
  }, [actionId]);

  useEffect(() => {
    if (atype) {
      form.setValue("atype", atype as any);
    }
  }, [atype]);

  useEffect(() => {
    fetchGlobalVariables();
  }, []);

  // Set folder category and lock when both action data and global variables are available
  useEffect(() => {
    console.log(
      "useEffect triggered - actionData:",
      !!actionData,
      "globalVariables:",
      globalVariables.length,
      "folder_id:",
      actionData?.folder_id
    );

    // Try to get folder_id from actionData first
    let targetFolderId = actionData?.folder_id;

    // If not found in actionData, try to get it from selectedVariables
    if (!targetFolderId && selectedVariables) {
      for (const [key, value] of Object.entries(selectedVariables)) {
        if (value.folder_id) {
          targetFolderId = value.folder_id;
          break;
        }
      }
    }

    console.log("Target folder_id:", targetFolderId);

    if (targetFolderId && globalVariables.length > 0) {
      console.log("Looking for folder with id:", targetFolderId);
      console.log(
        "Available folders:",
        globalVariables.map((f) => ({ id: f.id, name: f.name }))
      );
      const folder = globalVariables.find((f) => f.id === targetFolderId);
      if (folder) {
        console.log("Found folder, setting category to:", folder.name);
        setVariableCategory(folder.name);
        setLockedFolderGroup(folder.name);
      } else {
        console.log("Folder not found for id:", targetFolderId);
      }
    }
  }, [actionData, globalVariables, selectedVariables]);

  // Show loading spinner while fetching action details
  if (isLoading) {
    return (
      <div className="w-full flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading action details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`h-12 w-12 ${
                  form.watch("atype") === "calendar_booking"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600"
                    : form.watch("atype") === "calendar_reschedule"
                    ? "bg-gradient-to-br from-orange-500 to-orange-600"
                    : form.watch("atype") === "calendar_cancel"
                    ? "bg-gradient-to-br from-red-500 to-red-600"
                    : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                } rounded-2xl flex items-center justify-center text-white shadow-lg`}
              >
                {form.watch("atype") === "calendar_booking" && (
                  <CalendarDays className="h-6 w-6" />
                )}
                {form.watch("atype") === "calendar_availability" && (
                  <CheckCircle className="h-6 w-6" />
                )}
                {form.watch("atype") === "calendar_reschedule" && (
                  <Calendar className="h-6 w-6" />
                )}
                {form.watch("atype") === "calendar_cancel" && (
                  <CalendarX className="h-6 w-6" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {actionId
                    ? `Edit ${
                        form.watch("atype") === "calendar_booking"
                          ? "Booking"
                          : form.watch("atype") === "calendar_reschedule"
                          ? "Reschedule"
                          : form.watch("atype") === "calendar_cancel"
                          ? "Cancel"
                          : "Availability Check"
                      } Action`
                    : `Create ${
                        form.watch("atype") === "calendar_booking"
                          ? "Booking"
                          : form.watch("atype") === "calendar_reschedule"
                          ? "Reschedule"
                          : form.watch("atype") === "calendar_cancel"
                          ? "Cancel"
                          : "Availability Check"
                      } Action`}
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  {actionId
                    ? `Modify the existing ${
                        form.watch("atype") === "calendar_booking"
                          ? "appointment booking"
                          : form.watch("atype") === "calendar_reschedule"
                          ? "appointment rescheduling"
                          : form.watch("atype") === "calendar_cancel"
                          ? "appointment cancellation"
                          : "availability checking"
                      } action configuration`
                    : `Configure a new ${
                        form.watch("atype") === "calendar_booking"
                          ? "appointment booking"
                          : form.watch("atype") === "calendar_reschedule"
                          ? "appointment rescheduling"
                          : form.watch("atype") === "calendar_cancel"
                          ? "appointment cancellation"
                          : "availability checking"
                      } action for your workflow`}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="px-6 py-3"
                onClick={() => router.back()}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="px-8 py-3"
                onClick={form.handleSubmit(onSubmit, (err) =>
                  console.log("err", err)
                )}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {actionId ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {actionId ? "Update Action" : "Save Action"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Form Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex justify-center p-8">
              {/* Form Container */}
              <div className="w-full max-w-4xl">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit, (err) =>
                      console.log("err", err)
                    )}
                    className="space-y-8"
                  >
                    {/* Basic Information Section */}
                    <Card>
                      <CardHeader className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <CardTitle className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-blue-600" />
                          Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="actionName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Action Name{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter a descriptive name for this action"
                                    className="w-full"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Choose a clear, descriptive name that
                                  identifies this action's purpose
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Messages Section */}
                    <Card>
                      <CardHeader className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                          Action Messages
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-8">
                          {/* Start Message */}
                          <FormField
                            control={form.control}
                            name="startMessage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Start Message{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Textarea
                                      rows={4}
                                      placeholder="Message when action starts..."
                                      className="w-full"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Speaks when the booking process begins
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Complete Message */}
                          {form.watch("atype") !== "calendar_availability" && (
                            <FormField
                              control={form.control}
                              name="completeMessage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Complete Message{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Textarea
                                        rows={4}
                                        placeholder="Message when action completes..."
                                        className="w-full"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Speaks when booking is successful
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {/* Failed Message */}
                          <FormField
                            control={form.control}
                            name="failedMessage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Failed Message{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Textarea
                                      rows={4}
                                      placeholder="Message when action fails..."
                                      className="w-full"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Speaks when booking fails
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </form>
                </Form>
              </div>
            </div>
          </div>

          {/* Variables Sidebar - Fixed */}
          {form.watch("atype") === "calendar_booking" && (
            <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0">
              <div className="h-full flex flex-col">
                <div className="px-4 py-4 flex-shrink-0">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Code className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-semibold text-gray-900">
                            Custom Variables
                          </h2>
                          {Object.keys(selectedVariables || {}).length > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-purple-100 text-purple-800 border-purple-200"
                            >
                              {Object.keys(selectedVariables || {}).length}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-gray-500 flex-1">
                            Choose the variables that must be collected during
                            the call.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Select
                      value={variableCategory}
                      onValueChange={(value) => {
                        // If variables are selected from a different folder, show warning
                        if (
                          hasSelectedGlobalVariables &&
                          selectedGlobalVariablesFolderGroup !== value
                        ) {
                          toast({
                            title: "Cannot change folder group",
                            description: `Variables are currently selected from ${selectedGlobalVariablesFolderGroup}. Clear all variables first to change folder group.`,
                            variant: "destructive",
                          });
                          return;
                        }
                        setVariableCategory(value);
                      }}
                      disabled={hasSelectedGlobalVariables}
                    >
                      <SelectTrigger
                        className={
                          hasSelectedGlobalVariables
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {folderNames.map((folderName) => (
                          <SelectItem key={folderName} value={folderName}>
                            {folderName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {hasSelectedGlobalVariables && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex-1">
                          <p className="text-xs text-orange-700">
                            Variables selected from:{" "}
                            <strong>
                              {selectedGlobalVariablesFolderGroup}
                            </strong>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={clearAllSelectedGlobalVariables}
                          className="text-xs h-7 border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-6">
                  {globalVariablesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Loading global variables...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredGroupedVariables.length > 0 && (
                        <div>
                          <div className="space-y-4 mt-2">
                            {filteredGroupedVariables.map((folder) => (
                              <div
                                key={folder.folderName}
                                className="space-y-2"
                              >
                                <div className="space-y-2">
                                  {folder.variables.map((variable) => {
                                    const isRequired = Object.keys(
                                      requiredProperties
                                    ).includes(variable.name);
                                    const isSelected =
                                      selectedVariables &&
                                      selectedVariables[variable.name]
                                        ? true
                                        : false;
                                    const isAlwaysSelected =
                                      isRequired || isSelected;
                                    const isFromDifferentFolder =
                                      hasSelectedGlobalVariables &&
                                      selectedGlobalVariablesFolderGroup !==
                                        folder.folderName &&
                                      !isSelected;
                                    const isDisabled =
                                      isFromDifferentFolder || isRequired;

                                    return (
                                      <div
                                        key={variable.id}
                                        className="variable-item"
                                      >
                                        <Card
                                          className={`p-3 bg-gradient-to-r border transition-all duration-200 ${
                                            isFromDifferentFolder
                                              ? "from-gray-50 to-gray-100 border-gray-200 opacity-50"
                                              : "from-purple-50 to-purple-100 border-purple-200 hover:shadow-md"
                                          } ${
                                            isAlwaysSelected
                                              ? "ring-2 ring-purple-300"
                                              : ""
                                          }`}
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                              <Checkbox
                                                id={variable.id}
                                                checked={isAlwaysSelected}
                                                disabled={isDisabled}
                                                onCheckedChange={() =>
                                                  handleVariableToggle(
                                                    variable.id,
                                                    variable.name,
                                                    {
                                                      type: variable.type,
                                                      description:
                                                        variable.description,
                                                      enum: variable.enum,
                                                    },
                                                    folder.folderName ===
                                                      variableCategory
                                                      ? globalVariables.find(
                                                          (f) =>
                                                            f.name ===
                                                            folder.folderName
                                                        )?.id
                                                      : undefined
                                                  )
                                                }
                                                data-variable={`{{${variable.name}}}`}
                                                className={
                                                  isFromDifferentFolder
                                                    ? "cursor-not-allowed"
                                                    : ""
                                                }
                                              />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <Label
                                                htmlFor={variable.id}
                                                className={`block ${
                                                  isFromDifferentFolder
                                                    ? "cursor-not-allowed"
                                                    : "cursor-pointer"
                                                }`}
                                              >
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span
                                                    className={`text-sm font-semibold ${
                                                      isFromDifferentFolder
                                                        ? "text-gray-400"
                                                        : "text-gray-900"
                                                    }`}
                                                  >
                                                    {variable.name}
                                                  </span>
                                                  <Badge
                                                    variant="secondary"
                                                    className="bg-purple-200 text-purple-800 text-xs"
                                                  >
                                                    {variable.type}
                                                  </Badge>
                                                  {isRequired && (
                                                    <Badge
                                                      variant="outline"
                                                      className="text-xs border-red-300 text-red-700"
                                                    >
                                                      Required
                                                    </Badge>
                                                  )}
                                                  {variable.enum && (
                                                    <Badge
                                                      variant="outline"
                                                      className="text-xs border-orange-200 text-orange-700"
                                                    >
                                                      Enum
                                                    </Badge>
                                                  )}
                                                </div>
                                                <p
                                                  className={`text-xs ${
                                                    isFromDifferentFolder
                                                      ? "text-gray-400"
                                                      : "text-gray-600"
                                                  }`}
                                                >
                                                  {variable.description}
                                                </p>
                                              </Label>
                                            </div>
                                          </div>
                                        </Card>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {externalProperties.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            System Variables
                          </h3>
                          <div className="space-y-2">
                            {externalProperties.map((variable) => {
                              const isRequired = Object.keys(
                                requiredProperties
                              ).includes(variable.name);
                              const isSelected =
                                selectedVariables &&
                                selectedVariables[variable.name]
                                  ? true
                                  : false;
                              const isAlwaysSelected = isRequired || isSelected;

                              return (
                                <div
                                  key={variable.id}
                                  className="variable-item"
                                >
                                  <Card
                                    className={`p-3 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 hover:shadow-md transition-all duration-200 ${
                                      isAlwaysSelected
                                        ? "ring-2 ring-orange-300"
                                        : ""
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="mt-1">
                                        <Checkbox
                                          id={variable.id}
                                          checked={isAlwaysSelected}
                                          disabled={isRequired}
                                          onCheckedChange={() =>
                                            handleVariableToggle(
                                              variable.id,
                                              variable.name,
                                              {
                                                type: variable.type,
                                                description:
                                                  variable.description,
                                                enum: variable.enum,
                                              },
                                              undefined
                                            )
                                          }
                                          data-variable={`{{${variable.name}}}`}
                                          className={
                                            isRequired
                                              ? "cursor-not-allowed"
                                              : ""
                                          }
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <Label
                                          htmlFor={variable.id}
                                          className={`block ${
                                            isRequired
                                              ? "cursor-not-allowed"
                                              : "cursor-pointer"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-gray-900">
                                              {variable.name}
                                            </span>
                                            <Badge
                                              variant="secondary"
                                              className="bg-orange-200 text-orange-800 text-[10px] px-1 py-0"
                                            >
                                              {variable.type}
                                            </Badge>
                                            {isRequired && (
                                              <Badge
                                                variant="outline"
                                                className="border-red-300 text-red-700 text-[10px] px-1 py-0"
                                              >
                                                Required
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-600">
                                            {variable.description}
                                          </p>
                                        </Label>
                                      </div>
                                    </div>
                                  </Card>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBookingActionPage;
