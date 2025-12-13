'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Info } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createActionApi, getGlobalVariableApi, updateActionApi } from '@/network/Api';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
    actionName: z.string().min(2, {
        message: "Action name must be at least 2 characters.",
    }),
    atype: z.enum(["calendar_availability", "calendar_booking"], {
        required_error: "Please select an action type.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    startMessage: z.string().optional().or(z.string().min(5, {
        message: "If provided, start message must be at least 5 characters.",
    })),
    completeMessage: z.string().optional().or(z.string().min(5, {
        message: "If provided, complete message must be at least 5 characters.",
    })),
    failedMessage: z.string().optional().or(z.string().min(5, {
        message: "If provided, failed message must be at least 5 characters.",
    })),
});

interface CreateBookingProps {
    onClose?: () => void;
    fetchActions?: () => void;
    isEdit?: boolean;
    actionData?: any;
    setShowCreateBooking?: (show: boolean) => void;
    setIsSubmitting?: (isSubmitting: boolean) => void;
}

interface CustomParameter {
    name: string;
    description: string;
    type: string;
    required: boolean;
}

interface Message {
    contents: null;
    content: string;
    conditions: null;
    type: string;
    blocking?: boolean;
    role?: string | null;
    end_call_after_spoken_enabled?: boolean;
}

const CreateBooking = ({ onClose, fetchActions, isEdit, actionData, setShowCreateBooking, setIsSubmitting }: CreateBookingProps) => {
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>(['start_time', 'end_time']);
    const [isSubmittingLocal, setIsSubmittingLocal] = useState<boolean>(false);
    const [customParameters, setCustomParameters] = useState<CustomParameter[]>([]);
    const [newParamName, setNewParamName] = useState<string>('');
    const [newParamDescription, setNewParamDescription] = useState<string>('');
    const [newParamType, setNewParamType] = useState<string>('string');
    const [showAddParam, setShowAddParam] = useState<boolean>(false);
    const [showCustomParams, setShowCustomParams] = useState<boolean>(false);

    const [globalVariables, setGlobalVariables] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // SMS and Email confirmation states
    const [sendSmsConfirmation, setSendSmsConfirmation] = useState<boolean>(false);
    const [sendEmailConfirmation, setSendEmailConfirmation] = useState<boolean>(false);
    const [smsTemplate, setSmsTemplate] = useState<string>('Your appointment has been confirmed for {start_time}. Thank you!');
    const [emailTemplate, setEmailTemplate] = useState<string>('Dear user,\n\nYour appointment has been confirmed for {start_time}.\n\nThank you for choosing our services.\n\nBest regards,\nYour Team');

    // Template validation errors
    const [smsTemplateError, setSmsTemplateError] = useState<string>('');
    const [emailTemplateError, setEmailTemplateError] = useState<string>('');

    // Add state for copied variable
    const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

    // Add state for selected variables (multi-select)
    const [selectedVariables, setSelectedVariables] = useState<string[]>([]);

    // Add state for selected folder
    const [selectedFolder, setSelectedFolder] = useState<string>('');

    console.log("actionData", actionData);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            actionName: "",
            atype: "calendar_availability",
            description: "",
            startMessage: "Let me check the calendar for an available slot. One moment please.",
            completeMessage: "Perfect! Your appointment has been booked successfully. Is there anything else you'd like to know about your appointment?",
            failedMessage: "I'm still working on booking your appointment. The system is taking a bit longer than usual, but I'll have this confirmed for you in just a moment."
        },
    });
    

    // Format function name from backend format to display format
    const formatFunctionNameForDisplay = (name: string): string => {
        return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Convert function name to lowercase with underscores for backend
    const formatFunctionNameForBackend = (name: string): string => {
        return name.toLowerCase().replace(/\s+/g, '_');
    };

    // Get available variables for templates based on selected requirements and custom parameters
    const getAvailableVariables = (): string[] => {
        const variables = ['{start_time}', '{end_time}'];

        if (selectedRequirements.includes('phone_number')) {
            variables.push('{phone_number}');
        }
        if (selectedRequirements.includes('first_name')) {
            variables.push('{first_name}');
        }
        if (selectedRequirements.includes('last_name')) {
            variables.push('{last_name}');
        }
        if (selectedRequirements.includes('email')) {
            variables.push('{email}');
        }

        // Add custom parameters as variables
        customParameters.forEach(param => {
            variables.push(`{${param.name}}`);
        });

        return variables;
    };

    // Validate template for unauthorized variables
    const validateTemplate = (template: string): string => {
        const availableVariables = getAvailableVariables();
        const templateVariables = template.match(/\{[^}]+\}/g) || [];

        const unauthorizedVariables = templateVariables.filter(variable => {
            return !availableVariables.includes(variable);
        });

        if (unauthorizedVariables.length > 0) {
            const uniqueUnauthorized = [...new Set(unauthorizedVariables)];
            return `The following variables are not available: ${uniqueUnauthorized.join(', ')}. Available variables: ${availableVariables.join(', ')}`;
        }

        return '';
    };

    const fetchGlobalVariables = async () => {
        try {
            setIsLoading(true);
            const response = await getGlobalVariableApi();
            if (response && response.data) {
                const transformedData: any = {};
                response.data.data.folders?.forEach((group: any) => {
                    transformedData[group.name.toLowerCase().replace(/\s+/g, '_')] = {
                        id: group.id,
                        name: group.name,
                        properties: group.properties
                    };
                });
                console.log("transformedData", transformedData);

                setGlobalVariables(transformedData);
                
                // Set default selected folder to the first one
                const folderKeys = Object.keys(transformedData);
                if (folderKeys.length > 0) {
                    setSelectedFolder(folderKeys[0]);
                }
            }
        } catch (error) {
            console.log('Error fetching global variables:', error);
            toast({
                title: 'Failed to fetch variables',
                description: 'Unable to load global variables',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGlobalVariables();
    }, []);

    // Reset form when component mounts or when isEdit/actionData changes
    useEffect(() => {
        // Reset form and state to default values
        const resetForm = () => {
            form.reset({
                actionName: "",
                atype: "calendar_availability",
                description: "",
                startMessage: "Let me check the calendar for an available slot. One moment please.",
                completeMessage: "Perfect! Your appointment has been booked successfully. Is there anything else you'd like to know about your appointment?",
                failedMessage: "I'm still working on booking your appointment. The system is taking a bit longer than usual, but I'll have this confirmed for you in just a moment."
            });
            setSelectedRequirements(['start_time', 'end_time']);
            setCustomParameters([]);
            setSendSmsConfirmation(false);
            setSendEmailConfirmation(false);
            setSmsTemplate('Your appointment has been confirmed for {start_time}. Thank you!');
            setEmailTemplate('Dear user,\n\nYour appointment has been confirmed for {start_time}.\n\nThank you for choosing our services.\n\nBest regards,\nYour Team');
            setSmsTemplateError('');
            setEmailTemplateError('');
        };

        // If not in edit mode, reset the form
        if (!isEdit) {
            resetForm();
        }

        // If in edit mode and has action data, populate the form
        if (isEdit && actionData) {
            // Set form values
            form.setValue('actionName', formatFunctionNameForDisplay(actionData.name || ''));
            form.setValue('atype', actionData.atype || 'calendar_availability');
            form.setValue('description', actionData.function?.description || '');
            // Find messages by their type instead of array index
            const startMessage = actionData.messages?.find((msg: any) => msg.type === "request-start")?.content || '';
            const completeMessage = actionData.messages?.find((msg: any) => msg.type === "request-complete")?.content || '';
            const failedMessage = actionData.messages?.find((msg: any) => msg.type === "request-failed")?.content || '';

            form.setValue('startMessage', startMessage);
            form.setValue('completeMessage', completeMessage);
            form.setValue('failedMessage', failedMessage);

            // Extract required parameters from the action data
            const requiredParams = ['start_time', 'end_time']; // Default required params
            const properties = actionData.function?.parameters?.properties || {};

            // Check which optional parameters exist in the action data
            // const optionalParams = [];
            // if (properties.email) optionalParams.push('email');
            // if (properties.first_name) optionalParams.push('first_name');
            // if (properties.last_name) optionalParams.push('last_name');
            // if (properties.phone_number) optionalParams.push('phone_number');

            // Set selected requirements
            setSelectedRequirements([...requiredParams]);



            // Custom parameters and selected variables will be set by the second useEffect

            // Set SMS and Email confirmation settings from action data
            setSendSmsConfirmation(actionData.function?.parameters?.properties?.sms_notification?.enabled || false);
            setSendEmailConfirmation(actionData.email_confirmation?.enabled || false);
            setSmsTemplate(actionData.sms_confirmation?.template || 'Your appointment has been confirmed for {start_time}. Thank you!');
            setEmailTemplate(actionData.email_confirmation?.template || 'Dear user,\n\nYour appointment has been confirmed for {start_time}.\n\nThank you for choosing our services.\n\nBest regards,\nYour Team');
        }
    }, [isEdit, actionData, form]);

    // Validate templates when selected requirements or custom parameters change
    useEffect(() => {
        if (sendSmsConfirmation) {
            const error = validateTemplate(smsTemplate);
            setSmsTemplateError(error);
        }
        if (sendEmailConfirmation) {
            const error = validateTemplate(emailTemplate);
            setEmailTemplateError(error);
        }
    }, [selectedRequirements, customParameters, sendSmsConfirmation, sendEmailConfirmation, smsTemplate, emailTemplate]);

    // Set selected variables and custom parameters from action data when globalVariables and actionData are available
    useEffect(() => {
        if (isEdit && actionData && Object.keys(globalVariables).length > 0) {
            if (actionData.function?.parameters?.properties) {
                const actionProperties = actionData.function.parameters.properties;
                
                // Fields to skip - these are system fields, not user variables
                const systemFields = ['start_time', 'end_time', 'email_notification', 'sms_notification', 'sms_template', 'email_template', 'provider_id', 'service_id', 'urgent_appointment'];
                
                // Get all global variable keys (from all folders)
                const allGlobalVarKeys: string[] = [];
                Object.values(globalVariables).forEach((folder: any) => {
                    if (folder.properties) {
                        Object.keys(folder.properties).forEach(key => {
                            allGlobalVarKeys.push(key);
                        });
                    }
                });
                
                const variablesToSelect: string[] = [];
                const customParams: CustomParameter[] = [];
                
                // Check each property in actionData
                Object.keys(actionProperties).forEach(actionKey => {
                    const actionKeyLower = actionKey.toLowerCase();
                    
                    // Skip system fields
                    if (systemFields.map(f => f.toLowerCase()).includes(actionKeyLower)) {
                        return;
                    }
                    
                    // Check if this actionData property exists in globalVariables (case-insensitive)
                    const matchingGlobalVar = allGlobalVarKeys.find(globalKey => 
                        globalKey.toLowerCase() === actionKeyLower
                    );
                    
                    if (matchingGlobalVar) {
                        // Found in globalVariables - add as selectable variable
                        const variableToAdd = `{${matchingGlobalVar}}`;
                        if (!variablesToSelect.includes(variableToAdd)) {
                            variablesToSelect.push(variableToAdd);
                        }
                    } else {
                        // Not found in globalVariables - could be external variable or custom parameter
                        // Check if it looks like a variable (has descriptive content)
                        const actionProp = actionProperties[actionKey];
                        if (actionProp && actionProp.description && !actionProp.description.includes('parameter')) {
                            // Treat as external variable
                            const variableToAdd = `{${actionKey}}`;
                            if (!variablesToSelect.includes(variableToAdd)) {
                                variablesToSelect.push(variableToAdd);
                            }
                        } else {
                            // Treat as custom parameter
                            customParams.push({
                                name: actionKey,
                                description: actionProp?.description || '',
                                type: actionProp?.type || 'string',
                                required: actionData.function?.parameters?.required?.includes(actionKey) || false
                            });
                        }
                    }
                });
                
                setSelectedVariables(variablesToSelect);
                setCustomParameters(customParams);
                
                // If there are custom parameters, expand the section
                if (customParams.length > 0) {
                    setShowCustomParams(true);
                }
            }
        }
    }, [isEdit, actionData, globalVariables]);


    const toggleRequirement = (requirement: string) => {
        if (selectedRequirements.includes(requirement)) {
            // Don't allow removing required fields
            if (requirement === 'start_time' || requirement === 'end_time') {
                return;
            }
            setSelectedRequirements(selectedRequirements.filter(item => item !== requirement));
        } else {
            setSelectedRequirements([...selectedRequirements, requirement]);
        }
    };

    const addCustomParameter = () => {
        if (newParamName.trim() === '') return;

        const paramKey = formatFunctionNameForBackend(newParamName);

        setCustomParameters([
            ...customParameters,
            {
                name: paramKey,
                description: newParamDescription || `${newParamName} parameter`,
                type: newParamType,
                required: false
            }
        ]);

        setNewParamName('');
        setNewParamDescription('');
        setNewParamType('string');
        setShowAddParam(false);
    };

    const removeCustomParameter = (index: number) => {
        const updatedParams = [...customParameters];
        updatedParams.splice(index, 1);
        setCustomParameters(updatedParams);
    };

    const toggleParamRequired = (index: number) => {
        const updatedParams = [...customParameters];
        updatedParams[index].required = !updatedParams[index].required;
        setCustomParameters(updatedParams);
    };

    // Handler to copy variable to clipboard
    const handleCopyVariable = (variable: string) => {
        navigator.clipboard.writeText(variable);
        setCopiedVariable(variable);
        toast({
            title: 'Copied!',
            description: `${variable} copied to clipboard`,
            variant: 'default',
        });
        setTimeout(() => setCopiedVariable(null), 1500);
    };

    // Handler to toggle variable selection
    const handleToggleVariable = (variable: string) => {
        setSelectedVariables(prev =>
            prev.includes(variable)
                ? prev.filter(v => v !== variable)
                : [...prev, variable]
        );
    };

    // Handler for folder selection
    const handleFolderChange = (folderKey: string) => {
        setSelectedFolder(folderKey);
        // Clear selected variables when changing folders
        setSelectedVariables([]);
    };

    // Get available folder options for the select
    const getFolderOptions = () => {
        return Object.entries(globalVariables).map(([key, group]: [string, any]) => ({
            key,
            name: group.name
        }));
    };

    // Get current folder data
    const getCurrentFolderData = () => {
        return globalVariables[selectedFolder] || null;
    };

    // Check if a variable exists in any global variable folder (case-insensitive)
    const isVariableInGlobalVariables = (variableName: string): boolean => {
        const cleanVariableName = variableName.replace(/[{}]/g, '').toLowerCase();
        return Object.values(globalVariables).some((folder: any) => 
            folder.properties && Object.keys(folder.properties).some(key => 
                key.toLowerCase() === cleanVariableName
            )
        );
    };

    // Get external variables (selected but not in global variables)
    const getExternalVariables = (): string[] => {
        return selectedVariables.filter(variable => !isVariableInGlobalVariables(variable));
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Check for template validation errors before submitting
        if (sendSmsConfirmation && smsTemplateError) {
            toast({
                title: "SMS Template Error",
                description: smsTemplateError,
                variant: "destructive"
            });
            return;
        }

        if (sendEmailConfirmation && emailTemplateError) {
            toast({
                title: "Email Template Error",
                description: emailTemplateError,
                variant: "destructive"
            });
            return;
        }

        setIsSubmittingLocal(true);
        if (setIsSubmitting) {
            setIsSubmitting(true);
        }

        // Build properties object with standard and custom parameters
        console.log('🚀 Starting payload creation');
        console.log('selectedVariables at start:', selectedVariables);
        
        const properties: any = {
            // ...(selectedRequirements.includes('email') && {
            //     email: {
            //         description: "email of the patient",
            //         type: "string"
            //     }
            // }),
            // ...(selectedRequirements.includes('first_name') && {
            //     first_name: {
            //         description: "First name of the person the booking is for.",
            //         type: "string"
            //     }
            // }),
            // ...(selectedRequirements.includes('last_name') && {
            //     last_name: {
            //         description: "Last name of the person the booking is for.",
            //         type: "string"
            //     }
            // }),
            // ...(selectedRequirements.includes('phone_number') && {
            //     phone_number: {
            //         description: "Contact phone number.",
            //         type: "string"
            //     }
            // }),
            start_time: {
                description: "Start time of the booking.",
                type: "string"
            },
            end_time: {
                description: "End time of the booking.",
                type: "string"
            },
            provider_id: {
                description: "Provider ID to book the appointment with.",
                type: "string"
            },
            service_id: {
                description: "Service ID to book the appointment for.",
                type: "string"
            },
            urgent_appointment: {
                description: "Indicates if the booking is for urgent care or emergency.",
                type: "boolean",
            }            
        };


        // properties.call_type = {
        //     description: "Always send according to need whether user wants to check for walkin, urgent, new_registration or by default regular",
        //     type: "string",
        //     enum: ['urgent', 'regular', 'walk_in', 'new_registration']
        // };

        // Add Email notification property if Email confirmation is enabled
        if (sendEmailConfirmation) {
            properties.email_notification = {
                description: "Enable email notification for booking confirmation.",
                type: "boolean",
                default: true
            };
        }

        // Add SMS template as enum property if SMS confirmation is enabled
        if (sendSmsConfirmation) {
            properties.sms_template = {
                description: "Predefined SMS notification template. Must be passed exactly as listed.",
                type: "string",
                enum: [smsTemplate]
            };
        }

        // Add Email template as enum property if Email confirmation is enabled
        if (sendEmailConfirmation) {
            properties.email_template = {
                description: "Predefined email notification template. Must be passed exactly as listed.",
                type: "string",
                enum: [emailTemplate]
            };
        }

        // Add custom parameters to properties
        console.log('📝 Adding custom parameters:', customParameters.map(p => p.name));
        customParameters.forEach(param => {
            properties[param.name] = {
                description: param.description,
                type: param.type
            };
        });

        // ONLY add variables that are currently selected
        console.log('✅ Adding selected variables:', selectedVariables);
        selectedVariables.forEach(variable => {
            // Extract variable name from {variable_name} format
            const variableName = variable.replace(/[{}]/g, '');
            
            // Check if it's a global variable first
            let found = false;
            Object.values(globalVariables).forEach((folder: any) => {
                if (folder.properties && folder.properties[variableName]) {
                    const varDetails = folder.properties[variableName];
                    properties[variableName] = {
                        description: varDetails.description || `Global variable: ${variableName}`,
                        type: varDetails.type || "string"
                    };
                    found = true;
                }
            });
            
            // If not found in global variables, it's an external variable
            if (!found) {
                // For external variables, try to get details from actionData if available
                let description = `External variable: ${variableName}`;
                let type = "string";
                
                if (isEdit && actionData?.function?.parameters?.properties) {
                    const actionProps = actionData.function.parameters.properties;
                    // Find the property (case-insensitive)
                    const actionPropKey = Object.keys(actionProps).find(key => 
                        key.toLowerCase() === variableName.toLowerCase()
                    );
                    if (actionPropKey && actionProps[actionPropKey]) {
                        description = actionProps[actionPropKey].description || description;
                        type = actionProps[actionPropKey].type || type;
                    }
                }
                
                properties[variableName] = {
                    description: description,
                    type: type
                };
            }
                });

        console.log('🎯 Final properties object keys:', Object.keys(properties));
        console.log('🎯 Properties object:', properties);

        // Build required array
        const required = ['start_time', 'end_time', 'provider_id', 'service_id','urgent_appointment'];

        // Add other required fields based on action type
        if (values.atype === 'calendar_booking') {
            // Add email_notification to required if email confirmation is enabled
            if (sendEmailConfirmation) {
                required.push('email_notification');
            }

            // Add sms_notification to required if SMS confirmation is enabled
            if (sendSmsConfirmation) {
                required.push('sms_notification');
            }

            // Add template properties to required if confirmations are enabled
            if (sendSmsConfirmation) {
                required.push('sms_template');
            }

            if (sendEmailConfirmation) {
                required.push('email_template');
            }

            // Add required custom parameters
            customParameters.forEach(param => {
                if (param.required && !required.includes(param.name)) {
                    required.push(param.name);
                }
            });
        }

        let actionMessages: Message[] = [];

        // Only add start message if it exists
        if (values?.startMessage) {
            actionMessages.push({
                "contents": null,
                "content": values.startMessage,
                "conditions": null,
                "type": "request-start",
                "blocking": true
            });
        }

        // Only add complete message for calendar booking if it exists
        if (values.atype === 'calendar_booking' && values?.completeMessage) {
            actionMessages.push({
                "contents": null,
                "content": values.completeMessage,
                "conditions": null,
                "type": "request-complete",
                "role": null,
                "end_call_after_spoken_enabled": false
            });
        }

        // Only add failed message if it exists
        if (values?.failedMessage) {
            actionMessages.push({
                "contents": null,
                "content": values.failedMessage,
                "conditions": null,
                "type": "request-failed",
                "end_call_after_spoken_enabled": true
            });
        }

        const payload = {
            type: "function",
            atype: values.atype,
            async: false,
            name: formatFunctionNameForBackend(values.actionName),
            function: {
                name: "calendar_availability_check",
                strict: false,
                description: values.description,
                parameters: {
                    type: "object",
                    properties: Object.fromEntries(
                        Object.entries(properties).filter(([key]) => !['calendar_id', 'call_type','is_urgent_care'].includes(key))
                    ),
                    required: required.filter(req => !['calendar_id', 'call_type','is_urgent_care'].includes(req))
                }
            },
            messages: actionMessages
        };

        if (isEdit && actionData) {
            // Update existing action
            updateActionApi(actionData.id, payload).then((res: any) => {
                if (res.data) {
                    toast({
                        title: "Action updated successfully",
                        description: "Action updated successfully",
                        variant: "default"
                    });
                    form.reset();
                    if (fetchActions) {
                        fetchActions();
                    }
                    if (setShowCreateBooking) {
                        setShowCreateBooking(false);
                    }
                    if (onClose) {
                        onClose();
                    }
                }
            }).catch((err: any) => {
                console.log(err);
                toast({
                    title: "Action update failed",
                    description: "Failed to update action",
                    variant: "destructive"
                });
            }).finally(() => {
                setIsSubmittingLocal(false);
                if (setIsSubmitting) {
                    setIsSubmitting(false);
                }
            });
        } else {
            // Create new action
            createActionApi(payload).then((res: any) => {
                if (res.data) {
                    toast({
                        title: "Action created successfully",
                        description: "Action created successfully",
                        variant: "default"
                    });
                    form.reset();
                    if (fetchActions) {
                        fetchActions();
                    }
                    if (setShowCreateBooking) {
                        setShowCreateBooking(false);
                    }
                    if (onClose) {
                        onClose();
                    }
                }
            }).catch((err: any) => {
                console.log(err);
                toast({
                    title: "Action creation failed",
                    description: "Failed to create action",
                    variant: "destructive"
                });
            }).finally(() => {
                setIsSubmittingLocal(false);
                if (setIsSubmitting) {
                    setIsSubmitting(false);
                }
            });
        }
    }

    return (
        <div className="flex w-full mx-auto min-h-[80vh] gap-3">
            {/* Left: Form (scrollable) */}
            <div className="flex-1 overflow-y-auto rounded-xl p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                        console.log("Validation errors:", errors);
                    })} className="space-y-4">
                        {/* Basic Information Section */}
                        <div className="flex items-center gap-3 border-b border-gray-100">
                            <h4 className="text-lg font-semibold text-indigo-600">{form.watch('atype') === 'calendar_availability' ? 'Check Calendar Availability' : 'Create Booking'}</h4>
                        </div>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="actionName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">Action Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="h-12 px-4 bg-gray-50 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                placeholder="Enter a descriptive name for your action"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Messages Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-100">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="h-4 w-4 text-purple-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900">Action Messages</h4>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Info className="h-3 w-3" />
                                    <span>Configure messages shown during the action</span>
                                </div>
                            </div>
                            <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-200">
                                <FormField
                                    control={form.control}
                                    name="startMessage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold text-gray-700">Start Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    className="h-20 px-4 py-3 bg-white border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                                    placeholder="Message shown when the action starts"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {form.watch('atype') === 'calendar_booking' && (
                                    <FormField
                                        control={form.control}
                                        name="completeMessage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-gray-700">Complete Message</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        className="h-20 px-4 py-3 bg-white border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                                        placeholder="Message shown when the action completes successfully"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <FormField
                                    control={form.control}
                                    name="failedMessage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold text-gray-700">Failed Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    className="h-20 px-4 py-3 bg-white border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                                    placeholder="Message shown when the action fails"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
            {/* Right: Sticky Card */}
            <div className="w-[300px] h-[calc(100vh-100px)] flex-shrink-0 bg-white border-l border-gray-200">
                <div className="h-full flex flex-col">
                    {/* Fixed Header */}
                    <div className="p-6 pb-2 border-b border-gray-100 flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-indigo-600" />
                                <h4 className="text-md font-semibold text-gray-900">Available Variables</h4>
                            </div>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                                {selectedVariables.length} selected
                            </span>
                        </div>
                        
                        {/* Warning Message */}
                        <div className="mb-4 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        Choose the variables that must be collected during the call.
                        </div>
                        
                        {/* Folder Selector */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Variable Group</label>
                            <Select value={selectedFolder} onValueChange={handleFolderChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a variable group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getFolderOptions().map((folder) => (
                                        <SelectItem key={folder.key} value={folder.key}>
                                            {folder.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Scrollable Variables Content */}
                    <div className="flex-1 overflow-y-auto p-6 pt-2">
                        {/* External Variables */}
                        {(() => {
                            const externalVars = getExternalVariables();
                            console.log('External variables to display:', externalVars);
                            return externalVars.length > 0;
                        })() && (
                            <div className="space-y-2 mb-4">
                                <div className="font-semibold text-orange-700 text-sm mb-2 flex items-center gap-2">
                                    External Variables
                                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                        Not in current groups
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {getExternalVariables().map((variable) => {
                                        const isChecked = selectedVariables.includes(variable);
                                        console.log(`External variable ${variable}: isChecked=${isChecked}, selectedVariables:`, selectedVariables);
                                        const cleanName = variable.replace(/[{}]/g, '');
                                        const displayName = cleanName.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (l: string) => l.toUpperCase());
                                        return (
                                            <div key={variable} className="group relative">
                                                <label className="flex items-center gap-3 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-orange-300 hover:bg-orange-100 hover:shadow-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleToggleVariable(variable)}
                                                        className="w-5 h-5 border-2 border-orange-300 rounded-md transition-all duration-200 cursor-pointer accent-orange-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                            {displayName}
                                                            <span className="bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded text-xs font-medium">
                                                                EXTERNAL
                                                            </span>
                                                        </div>
                                                        <div className="text-xs font-mono text-gray-500 mt-0.5">{variable}</div>
                                                        <div className="text-xs text-orange-600 mt-0.5">This variable is not available in current variable groups</div>
                                                    </div>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Variables from selected folder */}
                        {(() => {
                            const currentFolder = getCurrentFolderData();
                            console.log('selectedFolder:', selectedFolder);
                            console.log('currentFolderData:', currentFolder);
                            console.log('selectedVariables for display:', selectedVariables);
                            return selectedFolder && currentFolder;
                        })() && (
                            <div className="space-y-2">
                                <div className="space-y-2">
                                    {Object.entries(getCurrentFolderData().properties).map(([propKey, prop]: any) => {
                                        const variable = `{${propKey}}`;
                                        const isChecked = selectedVariables.includes(variable);
                                        console.log(`Checking variable ${variable}: isChecked=${isChecked}, selectedVariables contains:`, selectedVariables);
                                        // Format property name for display
                                        const displayName = propKey.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (l: string) => l.toUpperCase());
                                        return (
                                            <div key={propKey} className="group relative">
                                                <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleToggleVariable(variable)}
                                                        className="w-5 h-5 border-2 border-gray-300 rounded-md transition-all duration-200 cursor-pointer accent-indigo-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900">{displayName}</div>
                                                        <div className="text-xs font-mono text-gray-500 mt-0.5">{variable} <span className="ml-2 text-gray-400">({prop.type})</span></div>
                                                        {prop.description && (
                                                            <div className="text-xs text-gray-400 mt-0.5">{prop.description}</div>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBooking;