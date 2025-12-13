"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusIcon,
  TrashIcon,
  MailIcon,
  MessageSquare,
  LayersIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PhoneIcon,
  ArrowLeftIcon,
  SaveIcon
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import BasicInformation from "@/components/action/send-notification/BasicInformation";
import { createActionApi, getActionByIdApi, updateActionApi } from "@/network/Api";
import { useSearchParams, useRouter } from "next/navigation";

// Form validation schema
const notificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  isSilentNotification: z.boolean().default(false),
  startMessage: z.string().min(3, "Start message must be at least 3 characters").max(200).optional().or(z.literal("")),
  delayMessage: z.string().min(3, "Delay message must be at least 3 characters").max(200).optional().or(z.literal("")),
  endMessage: z.string().min(3, "End message must be at least 3 characters").max(200).optional().or(z.literal("")),
  groups: z.array(z.object({
    id: z.string().optional(),
    name: z.string().default("Notification Group"),
    is_user_group: z.boolean().default(false),
    emailEnabled: z.boolean().default(false),
    smsEnabled: z.boolean().default(false),
    email: z.object({
      subject: z.string().min(3, "Subject is required").max(100),
      content: z.string().min(10, "Content is required").max(2000),
      customEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
      ccEmail: z.string().email("Invalid email format").optional().or(z.literal(""))
    }),
    sms: z.object({
      message: z.string().min(5, "Message is required").max(160),
      customPhone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format").optional().or(z.literal(""))
    })
  }))
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

const CreateNotificationPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const actionId = searchParams.get("actionId");
  const [actionData, setActionData] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActionData = async () => {
    if (!actionId) return;
    
    setIsLoading(true);
    try {
      const res = await getActionByIdApi(actionId);
      setActionData(res.data);
      setIsEdit(true);
    } catch (err: any) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (actionId) {
      fetchActionData();
    }
  }, [actionId]);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      description: '',
      isSilentNotification: true,
      startMessage: "Alright, I'm sending you a quick message now with all the details. Just give me a moment.",
      delayMessage: "One moment please, your message is being processed.",
      endMessage: "Got it! I've sent the message—please check your phone.",
      groups: [{
        id: `group_${Math.random().toString(36).substr(2, 9)}`,
        name: "Notification Group 1",
        is_user_group: false,
        emailEnabled: false,
        smsEnabled: false,
        email: {
          subject: '',
          content: '',
          customEmail: '',
          ccEmail: ''
        },
        sms: {
          message: '',
          customPhone: ''
        }
      }]
    }
  });

  // Add useEffect to populate form data when editing
  useEffect(() => {
    if (isEdit && actionData) {
      // Set basic information
      form.setValue('title', actionData.name || '');
      form.setValue('description', actionData.function?.description || '');

      // Set messages if they exist
      const messages = actionData.messages || [];
      const startMessage = messages.find((m: any) => m.type === 'request-start')?.content;
      const delayMessage = messages.find((m: any) => m.type === 'request-failed')?.content;
      const endMessage = messages.find((m: any) => m.type === 'request-complete')?.content;

      form.setValue('startMessage', startMessage || '');
      form.setValue('delayMessage', delayMessage || '');
      form.setValue('endMessage', endMessage || '');
      form.setValue('isSilentNotification', messages.length === 0);

      // Set notification groups
      const groups = actionData.notification?.notification_groups?.map((group: any) => ({
        id: group.id,
        name: group.name,
        is_user_group: group.is_user_group,
        emailEnabled: group.email_notification,
        smsEnabled: group.sms_notification,
        email: {
          subject: group.email_subject || '',
          content: group.email_template || '',
          customEmail: group.email || '',
          ccEmail: group.email_cc?.[0] || ''
        },
        sms: {
          message: group.sms_template || '',
          customPhone: group.phone_number || ''
        }
      })) || [];

      form.setValue('groups', groups);

      // Expand the first group by default
      if (groups.length > 0) {
        setExpandedGroupIndex(0);
      }
    }
  }, [isEdit, actionData, form]);

  const watchGroups = form.watch("groups");
  const { isSubmitting } = form.formState;
  const [editingGroupName, setEditingGroupName] = useState<number | null>(null);
  const [expandedGroupIndex, setExpandedGroupIndex] = useState<number>(0);

  const toggleGroupCollapse = (index: number) => {
    if (expandedGroupIndex === index) {
      // If clicking on the already expanded group, we don't collapse it
      return;
    } else {
      // Expand the clicked group and collapse others
      setExpandedGroupIndex(index);
    }
  };

  const isGroupActive = (group: NotificationFormValues['groups'][0]) => {
    return group.is_user_group;
  };

  // Convert function name to lowercase with underscores for backend
  const formatFunctionNameForBackend = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '_');
  };

  const onSubmit = async (data: NotificationFormValues) => {
    console.log("update-data", data);
    try {
      // Build required parameters array based on enabled features
      const requiredParams = [];
      if (data.groups.some(group => group.is_user_group && group.emailEnabled)) {
        requiredParams.push("email");
      }
      if (data.groups.some(group => group.is_user_group && group.smsEnabled)) {
        requiredParams.push("phone_number");
      }

      // Convert form data to API payload format
      const payload = {
        type: "function",
        atype: "notification",
        async: false,
        name: formatFunctionNameForBackend(data.title),
        function: {
          name: actionData?.function?.name || "send_sms", // Preserve original function name
          strict: false,
          description: data.description,
          parameters: {
            type: "object",
            properties: {
              first_name: {
                description: "First name of the user",
                type: "string"
              },
              last_name: {
                description: "Last name of the user",
                type: "string"
              },
              ...(data.groups.some(group => group.is_user_group && group.smsEnabled) ? {
                phone_number: {
                  description: "Ask phone number from user during the call for SMS",
                  type: "string"
                }
              } : {}),
              ...(data.groups.some(group => group.is_user_group && group.emailEnabled) ? {
                email: {
                  description: "Ask email from the user during the call",
                  type: "string"
                }
              } : {})
            },
            required: ["first_name", "last_name", ...requiredParams]
          }
        },
        messages: data.isSilentNotification ? [] : [
          {
            type: "request-start",
            content: data.startMessage,
            blocking: true
          },
          {
            type: "request-complete",
            content: data.endMessage,
            end_call_after_spoken_enabled: false
          },
          {
            type: "request-failed",
            content: data.delayMessage,
            end_call_after_spoken_enabled: true
          }
        ],
        notification: {
          notification_groups: data.groups.map(group => ({
            id: group.id || `group_${Math.random().toString(36).substr(2, 9)}`,
            name: group.name,
            is_user_group: group.is_user_group,
            email_notification: group.emailEnabled,
            email_subject: group.email.subject,
            email_cc: group.email.ccEmail ? [group.email.ccEmail] : null,
            sms_notification: group.smsEnabled,
            email_template: group.email.content,
            sms_template: group.sms.message,
            email: !group.is_user_group ? group.email.customEmail : null,
            phone_number: !group.is_user_group ? group.sms.customPhone : null
          }))
        }
      };

      if (isEdit && actionData) {
        // Update existing action
        updateActionApi(actionData.id, payload).then((res: any) => {
          if (res.data) {
            toast({
              title: "Notification updated successfully",
              description: "Notification updated successfully",
              variant: "default"
            });
            form.reset();
          }
        }).catch((err: any) => {
          console.log(err);
          toast({
            title: "Notification update failed",
            description: "Failed to update notification",
            variant: "destructive"
          });
        });
      } else {
        // Create new action
        createActionApi(payload).then((res: any) => {
          if (res.data) {
            toast({
              title: "Notification created successfully",
              description: "Notification created successfully",
              variant: "default"
            });
            form.reset();
          }
        }).catch((err: any) => {
          console.log(err);
          toast({
            title: "Notification creation failed",
            description: "Failed to create notification",
            variant: "destructive"
          });
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your notification.",
        variant: "destructive",
      });
    }
  };

  const addGroup = () => {
    const currentGroups = form.getValues("groups") || [];
    const newGroupIndex = currentGroups.length;
    form.setValue("groups", [
      ...currentGroups,
      {
        id: `group_${Math.random().toString(36).substr(2, 9)}`,
        name: `Notification Group ${currentGroups.length + 1}`,
        is_user_group: false,
        emailEnabled: false,
        smsEnabled: false,
        email: {
          subject: "",
          content: "",
          customEmail: "",
          ccEmail: ""
        },
        sms: {
          message: "",
          customPhone: ""
        }
      }
    ]);

    // When adding a new group, set it as the expanded group and collapse others
    setExpandedGroupIndex(newGroupIndex);
  };

  const removeGroup = (index: number) => {
    const currentGroups = form.getValues("groups");
    form.setValue(
      "groups",
      currentGroups.filter((_, i) => i !== index)
    );

    // If we're removing the currently expanded group, expand the first group
    if (expandedGroupIndex === index) {
      setExpandedGroupIndex(0);
    }
    // If we're removing a group before the expanded group, adjust the expanded index
    else if (expandedGroupIndex > index) {
      setExpandedGroupIndex(expandedGroupIndex - 1);
    }
  };

  // Initialize expanded state for the first group
  useEffect(() => {
    setExpandedGroupIndex(0);
  }, []);

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {isEdit ? 'Edit Notification' : 'Create Notification'}
              </h1>
              <p className="text-sm text-gray-500">
                {isEdit ? 'Update your notification settings' : 'Set up a new notification action'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log("Validation errors:", errors);
          })} className="px-6 py-6">
            <Card className="max-w-4xl mx-auto border-none shadow-lg rounded-xl overflow-hidden">
              <CardContent className="p-8 space-y-10">
                <BasicInformation form={form} />

                <div id="section-message-groups" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notification Channels</h3>
                    <Badge variant="outline" className="bg-gray-50 text-gray-600">
                      {watchGroups?.length} {watchGroups?.length === 1 ? 'Group' : 'Groups'}
                    </Badge>
                  </div>

                  <div id="message-group-list" className="space-y-8">
                    {watchGroups?.map((group, index) => (
                      <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-indigo-100 transition-all relative group space-y-8">
                        <div className="flex items-center justify-between mb-4">
                          <div className="font-semibold text-gray-900 text-base flex items-center gap-2">
                            <LayersIcon className="h-5 w-5 text-indigo-500" />
                            {editingGroupName === index ? (
                              <FormField
                                control={form.control}
                                name={`groups.${index}.name`}
                                render={({ field }) => (
                                  <FormItem className="m-0">
                                    <FormControl>
                                      <Input
                                        className="h-8 px-2 py-1 text-sm"
                                        autoFocus
                                        {...field}
                                        onBlur={() => setEditingGroupName(null)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            setEditingGroupName(null);
                                          }
                                        }}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>{group.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-indigo-500"
                                  onClick={() => setEditingGroupName(index)}
                                  type="button"
                                >
                                  <PencilIcon className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}

                            {isGroupActive(group) && (
                              <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-indigo-500 rounded-full h-8 w-8 p-0"
                              onClick={() => toggleGroupCollapse(index)}
                              type="button"
                            >
                              {expandedGroupIndex !== index ? (
                                <ChevronDownIcon className="h-5 w-5" />
                              ) : (
                                <ChevronUpIcon className="h-5 w-5" />
                              )}
                            </Button>
                            {watchGroups?.length > 1 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                                      onClick={() => removeGroup(index)}
                                      type="button"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Remove this group</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>

                        {expandedGroupIndex === index && (
                          <>
                            <div className="space-y-6">
                              <FormField
                                control={form.control}
                                name={`groups.${index}.is_user_group`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium mb-2 block">Notification Recipient</FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        value={field.value ? "user" : "custom"}
                                        onValueChange={(value) => {
                                          field.onChange(value === "user");
                                          // Reset custom fields when switching to user
                                          if (value === "user") {
                                            form.setValue(`groups.${index}.email.customEmail`, "");
                                            form.setValue(`groups.${index}.email.ccEmail`, "");
                                            form.setValue(`groups.${index}.sms.customPhone`, "");
                                          }
                                        }}
                                        className="flex items-center gap-6"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="user" id={`recipient-user-${index}`} />
                                          <Label htmlFor={`recipient-user-${index}`} className="cursor-pointer">Ask User During Call</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="custom" id={`recipient-custom-${index}`} />
                                          <Label htmlFor={`recipient-custom-${index}`} className="cursor-pointer">Use Custom Contact Info</Label>
                                        </div>
                                      </RadioGroup>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />

                              <div className="flex flex-wrap gap-6">
                                <FormField
                                  control={form.control}
                                  name={`groups.${index}.emailEnabled`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
                                      <FormControl>
                                        <Checkbox
                                          id={`send-email-${index}`}
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel htmlFor={`send-email-${index}`} className="text-gray-800 font-medium cursor-pointer flex items-center gap-1.5">
                                        <MailIcon className="h-4 w-4 text-indigo-600" />
                                        Send Email
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`groups.${index}.smsEnabled`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
                                      <FormControl>
                                        <Checkbox
                                          id={`send-sms-${index}`}
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel htmlFor={`send-sms-${index}`} className="text-gray-800 font-medium cursor-pointer flex items-center gap-1.5">
                                        <MessageSquare className="h-4 w-4 text-indigo-600" />
                                        Send SMS
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {watchGroups?.[index]?.emailEnabled && (
                                <Card className="border border-indigo-100 shadow-sm overflow-hidden">
                                  <CardHeader className="bg-indigo-50 pb-2">
                                    <CardTitle className="text-base flex items-center gap-2 text-indigo-700">
                                      <MailIcon className="h-4 w-4" />
                                      Email Notification
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-5 space-y-5">
                                    <div className="grid gap-6">
                                      <FormField
                                        control={form.control}
                                        name={`groups.${index}.email.subject`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel htmlFor={`email-subject-${index}`} className="text-sm font-medium mb-2 block">
                                              Email Subject <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                              <Input
                                                id={`email-subject-${index}`}
                                                className="bg-gray-50 border border-gray-200 focus:ring-indigo-500"
                                                placeholder="Subject for the email"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`groups.${index}.email.content`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel htmlFor={`email-content-${index}`} className="text-sm font-medium mb-2 block">
                                              Email Content <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                              <Textarea
                                                id={`email-content-${index}`}
                                                rows={3}
                                                className="bg-gray-50 border border-gray-200 focus:ring-indigo-500"
                                                placeholder="Type the email content to be sent"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>

                                    {!watchGroups?.[index]?.is_user_group && (
                                      <div className="space-y-3 mt-3">
                                        <FormField
                                          control={form.control}
                                          name={`groups.${index}.email.customEmail`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel htmlFor={`custom-email-${index}`} className="text-sm font-medium mb-2 block">
                                                Recipient Email <span className="text-red-500">*</span>
                                              </FormLabel>
                                              <FormControl>
                                                <Input
                                                  type="email"
                                                  className="bg-white border border-gray-200 focus:ring-indigo-500"
                                                  placeholder="Recipient Email"
                                                  {...field}
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        <FormField
                                          control={form.control}
                                          name={`groups.${index}.email.ccEmail`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormControl>
                                                <Input
                                                  type="email"
                                                  className="bg-white border border-gray-200 focus:ring-indigo-500"
                                                  placeholder="CC Email (optional)"
                                                  {...field}
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )}

                              {watchGroups?.[index]?.smsEnabled && (
                                <Card className="border border-indigo-100 shadow-sm overflow-hidden">
                                  <CardHeader className="bg-indigo-50 pb-2">
                                    <CardTitle className="text-base flex items-center gap-2 text-indigo-700">
                                      <MessageSquare className="h-4 w-4" />
                                      SMS Notification
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-5 space-y-5">
                                    <FormField
                                      control={form.control}
                                      name={`groups.${index}.sms.message`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel htmlFor={`sms-message-${index}`} className="text-sm font-medium mb-2 block">
                                            SMS Message <span className="text-red-500">*</span>
                                          </FormLabel>
                                          <FormControl>
                                            <Textarea
                                              id={`sms-message-${index}`}
                                              rows={3}
                                              className="bg-gray-50 border border-gray-200 focus:ring-indigo-500"
                                              placeholder="Type the SMS message to be sent"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    {!watchGroups?.[index]?.is_user_group && (
                                      <FormField
                                        control={form.control}
                                        name={`groups.${index}.sms.customPhone`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel htmlFor={`custom-phone-${index}`} className="text-sm font-medium mb-2 block">
                                              Custom Phone Number <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                              <div className="relative">
                                                <PhoneInput
                                                  international
                                                  defaultCountry="CA"
                                                  placeholder="Enter phone number"
                                                  value={field.value}
                                                  onChange={(value) => {
                                                    field.onChange(value);
                                                    // Validate phone number format
                                                    if (value && !/^\+?[0-9]{10,15}$/.test(value)) {
                                                      form.setError(`groups.${index}.sms.customPhone`, {
                                                        type: "manual",
                                                        message: "Please enter a valid phone number"
                                                      });
                                                    } else {
                                                      form.clearErrors(`groups.${index}.sms.customPhone`);
                                                    }
                                                  }}
                                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                                                  inputclassname="w-full border-0 bg-transparent p-0 outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                                  countries={["US", "CA"]}
                                                  maxLength={15}
                                                />
                                                <PhoneIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                                              </div>
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    )}
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-12 h-12 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200"
                            onClick={addGroup}
                            type="button"
                          >
                            <PlusIcon className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add another notification group</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateNotificationPage;