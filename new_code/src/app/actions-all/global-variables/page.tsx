"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Search, Calendar, Trash2, ALargeSmall, Hash, ToggleRight, Folder, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { createGlobalVariableApi, getGlobalVariableApi, updateGlobalVariableApi, deleteGlobalVariableApi, cloneGlobalVariableApi } from '@/network/Api';
import { DEFAULT_VARIABLES } from '@/_utils/constants';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AddVariable from '@/components/action/global-variable/AddVariable';

// Types
type VariableType = 'string' | 'number' | 'boolean';

interface Variable {
    type: VariableType;
    description: string;
    enum?: string[] | null;
}

interface VariableGroup {
    id: string;
    name: string;
    properties: Record<string, Variable>;
}

interface VariableGroups {
    [key: string]: VariableGroup;
}

// Form Schemas
const groupFormSchema = z.object({
    name: z.string()
        .min(2, "Group name must be at least 2 characters")
        .max(50, "Group name must be less than 50 characters")
        .regex(/^[a-zA-Z0-9\s-_]+$/, "Group name can only contain letters, numbers, spaces, hyphens, and underscores")
});

const cloneGroupFormSchema = z.object({
    name: z.string()
        .min(2, "Group name must be at least 2 characters")
        .max(50, "Group name must be less than 50 characters")
        .regex(/^[a-zA-Z0-9\s-_]+$/, "Group name can only contain letters, numbers, spaces, hyphens, and underscores")
});

const variableFormSchema = z.object({
    name: z.string()
        .min(2, "Variable name must be at least 2 characters")
        .max(50, "Variable name must be less than 50 characters")
        .regex(/^[a-zA-Z0-9_\s]+$/, "Variable name can only contain letters, numbers, underscores, and spaces")
        .transform(val => val.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')),
    type: z.enum(["string", "number", "boolean"]),
    description: z.string()
        .min(10, "Description must be at least 10 characters")
        .max(200, "Description must be less than 200 characters"),
    enum: z.string().optional().nullable()
});

type GroupFormValues = z.infer<typeof groupFormSchema>;
type CloneGroupFormValues = z.infer<typeof cloneGroupFormSchema>;
type VariableFormValues = z.infer<typeof variableFormSchema>;

// Custom Components
const AddVariableButton: React.FC<{
    onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}> = ({ onClick }) => (
    <div
        className="bg-white hover:bg-gray-50 rounded-md border border-gray-200 cursor-pointer"
        onClick={e => {
            e.stopPropagation();
            onClick(e);
        }}
    >
        <div className="flex items-center px-3 py-2 text-sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Variable
        </div>
    </div>
);

const GlobalVariables: React.FC = () => {
    // State Management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddVariableModalOpen, setIsAddVariableModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [selectedGroupID, setSelectedGroupID] = useState<string>('');

    const [editingVariable, setEditingVariable] = useState<any>(null);
    const [variableGroups, setVariableGroups] = useState<VariableGroups>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [isDeletingGroup, setIsDeletingGroup] = useState(false);
    const [isDeletingVariable, setIsDeletingVariable] = useState(false);
    const [isCloningGroup, setIsCloningGroup] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteType, setDeleteType] = useState<'group' | 'variable' | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ groupId: string; groupKey: string; varKey?: string } | null>(null);
    const [folderData, setFolderData] = useState<any>(null);
    const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
    const [cloneTarget, setCloneTarget] = useState<{ groupId: string; groupKey: string } | null>(null);
    const [isGuidelineCollapsed, setIsGuidelineCollapsed] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Form Setup
    const groupForm = useForm<GroupFormValues>({
        resolver: zodResolver(groupFormSchema),
        defaultValues: {
            name: "",
        },
    });

    const cloneGroupForm = useForm<CloneGroupFormValues>({
        resolver: zodResolver(cloneGroupFormSchema),
        defaultValues: {
            name: "",
        },
    });

    const variableForm = useForm<VariableFormValues>({
        resolver: zodResolver(variableFormSchema),
        defaultValues: {
            name: "",
            type: "string",
            description: "",
            enum: null,
        },
    });

    // API Calls
    const fetchGlobalVariables = async () => {
        try {
            setIsLoading(true);
            const response = await getGlobalVariableApi();
            if (response && response.data) {
                const transformedData: VariableGroups = {};
                response.data.data.folders?.forEach((group: any) => {
                    transformedData[group.name.toLowerCase().replace(/\s+/g, '_')] = {
                        id: group.id,
                        name: group.name,
                        properties: group.properties
                    };
                });
                console.log("transformedData", transformedData);

                setVariableGroups(transformedData);
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

    // Event Handlers
    const handleAddGroup = async (values: GroupFormValues) => {
        try {
            setIsCreatingGroup(true);
            const payload = {
                name: values.name,
                properties: {}
            };

            const res = await createGlobalVariableApi(payload);

            if (res && res.data) {
                const newGroup: VariableGroup = {
                    id: res.data.data.id,
                    name: values.name,
                    properties: {}
                };

                setVariableGroups(prev => ({
                    ...prev,
                    [values.name.toLowerCase().replace(/\s+/g, '_')]: newGroup
                }));

                setIsModalOpen(false);
                groupForm.reset();
                toast({
                    title: 'Variable group created successfully',
                    description: 'The variable group has been created successfully',
                    variant: 'default'
                });
                await fetchGlobalVariables();
            }
        } catch (error) {
            console.log('Error creating variable group:', error);
            toast({
                title: 'Failed to create variable group',
                description: 'The variable group has not been created',
                variant: 'destructive'
            });
        } finally {
            setIsCreatingGroup(false);
        }
    };

    const handleAddVariable = (groupKey: string) => {
        const groupData = variableGroups[groupKey];
        setFolderData(groupData);
        setIsAddVariableModalOpen(true);
        setSelectedGroup(groupKey);
        setSelectedGroupID(groupData.id);

    };

    const handleEditVariable = (groupKey: string, varKey: string, id: string) => {
        const groupData = variableGroups[groupKey];
        const variable = variableGroups[groupKey].properties[varKey];
        setEditingVariable({
            name: varKey,
            type: variable.type,
            description: variable.description,
            enum: variable?.enum?.join(', ') || ''
        });
        setFolderData(groupData);
        setIsAddVariableModalOpen(true);
    };

    const handleDeleteGroup = async (groupId: string, groupKey: string) => {
        try {
            setIsDeletingGroup(true);
            await deleteGlobalVariableApi(groupId);

            setVariableGroups(prev => {
                const newGroups = { ...prev };
                delete newGroups[groupKey];
                return newGroups;
            });

            toast({
                title: 'Group deleted successfully',
                description: 'The variable group has been deleted',
                variant: 'default'
            });
        } catch (error) {
            console.log('Error deleting group:', error);
            toast({
                title: 'Failed to delete group',
                description: 'Unable to delete the variable group',
                variant: 'destructive'
            });
        } finally {
            setIsDeletingGroup(false);
        }
    };

    const handleDeleteVariable = async (groupId: string, groupKey: string, varKey: string) => {
        try {
            setIsDeletingVariable(true);
            const updatedGroups = { ...variableGroups };
            const updatedProperties = { ...updatedGroups[groupKey].properties };
            delete updatedProperties[varKey];

            const payload = {
                name: updatedGroups[groupKey].name,
                properties: updatedProperties
            };

            await updateGlobalVariableApi(groupId, payload);

            updatedGroups[groupKey].properties = updatedProperties;
            setVariableGroups(updatedGroups);

            toast({
                title: 'Variable deleted successfully',
                description: 'The variable has been deleted',
                variant: 'default'
            });
        } catch (error) {
            console.log('Error deleting variable:', error);
            toast({
                title: 'Failed to delete variable',
                description: 'Unable to delete the variable',
                variant: 'destructive'
            });
        } finally {
            setIsDeletingVariable(false);
        }
    };

    const handleCloneGroup = (groupId: string, groupKey: string) => {
        const originalGroup = variableGroups[groupKey];
        setCloneTarget({ groupId, groupKey });
        cloneGroupForm.setValue('name', `${originalGroup.name} Copy`);
        setCloneDialogOpen(true);
    };

    const handleConfirmClone = async (values: CloneGroupFormValues) => {
        if (!cloneTarget) return;
        setIsCloningGroup(true);
        cloneGlobalVariableApi(cloneTarget.groupId, {
            name: values.name
        }).then((res) => {
            if (res && res.data) {
                toast({
                    title: 'Group cloned successfully',
                    description: 'The variable group has been cloned',
                    variant: 'default'
                });
                fetchGlobalVariables();
                setCloneDialogOpen(false);
                setCloneTarget(null);
                cloneGroupForm.reset();
                setIsCloningGroup(false);
            }
        }).catch((err) => {
            console.log('Error cloning group:', err);
            toast({
                title: 'Failed to clone group',
                description: 'Unable to clone the variable group',
                variant: 'destructive'
            });
        }).finally(() => {
            setIsCloningGroup(false);
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;

        if (deleteType === 'group') {
            handleDeleteGroup(deleteTarget.groupId, deleteTarget.groupKey);
        } else if (deleteType === 'variable' && deleteTarget.varKey) {
            handleDeleteVariable(deleteTarget.groupId, deleteTarget.groupKey, deleteTarget.varKey);
        }

        setDeleteDialogOpen(false);
        setDeleteType(null);
        setDeleteTarget(null);
    };

    // Utility Functions
    const filterVariableGroups = () => {
        if (!searchQuery.trim()) {
            return variableGroups;
        }

        const query = searchQuery.toLowerCase().trim();
        const filteredGroups: VariableGroups = {};

        Object.keys(variableGroups).forEach((groupKey) => {
            const group = variableGroups[groupKey];
            const groupNameMatches = group.name.toLowerCase().includes(query);
            
            // Filter variables within the group
            const filteredProperties: Record<string, Variable> = {};
            Object.keys(group.properties || {}).forEach((varKey) => {
                const variable = group.properties[varKey];
                const variableMatches = 
                    varKey.toLowerCase().includes(query) ||
                    variable.description.toLowerCase().includes(query) ||
                    variable.type.toLowerCase().includes(query) ||
                    (variable.enum && variable.enum.some(enumValue => 
                        enumValue.toLowerCase().includes(query)
                    ));

                if (variableMatches) {
                    filteredProperties[varKey] = variable;
                }
            });

            // Include group if group name matches OR if it has matching variables
            if (groupNameMatches || Object.keys(filteredProperties).length > 0) {
                filteredGroups[groupKey] = {
                    ...group,
                    properties: groupNameMatches ? group.properties : filteredProperties
                };
            }
        });

        return filteredGroups;
    };

    const getBadgeStyle = (type: VariableType): string => {
        switch (type) {
            case "string":
                return "text-blue-600 bg-blue-100 border-blue-200";
            case "number":
                return "text-purple-600 bg-purple-100 border-purple-200";
            case "boolean":
                return "text-orange-600 bg-orange-100 border-orange-200";
            default:
                return "text-gray-600 bg-gray-100 border-gray-200";
        }
    };

    const getBadgeIcon = (type: VariableType): React.ReactNode => {
        switch (type) {
            case "string":
                return <ALargeSmall className="h-4 w-4" />
            case "number":
                return <Hash className="h-4 w-4" />
            case "boolean":
                return <ToggleRight className="h-4 w-4" />
            default:
                return null;
        }
    };

    // Effects
    useEffect(() => {
        fetchGlobalVariables();
    }, []);

    return (
        <div className="h-screen bg-gray-50 w-full flex flex-col">
            {/* Header Section */}
            <div className="bg-white border-b flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between" style={{ height: "104px" }}>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h1 className="text-xl font-bold text-gray-900">Global Variables</h1>
                                <p className="text-sm text-gray-500">Manage your application variables</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    type="text"
                                    placeholder="Search groups or variables..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-80 bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                disabled={isCreatingGroup || isCloningGroup}
                            >
                                {isCreatingGroup ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Group
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Information Note */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl mb-8 overflow-hidden">
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-100/50 transition-colors" onClick={() => setIsGuidelineCollapsed(!isGuidelineCollapsed)}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-blue-900">Variable Group Usage Guidelines</h3>
                            </div>
                            <div className="flex items-center gap-2 text-blue-700">
                                <span className="text-sm font-medium">{isGuidelineCollapsed ? 'Show' : 'Hide'}</span>
                                {isGuidelineCollapsed ? (
                                    <ChevronDown className="h-5 w-5" />
                                ) : (
                                    <ChevronUp className="h-5 w-5" />
                                )}
                            </div>
                        </div>
                        {!isGuidelineCollapsed && (
                            <div className="px-4 pb-6">
                                <div className="pl-11">
                                    <div className="text-blue-800 space-y-2">
                                        <p className="text-sm leading-relaxed">
                                            <span className="font-medium">Important:</span> You can only use <span className="font-semibold">one group of variables at a time</span> in your application.
                                        </p>
                                        <div className="text-sm space-y-1 pl-4">
                                            <p className="flex items-start gap-2">
                                                <span className="text-blue-600 mt-1">•</span>
                                                <span>Use the <span className="font-medium">Default Variables Group</span> as-is with the standard variables</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <span className="text-blue-600 mt-1">•</span>
                                                <span>Add new custom variables to the Default Variables Group</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <span className="text-blue-600 mt-1">•</span>
                                                <span>Create a copy of the Default Group and customize it with additional variables</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <span className="text-blue-600 mt-1">•</span>
                                                <span>Create a completely new group with your own variables</span>
                                            </p>
                                        </div>
                                        <p className="text-sm text-blue-700 bg-blue-100 rounded-md px-3 py-2 mt-3">
                                            <span className="font-medium">Note:</span> Default variables (first_name, last_name, birthdate, phone_number, email_address, reason_for_visit) cannot be edited to maintain system consistency. All variable names are automatically converted to lowercase with underscores.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : Object.keys(variableGroups).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                            <Calendar className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Global Variables Found</h2>
                        <p className="text-gray-500 text-center mb-6 max-w-md">
                            Get started by creating your first variable group. This will help you organize and manage your application variables efficiently.
                        </p>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Group
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {searchQuery && (
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Search className="h-4 w-4" />
                                    <span>
                                        Search results for: <span className="font-semibold text-gray-900">"{searchQuery}"</span>
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span>
                                        {Object.keys(filterVariableGroups()).length} group(s) found
                                    </span>
                                </div>
                            </div>
                        )}
                        {Object.keys(filterVariableGroups()).length === 0 && searchQuery ? (
                            <div className="flex flex-col items-center justify-center h-[40vh] bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                <Search className="h-12 w-12 text-gray-400 mb-4" />
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
                                <p className="text-gray-500 text-center mb-4 max-w-md">
                                    No groups or variables match your search for "{searchQuery}". Try a different search term.
                                </p>
                                <Button
                                    onClick={() => setSearchQuery('')}
                                    variant="outline"
                                    className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                                >
                                    Clear Search
                                </Button>
                            </div>
                        ) : (
                            <Accordion type="multiple" className="w-full space-y-4">
                                {Object.keys(filterVariableGroups()).map((groupKey) => {
                                const filteredGroups = filterVariableGroups();
                                const group = filteredGroups[groupKey];
                                const variableCount = Object.keys(group?.properties || {}).length;

                                return (
                                    <AccordionItem
                                        key={groupKey}
                                        value={groupKey}
                                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                                    >
                                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center">
                                                        <Folder className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
                                                        <p className="text-sm text-gray-500 mt-1">{variableCount} variables</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md cursor-pointer ${group.name === "Default Variables" ? "mr-2" : ""}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCloneGroup(group.id, groupKey);
                                                        }}
                                                        title="Clone Group"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </div>
                                                    {group.name !== "Default Variables" && <div
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteType('group');
                                                            setDeleteTarget({ groupId: group.id, groupKey });
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                        title="Delete Group"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </div>}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <div className="px-6 py-2 border-gray-100">
                                            <AddVariableButton
                                                onClick={() => {
                                                    handleAddVariable(groupKey);
                                                }}
                                            />
                                        </div>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {(() => {
                                                    const groupProperties = group?.properties || {};
                                                    let sortedKeys = Object.keys(groupProperties);
                                                    
                                                    // If this is the "Default Variables" group, sort according to DEFAULT_VARIABLES order
                                                    if (group.name === "Default Variables") {
                                                        sortedKeys = sortedKeys.sort((a, b) => {
                                                            const indexA = DEFAULT_VARIABLES.indexOf(a);
                                                            const indexB = DEFAULT_VARIABLES.indexOf(b);
                                                            
                                                            // If both are in DEFAULT_VARIABLES, sort by their order
                                                            if (indexA !== -1 && indexB !== -1) {
                                                                return indexA - indexB;
                                                            }
                                                            // If only a is in DEFAULT_VARIABLES, put it first
                                                            if (indexA !== -1 && indexB === -1) {
                                                                return -1;
                                                            }
                                                            // If only b is in DEFAULT_VARIABLES, put it first
                                                            if (indexA === -1 && indexB !== -1) {
                                                                return 1;
                                                            }
                                                            // If neither are in DEFAULT_VARIABLES, maintain alphabetical order
                                                            return a.localeCompare(b);
                                                        });
                                                    }
                                                    
                                                    return sortedKeys;
                                                })().map((varKey) => {
                                                    const variable = group?.properties[varKey];
                                                    const isDefaultVariable = DEFAULT_VARIABLES.includes(varKey);
                                                    const isDefaultGroup = group.name === "Default Variables";
                                                    
                                                    // Logic for showing edit/delete buttons:
                                                    // - If Default Variables group + default variable: hide both edit and delete
                                                    // - If other group + default variable: hide edit, show delete
                                                    // - Otherwise: show both
                                                    const isEditable = !isDefaultVariable;
                                                    const isDeletable = !(isDefaultVariable && isDefaultGroup);

                                                    return (
                                                        <div
                                                            key={varKey}
                                                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-150 cursor-pointer group"
                                                        >
                                                            {/* Top Row: Type badge, actions */}
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`flex items-center gap-1 ${getBadgeStyle(variable.type)} px-2 py-0.5 text-xs font-medium`}
                                                                >
                                                                    {getBadgeIcon(variable.type)}
                                                                    <span className="capitalize">{variable.type}</span>
                                                                </Badge>
                                                                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                                    {isEditable && <button
                                                                        className="p-1.5 hover:bg-gray-100 rounded-md"
                                                                        title="Edit"
                                                                        tabIndex={-1}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditVariable(groupKey, varKey, group?.id);
                                                                        }}
                                                                    >
                                                                        <Pencil className="h-4 w-4 text-gray-500" />
                                                                    </button>}
                                                                    {isDeletable && <button
                                                                        className="p-1.5 hover:bg-red-50 rounded-md"
                                                                        title="Delete"
                                                                        tabIndex={-1}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setDeleteType('variable');
                                                                            setDeleteTarget({ groupId: group.id, groupKey, varKey });
                                                                            setDeleteDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                                    </button>}
                                                                </div>
                                                            </div>
                                                            {/* Variable Name */}
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-gray-900 text-base truncate">{varKey}</h3>
                                                                {variable?.enum && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold px-1.5 py-0.5 ml-1"
                                                                    >
                                                                        Enum
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {/* Description */}
                                                            {variable.description && (
                                                                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{variable.description}</p>
                                                            )}
                                                            {/* Enum values */}
                                                            {Array.isArray(variable?.enum) && variable.enum.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {variable.enum.slice(0, 4).map((value: string, idx: number) => (
                                                                        <Badge
                                                                            key={idx}
                                                                            variant="secondary"
                                                                            className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 text-xs"
                                                                        >
                                                                            {value}
                                                                        </Badge>
                                                                    ))}
                                                                    {variable.enum.length > 4 && (
                                                                        <span className="text-xs text-gray-400 ml-1">
                                                                            +{variable.enum.length - 4} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                            </Accordion>
                        )}
                    </div>
                )}
                </div>
            </div>

            {/* Add Group Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Group</DialogTitle>
                    </DialogHeader>
                    <Form {...groupForm}>
                        <form onSubmit={groupForm.handleSubmit(handleAddGroup)} className="space-y-4">
                            <FormField
                                control={groupForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Group Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Booking"
                                                className="bg-gray-50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isCreatingGroup}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isCreatingGroup}>
                                    {isCreatingGroup ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Group'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Variable Modal */}
            <AddVariable isOpen={isAddVariableModalOpen} onOpenChange={setIsAddVariableModalOpen} folderData={folderData} setFolderData={setFolderData} editingVariable={editingVariable} setEditingVariable={setEditingVariable} fetchGlobalVariables={fetchGlobalVariables} />

            {/* Clone Group Modal */}
            <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Clone Group</DialogTitle>
                    </DialogHeader>
                    <Form {...cloneGroupForm}>
                        <form onSubmit={cloneGroupForm.handleSubmit(handleConfirmClone)} className="space-y-4">
                            <FormField
                                control={cloneGroupForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Group Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Booking Copy"
                                                className="bg-gray-50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setCloneDialogOpen(false);
                                        cloneGroupForm.reset();
                                        setCloneTarget(null);
                                    }}
                                    disabled={isCloningGroup}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    disabled={isCloningGroup}
                                >
                                    {isCloningGroup ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Cloning...
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Clone Group
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {deleteType === 'group' ? 'Delete Group' : 'Delete Variable'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteType === 'group'
                                ? 'Are you sure you want to delete this group? This action cannot be undone.'
                                : 'Are you sure you want to delete this variable? This action cannot be undone.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingGroup || isDeletingVariable}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isDeletingGroup || isDeletingVariable}
                        >
                            {(isDeletingGroup || isDeletingVariable) ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
    );
};

export default GlobalVariables;