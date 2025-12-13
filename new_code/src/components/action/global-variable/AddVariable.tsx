import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState, useMemo } from "react";
import { updateGlobalVariableApi } from "@/network/Api";
import { toast } from "@/hooks/use-toast";
import { SYSTEM_VARIABLES } from "@/_utils/constants";

// Create schema function that takes editing context
const createVariableFormSchema = (isEditing: boolean, originalName?: string) => z.object({
    name: z.string()
        .min(1, { message: "Name is required" })
        .refine((value) => {
            const snakeCaseValue = value.replace(/\s+/g, '_').toLowerCase();
            
            // If editing and the name hasn't changed, allow it
            if (isEditing && originalName && originalName.toLowerCase() === snakeCaseValue) {
                return true;
            }
            
            // Otherwise, check if it's a system variable
            return !SYSTEM_VARIABLES.includes(snakeCaseValue);
        }, {
            message: `Variable name cannot be one of the reserved system variables: ${SYSTEM_VARIABLES.join(', ')}`
        }),
    type: z.enum(["string", "number", "boolean"]),
    description: z.string().min(1, { message: "Description is required" }),
    enum: z.string().optional()
});

const AddVariable = ({isOpen,onOpenChange,folderData,setFolderData,editingVariable,setEditingVariable,fetchGlobalVariables}:{isOpen:boolean,onOpenChange:any,folderData:any,setFolderData:any,editingVariable:any,setEditingVariable:any,fetchGlobalVariables:any}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Create schema based on whether we're editing - recreate when editingVariable changes
    const variableFormSchema = useMemo(() => 
        createVariableFormSchema(!!editingVariable, editingVariable?.name), 
        [editingVariable]
    );

    const variableForm = useForm({
        resolver: zodResolver(variableFormSchema),
        defaultValues: {
            name: '',
            type: 'string' as const,
            description: '',
            enum: ''
        }
    });

    const toSnakeCase = (str: string) => str.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const fromSnakeCase = (str: string) => str.replace(/_/g, ' ');

    const onSubmit = (data: { name: string; type: "string" | "number" | "boolean"; description: string; enum?: string }) => {
        setIsSubmitting(true);
        
        // Convert name to snake_case for API
        const snakeCaseName = toSnakeCase(data.name);
        // Create a copy of existing properties and handle editing/adding
        const updatedProperties = { ...folderData?.properties };
        
        // If editing, remove the old property first (in case name changed)
        if (editingVariable && editingVariable.name !== snakeCaseName) {
            delete updatedProperties[editingVariable.name];
        }
        
        // Add/update the variable
        updatedProperties[snakeCaseName] = {
            type: data.type,
            description: data.description,
            enum: data.enum ? data.enum.split(',').map((item: string) => item.trim()) : null
        };
        
        const payload = {
            name: folderData?.name,
            properties: updatedProperties,
        };
        
        updateGlobalVariableApi(folderData.id, payload).then((res) => {
            if(res && res.data) {
                toast({
                    title: editingVariable ? 'Variable updated successfully' : 'Variable added successfully',
                    description: editingVariable ? 'The variable has been updated successfully' : 'The variable has been added successfully',
                    variant: 'default'
                });
                variableForm.reset(
                    {
                        name: '',
                        type: 'string',
                        description: '',
                        enum: ''
                    }
                );
            }
        }).catch((err) => {
            console.log("err",err);
        }).finally(() => {
            fetchGlobalVariables();
            variableForm.reset(
                {
                    name: '',
                    type: 'string',
                    description: '',
                    enum: ''
                }
            );
            setIsSubmitting(false);
            setEditingVariable(null);
            setFolderData(null);
            onOpenChange(false);
        });
    };

    const handleCloseVariableModal = () => {
        variableForm.reset(
            {
                name: '',
                type: 'string',
                description: '',
                enum: ''
            }
        );
        onOpenChange(false);
        setEditingVariable(null);
        variableForm.reset();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset form when modal is being closed
            variableForm.reset({
                name: '',
                type: 'string',
                description: '',
                enum: ''
            });
            setEditingVariable(null);
            setFolderData(null);
        }
        onOpenChange(open);
    };

    console.log("folderData",folderData);

    // Reset form when editing variable changes
    useEffect(() => {
        if (editingVariable) {
            variableForm.reset({
                name: fromSnakeCase(editingVariable?.name),
                type: editingVariable?.type,
                description: editingVariable?.description,
                enum: editingVariable?.enum || ''
            });
        }
    }, [editingVariable, variableForm]);

    // Reset form when schema changes (when editing state changes)
    useEffect(() => {
        variableForm.reset();
    }, [variableFormSchema, variableForm]);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{editingVariable ? 'Edit Variable' : 'Add New Variable'}</DialogTitle>
            </DialogHeader>
            <Form {...variableForm}>
                <form onSubmit={variableForm.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={variableForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Variable Name</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="e.g., user preference (will become user_preference)" 
                                        className="bg-gray-50"
                                        {...field}
                                    />
                                </FormControl>
                                <p className="text-xs text-gray-500 mt-1">Names will be automatically converted to lowercase with underscores (e.g., "User Name" becomes "user_name")</p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={variableForm.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="bg-gray-50">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="string">String</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="boolean">Boolean</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={variableForm.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Describe the purpose of this variable" 
                                        className="h-20 resize-none bg-gray-50"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={variableForm.control}
                        name="enum"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Enum Values (Optional)</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="value1, value2, value3"
                                        className="bg-gray-50"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <p className="text-xs text-gray-500 mt-1">Enter values separated by commas. Leave empty if not needed.</p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <DialogFooter className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleCloseVariableModal} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {editingVariable ? 'Saving...' : 'Adding...'}
                                </>
                            ) : (
                                editingVariable ? 'Save Changes' : 'Add Variable'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    );
};

export default AddVariable;