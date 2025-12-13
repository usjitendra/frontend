import React, { useState, useEffect, useRef } from "react";
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
  SaveIcon,
  XIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PhoneIcon,
  ArrowLeftIcon
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
import BasicInformation from "./BasicInformation";
import { createActionApi, getGlobalVariableApi, updateActionApi } from "@/network/Api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SYSTEM_VARIABLES, DEFAULT_VARIABLES } from "@/_utils/constants";
import { formatActionName } from "@/_utils/general";

const VariableInserter = ({
  onVariableSelect,
  globalVariables,
  isLoading
}: {
  onVariableSelect: (variable: string) => void;
  globalVariables: any;
  isLoading?: boolean;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className=""
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <PlusIcon className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Loading...' : 'Add Variable'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0">
        <ScrollArea className="h-72">
          <div className="p-4 space-y-2">
            {/* System Variables Section */}
            <div>
              <p className="text-sm text-gray-400 px-2 pt-2">System Variables</p>
              {SYSTEM_VARIABLES.map((variable) => (
                <Button
                  key={variable}
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => onVariableSelect(`{${variable}}`)}
                >
                  {variable}
                </Button>
              ))}
            </div>

            {/* Global Variables Section */}
            {Object.keys(globalVariables).map((groupName) => {
              const group = globalVariables[groupName];
              let sortedProperties: string[] = [];
              
              if (group?.properties) {
                const propertyNames = Object.keys(group.properties);
                
                // Check if this is the "Default Variables" group (case-insensitive)
                if (group.name.toLowerCase().includes('default')) {
                  // Sort according to DEFAULT_VARIABLES order
                  const defaultVarSet = new Set(DEFAULT_VARIABLES);
                  const defaultVars: string[] = [];
                  const otherVars: string[] = [];
                  
                  propertyNames.forEach(propName => {
                    if (defaultVarSet.has(propName)) {
                      defaultVars.push(propName);
                    } else {
                      otherVars.push(propName);
                    }
                  });
                  
                  // Sort default variables according to DEFAULT_VARIABLES order
                  defaultVars.sort((a, b) => DEFAULT_VARIABLES.indexOf(a) - DEFAULT_VARIABLES.indexOf(b));
                  
                  // Sort other variables alphabetically
                  otherVars.sort();
                  
                  // Combine: default variables first, then others
                  sortedProperties = [...defaultVars, ...otherVars];
                } else {
                  // For non-default groups, sort alphabetically
                  sortedProperties = propertyNames.sort();
                }
              }
              
              return (
                <div key={group.id}>
                  <p className="text-sm text-gray-400 px-2 pt-2">{group.name}</p>
                  {sortedProperties.map((propName) => (
                    <Button
                      key={propName}
                      type="button"
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onVariableSelect(`{${propName}}`)}
                    >
                      {propName}
                    </Button>
                  ))}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

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
      subject: z.string().min(3, "Subject is required").max(100).optional().or(z.literal("")),
      content: z.string().min(10, "Content is required").max(2000).optional().or(z.literal("")),
      customEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
      ccEmail: z.string().email("Invalid email format").optional().or(z.literal(""))
    }),
    sms: z.object({
      message: z.string().min(5, "Message is required").max(160).optional().or(z.literal("")),
      customPhone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format").optional().or(z.literal("")).optional().or(z.literal(""))
    })
  }))
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

// Default form values
const getDefaultFormValues = (): NotificationFormValues => ({
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
});

const CreateNotification = ({
  setShowCreateNotification,
  isEdit,
  actionData,
  fetchActions,
  resetActionState
}: {
  setShowCreateNotification: (show: boolean) => void,
  isEdit: boolean,
  actionData: any,
  fetchActions?: () => void,
  resetActionState?: () => void
}) => {
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: getDefaultFormValues()
  });

  const watchGroups = form.watch("groups");
  const [editingGroupName, setEditingGroupName] = useState<number | null>(null);
  const [expandedGroupIndex, setExpandedGroupIndex] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailTextareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const smsTextareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [cursorPosition, setCursorPosition] = useState<{ email: Record<number, number>, sms: Record<number, number> }>({ email: {}, sms: {} });
  const [globalVariables, setGlobalVariables] = useState<any>({});
  const [isLoadingVariables, setIsLoadingVariables] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get all valid variables (system + global)
  const getValidVariables = (): string[] => {
    const validVariables: string[] = [...SYSTEM_VARIABLES];
    
    // Add global variables only if they are loaded
    if (!isLoadingVariables && Object.keys(globalVariables).length > 0) {
      Object.keys(globalVariables).forEach(groupKey => {
        const group = globalVariables[groupKey];
        if (group.properties) {
          const propertyNames = Object.keys(group.properties);
          
          // Apply same sorting logic as in VariableInserter for consistency
          if (group.name.toLowerCase().includes('default')) {
            const defaultVarSet = new Set(DEFAULT_VARIABLES);
            const defaultVars: string[] = [];
            const otherVars: string[] = [];
            
            propertyNames.forEach(propName => {
              if (defaultVarSet.has(propName)) {
                defaultVars.push(propName);
              } else {
                otherVars.push(propName);
              }
            });
            
            defaultVars.sort((a, b) => DEFAULT_VARIABLES.indexOf(a) - DEFAULT_VARIABLES.indexOf(b));
            otherVars.sort();
            
            validVariables.push(...defaultVars, ...otherVars);
          } else {
            validVariables.push(...propertyNames.sort());
          }
        }
      });
    }
    
    return validVariables;
  };

  // Validate variables in text content
  const validateVariablesInText = (text: string): { isValid: boolean; invalidVariables: string[] } => {
    if (!text) return { isValid: true, invalidVariables: [] };
    
    // Don't validate if global variables are still loading or not initialized
    if (isLoadingVariables || !isInitialized) return { isValid: true, invalidVariables: [] };
    
    const variablePattern = /\{([^}]+)\}/g;
    const invalidVariables: string[] = [];
    const validVariables = getValidVariables();
    
    // Debug logging
    console.log('Validating text:', text);
    console.log('Valid variables:', validVariables);
    console.log('isLoadingVariables:', isLoadingVariables);
    console.log('isInitialized:', isInitialized);
    console.log('globalVariables keys:', Object.keys(globalVariables));
    
    let match;
    
    while ((match = variablePattern.exec(text)) !== null) {
      const variableName = match[1].trim();
      if (!validVariables.includes(variableName)) {
        invalidVariables.push(variableName);
      }
    }
    
    return {
      isValid: invalidVariables.length === 0,
      invalidVariables: [...new Set(invalidVariables)] // Remove duplicates
    };
  };

  // Custom validation for email content
  const validateEmailContent = (content: string, groupIndex: number) => {
    // Don't validate if global variables are still loading or not initialized
    if (isLoadingVariables || !isInitialized) return true;
    
    const validation = validateVariablesInText(content);
    if (!validation.isValid) {
      form.setError(`groups.${groupIndex}.email.content`, {
        type: "manual",
        message: `Invalid variables found: {${validation.invalidVariables.join('}, {')}. Please use only available variables from the dropdown.`
      });
      return false;
    } else {
      form.clearErrors(`groups.${groupIndex}.email.content`);
      return true;
    }
  };

  // Custom validation for email subject
  const validateEmailSubject = (subject: string, groupIndex: number) => {
    // Don't validate if global variables are still loading or not initialized
    if (isLoadingVariables || !isInitialized) return true;
    
    const validation = validateVariablesInText(subject);
    if (!validation.isValid) {
      form.setError(`groups.${groupIndex}.email.subject`, {
        type: "manual",
        message: `Invalid variables found: {${validation.invalidVariables.join('}, {')}. Please use only available variables from the dropdown.`
      });
      return false;
    } else {
      form.clearErrors(`groups.${groupIndex}.email.subject`);
      return true;
    }
  };

  // Custom validation for SMS message
  const validateSmsMessage = (message: string, groupIndex: number) => {
    // Don't validate if global variables are still loading or not initialized
    if (isLoadingVariables || !isInitialized) return true;
    
    const validation = validateVariablesInText(message);
    if (!validation.isValid) {
      form.setError(`groups.${groupIndex}.sms.message`, {
        type: "manual",
        message: `Invalid variables found: {${validation.invalidVariables.join('}, {')}. Please use only available variables from the dropdown.`
      });
      return false;
    } else {
      form.clearErrors(`groups.${groupIndex}.sms.message`);
      return true;
    }
  };

  // Reset form and state when component unmounts or mode changes
  useEffect(() => {
    return () => {
      // Cleanup function - reset form and state when component unmounts
      form.reset(getDefaultFormValues());
      setEditingGroupName(null);
      setExpandedGroupIndex(0);
      setIsSubmitting(false);
    };
  }, [form]);

  // Reset form when switching between edit and create modes
  useEffect(() => {
    form.reset(getDefaultFormValues());
    setEditingGroupName(null);
    setExpandedGroupIndex(0);
    setIsSubmitting(false);
    setIsInitialized(false);
  }, [isEdit, form]);

  // Add useEffect to populate form data when editing
  useEffect(() => {
    if (isEdit && actionData) {
      // Set basic information
      form.setValue('title', formatActionName(actionData.name || ''));
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
      const groups = actionData.notification?.notification_groups?.map((group: any) => {
        // Check if email content exists (both subject and template should be non-empty)
        const hasEmailContent = Boolean(
          group.email_subject &&
          group.email_subject.trim() &&
          group.email_template &&
          group.email_template.trim()
        );

        // Check if SMS content exists (template should be non-empty)
        const hasSmsContent = Boolean(group.sms_template && group.sms_template.trim());

        return {
          id: group.id,
          name: group.name,
          is_user_group: group.is_user_group,
          emailEnabled: Boolean(group.email_notification),
          smsEnabled: Boolean(group.sms_notification),
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
        };
      }) || [];

      // Use setTimeout to ensure form is ready and force re-render
      setTimeout(() => {
        form.setValue('groups', groups, { shouldValidate: true });
        
        // Validate variables in the loaded content after global variables are loaded
        // This will be handled by the re-validation in getGlobalVariables instead
        // to ensure proper timing
      }, 0);

      // Expand the first group by default
      if (groups.length > 0) {
        setExpandedGroupIndex(0);
      } else {
        setExpandedGroupIndex(null);
      }
    }
  }, [isEdit, actionData, form]);

  const getGlobalVariables = () => {
    setIsLoadingVariables(true);
    getGlobalVariableApi().then((response: any) => {
      if (response.data) {
        const transformedData: any = {};
        response.data.data.folders?.forEach((group: any) => {
          transformedData[group.name.toLowerCase().replace(/\s+/g, '_')] = {
            id: group.id,
            name: group.name,
            properties: group.properties
          };
        });
        setGlobalVariables(transformedData);
        
        // Set loading to false first, then re-validate
        setIsLoadingVariables(false);
        setIsInitialized(true);
        
        // Re-validate all existing content after global variables are loaded
        setTimeout(() => {
          const currentGroups = form.getValues("groups");
          currentGroups.forEach((group: any, index: number) => {
            if (group.emailEnabled) {
              if (group.email.subject) {
                validateEmailSubject(group.email.subject, index);
              }
              if (group.email.content) {
                validateEmailContent(group.email.content, index);
              }
            }
            if (group.smsEnabled && group.sms.message) {
              validateSmsMessage(group.sms.message, index);
            }
          });
        }, 100);
      } else {
        setIsLoadingVariables(false);
      }
    }).catch((err: any) => {
      console.log(err);
      setIsLoadingVariables(false);
    });
  };

  useEffect(() => {
    getGlobalVariables();
  }, []);

  const handleCancel = () => {
    // Reset form to default values
    form.reset(getDefaultFormValues());
    setEditingGroupName(null);
    setExpandedGroupIndex(0);
    setIsSubmitting(false);
    setIsInitialized(false);

    // Call parent reset function if provided
    if (resetActionState) {
      resetActionState();
    }

    // Hide the component
    setShowCreateNotification(false);
  };

  const toggleGroupCollapse = (index: number) => {
    if (expandedGroupIndex === index) {
      // If clicking on the already expanded group, we don't collapse it
      setExpandedGroupIndex(null);
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

  // Extract variables from text content ({{variableName}} format)
  const extractVariablesFromText = (text: string): string[] => {
    if (!text) return [];
    const variablePattern = /\{([^}]+)\}/g;
    const variables: string[] = [];
    let match;
    while ((match = variablePattern.exec(text)) !== null) {
      variables.push(match[1]);
    }
    return [...new Set(variables)]; // Remove duplicates
  };

  // Get all used variables from all groups
  const getAllUsedVariables = (groups: NotificationFormValues['groups']): Record<string, any> => {
    const usedVariables: Record<string, any> = {};

    // Helper function to find variable in globalVariables
    const findVariableInGlobal = (variableName: string) => {
      for (const groupKey in globalVariables) {
        const group = globalVariables[groupKey];
        if (group.properties && group.properties[variableName]) {
          return group.properties[variableName];
        }
      }
      return null;
    };

    // Helper function to check if variable is a system variable
    const isSystemVariable = (variableName: string) => {
      return SYSTEM_VARIABLES.includes(variableName);
    };

    // Helper function to get system variable definition
    const getSystemVariableDefinition = (variableName: string) => {
      return {
        description: `System variable: ${variableName}`,
        type: "string",
        enum: null
      };
    };

    groups.forEach(group => {
      // Extract from email content
      if (group.emailEnabled && group.email.content) {
        const emailVariables = extractVariablesFromText(group.email.content);
        emailVariables.forEach(variable => {
          if (!usedVariables[variable]) {
            const globalVariable = findVariableInGlobal(variable);
            if (globalVariable) {
              usedVariables[variable] = globalVariable;
            } else if (isSystemVariable(variable)) {
              usedVariables[variable] = getSystemVariableDefinition(variable);
            }
          }
        });
      }

      // Extract from email subject
      if (group.emailEnabled && group.email.subject) {
        const subjectVariables = extractVariablesFromText(group.email.subject);
        subjectVariables.forEach(variable => {
          if (!usedVariables[variable]) {
            const globalVariable = findVariableInGlobal(variable);
            if (globalVariable) {
              usedVariables[variable] = globalVariable;
            } else if (isSystemVariable(variable)) {
              usedVariables[variable] = getSystemVariableDefinition(variable);
            }
          }
        });
      }

      // Extract from SMS message
      if (group.smsEnabled && group.sms.message) {
        const smsVariables = extractVariablesFromText(group.sms.message);
        smsVariables.forEach(variable => {
          if (!usedVariables[variable]) {
            const globalVariable = findVariableInGlobal(variable);
            if (globalVariable) {
              usedVariables[variable] = globalVariable;
            } else if (isSystemVariable(variable)) {
              usedVariables[variable] = getSystemVariableDefinition(variable);
            }
          }
        });
      }
    });

    return usedVariables;
  };

  const onSubmit = async (data: NotificationFormValues) => {
    console.log("update-data", data);
    try {
      setIsSubmitting(true);

      // Validate all variables before submission
      let hasValidationErrors = false;
      data.groups.forEach((group, index) => {
        if (group.emailEnabled) {
          if (group.email.subject && !validateEmailSubject(group.email.subject, index)) {
            hasValidationErrors = true;
          }
          if (group.email.content && !validateEmailContent(group.email.content, index)) {
            hasValidationErrors = true;
          }
        }
        if (group.smsEnabled && group.sms.message && !validateSmsMessage(group.sms.message, index)) {
          hasValidationErrors = true;
        }
      });

      if (hasValidationErrors) {
        setIsSubmitting(false);
        toast({
          title: "Validation Error",
          description: "Please fix the invalid variables before submitting.",
          variant: "destructive"
        });
        return;
      }

      // Build required parameters array based on enabled features

      // Get all used variables from content
      const usedVariables = getAllUsedVariables(data.groups);

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
              // Add conditional parameters based on enabled features
              ...(data.groups.some(group => group.emailEnabled) && {
                email_address: {
                  type: "string",
                  description: "Email address to send the notification to"
                }
              }),
              ...(data.groups.some(group => group.smsEnabled) && {
                phone_number: {
                  type: "string", 
                  description: "Phone number to send the SMS notification to"
                }
              }),
              ...usedVariables
            },
            required: [
              ...new Set([
                ...(data.groups.some(group => group.emailEnabled) ? ['email_address'] : []),
                ...(data.groups.some(group => group.smsEnabled) ? ['phone_number'] : []),
                ...Object.keys(usedVariables)
              ])
            ]
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
            ...(group.emailEnabled && {
              email_subject: group.email.subject,
              email_cc: group.email.ccEmail ? [group.email.ccEmail] : null,
              email_template: group.email.content,
              email: !group.is_user_group ? group.email.customEmail : null,
            }),
            sms_notification: group.smsEnabled,
            ...(group.smsEnabled && {
              sms_template: group.sms.message,
              phone_number: !group.is_user_group ? group.sms.customPhone : null
            })
          }))
        }
      };

      if (isEdit && actionData) {
        // Update existing action
        updateActionApi(actionData.id, payload).then((res: any) => {
          if (res.data) {
            toast({
              title: "Notification updated successfully",
              description: "Your notification has been updated successfully",
              variant: "default"
            });

            // Reset form and state
            form.reset(getDefaultFormValues());
            setEditingGroupName(null);
            setExpandedGroupIndex(0);
            setIsSubmitting(false);

            // Call parent functions
            if (resetActionState) {
              resetActionState();
            }
            if (fetchActions) {
              fetchActions();
            }

            // Hide the component
            setShowCreateNotification(false);
          }
        }).catch((err: any) => {
          console.log(err);
          toast({
            title: "Notification update failed",
            description: "Failed to update notification. Please try again.",
            variant: "destructive"
          });
        }).finally(() => {
          setIsSubmitting(false);
        });
      } else {
        // Create new action
        createActionApi(payload).then((res: any) => {
          if (res.data) {
            toast({
              title: "Notification created successfully",
              description: "Your notification has been created successfully",
              variant: "default"
            });

            // Reset form and state
            form.reset(getDefaultFormValues());
            setEditingGroupName(null);
            setExpandedGroupIndex(0);
            setIsSubmitting(false);

            // Call parent functions
            if (fetchActions) {
              fetchActions();
            }

            // Hide the component
            setShowCreateNotification(false);
          }
        }).catch((err: any) => {
          console.log(err);
          toast({
            title: "Notification creation failed",
            description: "Failed to create notification. Please try again.",
            variant: "destructive"
          });
        }).finally(() => {
          setIsSubmitting(false);
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your notification.",
        variant: "destructive",
      });
      setIsSubmitting(false);
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

          // If we're removing the currently expanded group, expand the first group if there are groups left
      if (expandedGroupIndex === index) {
        const remainingGroups = currentGroups.filter((_, i) => i !== index);
        setExpandedGroupIndex(remainingGroups.length > 0 ? 0 : null);
      }
    // If we're removing a group before the expanded group, adjust the expanded index
    else if (expandedGroupIndex !== null && expandedGroupIndex > index) {
      setExpandedGroupIndex(expandedGroupIndex - 1);
    }
  };

  // Initialize expanded state for the first group
  useEffect(() => {
    if (watchGroups && watchGroups.length > 0) {
      setExpandedGroupIndex(0);
    } else {
      setExpandedGroupIndex(null);
    }
  }, [watchGroups?.length]);

  const handleVariableInsert = (
    variable: string,
    index: number,
    type: 'email' | 'sms'
  ) => {
    const fieldName = type === 'email' ? `groups.${index}.email.content` : `groups.${index}.sms.message`;
    const currentContent = form.getValues(fieldName as any) || "";
    const position = cursorPosition[type][index] ?? currentContent.length;
    const newContent = [
      currentContent.slice(0, position),
      variable,
      currentContent.slice(position)
    ].join('');
    form.setValue(fieldName as any, newContent, { shouldValidate: true });

    // Refocus and set cursor position
    const textareaRef = type === 'email' ? emailTextareaRefs.current[index] : smsTextareaRefs.current[index];
    if (textareaRef) {
      textareaRef.focus();
      setTimeout(() => {
        textareaRef.selectionStart = textareaRef.selectionEnd = position + variable.length;
      }, 0);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.log("Validation errors:", errors);
      })} className="bg-gray-100">
        {/* Header with Submit Button */}
        <div className="w-full mx-auto mb-6 bg-white p-6 shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {isEdit ? (
                    <>
                      <span className="text-amber-600">Edit</span>
                      <span>Notification</span>
                    </>
                  ) : (
                    <>
                      <span className="text-amber-600">Create</span>
                      <span>Notification</span>
                    </>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEdit
                    ? `Update notification settings for this notification`
                    : 'Set up automated notifications for your users'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="px-4 py-2 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <SaveIcon className="w-4 h-4" />
                    {isEdit ? 'Update Notification' : 'Create Notification'}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

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
                            
Ask User During Call
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
                          {expandedGroupIndex === index ? (
                            <ChevronUpIcon className="h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5" />
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
                                            onChange={(e) => {
                                              field.onChange(e);
                                              // Validate variables on change
                                              setTimeout(() => validateEmailSubject(e.target.value, index), 100);
                                            }}
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
                                            ref={(el) => {
                                              field.ref(el);
                                              emailTextareaRefs.current[index] = el;
                                            }}
                                            onChange={(e) => {
                                              field.onChange(e);
                                              // Validate variables on change
                                              setTimeout(() => validateEmailContent(e.target.value, index), 100);
                                            }}
                                            onSelect={(e) => setCursorPosition(prev => ({ ...prev, email: { ...prev.email, [index]: (e.target as HTMLTextAreaElement).selectionStart } }))}
                                          />
                                        </FormControl>
                                        <div className="flex items-center gap-2 mt-2">
                                          <VariableInserter
                                            onVariableSelect={(variable) => handleVariableInsert(variable, index, 'email')}
                                            globalVariables={globalVariables}
                                            isLoading={isLoadingVariables}
                                          />
                                          <p className="text-xs text-gray-500">Insert variables for dynamic content. Only use variables from the dropdown.</p>
                                        </div>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
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
                                          ref={(el) => {
                                            field.ref(el);
                                            smsTextareaRefs.current[index] = el;
                                          }}
                                          onChange={(e) => {
                                            field.onChange(e);
                                            // Validate variables on change
                                            setTimeout(() => validateSmsMessage(e.target.value, index), 100);
                                          }}
                                          onSelect={(e) => setCursorPosition(prev => ({ ...prev, sms: { ...prev.sms, [index]: (e.target as HTMLTextAreaElement).selectionStart } }))}
                                        />
                                      </FormControl>
                                                                              <div className="flex items-center gap-2 mt-2">
                                          <VariableInserter
                                            onVariableSelect={(variable) => handleVariableInsert(variable, index, 'sms')}
                                            globalVariables={globalVariables}
                                            isLoading={isLoadingVariables}
                                          />
                                          <p className="text-xs text-gray-500">Insert variables for dynamic content. Only use variables from the dropdown.</p>
                                        </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
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
  );
};

export default CreateNotification;