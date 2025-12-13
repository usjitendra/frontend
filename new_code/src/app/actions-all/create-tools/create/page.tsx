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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X, Loader2, Code, Save, Globe, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getActionsApi,
  createActionApi,
  updateActionApi,
  getGlobalVariableApi,
  addTools,
} from "@/network/Api";
import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_API_URL_TOOLS;

// Simplified Zod validation schema
const toolsActionSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Title must be at least 2 characters.",
    })
    .refine((val) => !val.includes(" "), {
      message: "Spaces are not allowed in title.",
    }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  url: z.string().min(1, {
    message: "URL is required.",
  }),
  method: z.string().min(1, {
    message: "Method is required.",
  }),
  body: z.string().optional(),
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

type ToolsActionFormData = z.infer<typeof toolsActionSchema>;

const CreateToolsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionId = searchParams.get("actionId");

  const [variableCategory, setVariableCategory] = useState("all");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Global variables state
  const [globalVariables, setGlobalVariables] = useState<any[]>([]);
  const [globalVariablesLoading, setGlobalVariablesLoading] = useState(false);
  const [lockedFolderGroup, setLockedFolderGroup] = useState<string | null>(
    null
  );

  // console.log("actionId edit data>>>>", actionId);

  // Initialize form
  const form = useForm<ToolsActionFormData>({
    resolver: zodResolver(toolsActionSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
      method: "POST",
      body: "{}",
      selectedVariables: {},
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const selectedVariables = form.watch("selectedVariables");

  // Function to insert variable into body JSON
  const insertVariableIntoBody = (variableName: string) => {
    console.log("mai bodya hu..", variableName);

    const currentBodyValue = form.getValues("body") || "{}";

    // console.log(currentBodyValue, "qqqq");

    try {
      const jsonBody = JSON.parse(currentBodyValue);
      // Agar already exist hai to skip
      if (jsonBody.hasOwnProperty(variableName)) {
        console.log(`Variable ${variableName} already exists, skipping.`);
        return;
      }

      // Sirf key add karo with empty value
      jsonBody[variableName] = variableName;

      // Add variable name as a string to an array
      let arr: string[] = [];
      if (Array.isArray(jsonBody)) {
        arr = jsonBody;
      } else {
        arr = [];
      }
      if (!arr.includes(variableName)) {
        arr.push(variableName);
      }
      const newBodyValue = JSON.stringify(arr, null, 2);
      // console.log("newBodyValue", newBodyValue);
      form.setValue("body", newBodyValue);
    } catch {
      // Agar JSON galat hai, naya object banao
      const newBodyValue = JSON.stringify({ [variableName]: "" }, null, 2);
      form.setValue("body", newBodyValue);
    }
  };

  // Function to remove variable from body JSON
  const removeVariableFromBody = (variableName: string) => {
    const currentBodyValue = form.getValues("body") || "{}";

    try {
      const jsonBody = JSON.parse(currentBodyValue);
      if (Array.isArray(jsonBody)) {
        const arr = jsonBody.filter((v: string) => v !== variableName);
        const newBodyValue = JSON.stringify(arr, null, 2);
        form.setValue("body", newBodyValue);
      } else {
        form.setValue("body", "[]");
      }
    } catch {
      form.setValue("body", "[]");
    }
  };

  // Check selected global variables folder group
  const getSelectedGlobalVariablesFolderGroup = () => {
    if (!selectedVariables || !globalVariables.length) return null;

    for (const [variableName, variableData] of Object.entries(
      selectedVariables
    )) {
      if (variableData.folder_id) {
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

  // Clear all selected global variables
  const clearAllSelectedGlobalVariables = () => {
    const currentSelected = form.getValues("selectedVariables");
    if (!currentSelected) return;

    // Keep only external properties (non-global variables)
    const filteredVariables = Object.fromEntries(
      Object.entries(currentSelected).filter(([key, value]) => {
        if (!value.folder_id) {
          return true;
        }
        // Remove from body when clearing
        removeVariableFromBody(key);
        return false;
      })
    );

    form.setValue("selectedVariables", filteredVariables);
    setLockedFolderGroup(null);
  };

  // Group variables by folder
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

  // Get folder names for dropdown
  const folderNames = globalVariables.map((folder) => folder.name);

  // Filter variables by selected folder
  const filteredGroupedVariables = groupedGlobalVariables.filter(
    (folder) => folder.folderName === variableCategory
  );

  // Handle variable toggle
  const handleVariableToggle = (
    variableId: string,
    variableName: string,
    variableDetails: any,
    folderId?: string
  ) => {
    const currentSelected = form.getValues("selectedVariables");

    if (currentSelected && currentSelected[variableName]) {
      // Remove variable
      const { [variableName]: removed, ...rest } = currentSelected;
      form.setValue("selectedVariables", rest);
      removeVariableFromBody(variableName);

      // If no more global variables are selected, unlock the folder group
      const remainingGlobalVars = Object.values(rest).some((v) => v.folder_id);
      if (!remainingGlobalVars) {
        setLockedFolderGroup(null);
      }
    } else {
      // Add variable - check folder group restriction for global variables
      if (folderId) {
        const folderName = globalVariables.find((f) => f.id === folderId)?.name;

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
          folder_id: folderId || null,
        },
      });

      // Add to body
      insertVariableIntoBody(variableName);
    }
  };

  // Fetch global variables
  const fetchGlobalVariables = async () => {
    setGlobalVariablesLoading(true);
    try {
      const res = await getGlobalVariableApi();
      if (res.data?.data?.folders) {
        setGlobalVariables(res.data.data.folders);
        if (res.data.data.folders.length > 0 && !actionId) {
          setVariableCategory(res.data.data.folders[0].name);
        }
      }
    } catch (err) {
      console.log("Error fetching global variables:", err);
    } finally {
      setGlobalVariablesLoading(false);
    }
  };

  // Add this function
  // Replace your existing setActionData function with this corrected version:

  const setActionData = async (actionId: string) => {
    console.log("Loading action data for ID:", actionId);

    setIsLoading(true);
    try {
      // Fetch the action data using the API
      const response = await getActionsApi(); // or whatever API call fetches specific action
      // If you have a specific API to get action by ID, use that instead:
      // const response = await getActionByIdApi(actionId);

      if (response.data) {
        // Find the specific action by ID
        const actionData = response.data.find(
          (action: any) => action.id === parseInt(actionId)
        );

        if (actionData) {
          console.log("Action data found:", actionData);

          // Set form values with the correct property names
          form.setValue("name", actionData.title || "");
          form.setValue("description", actionData.description || "");
          form.setValue("url", actionData.url || "");
          form.setValue("method", actionData.method || "POST");

          // Handle parameters - convert array to JSON format for body
          if (actionData.parameters && Array.isArray(actionData.parameters)) {
            const bodyValue = JSON.stringify(actionData.parameters, null, 2);
            form.setValue("body", bodyValue);

            // Set selected variables if they exist
            const selectedVars: any = {};
            actionData.parameters.forEach((param: string) => {
              selectedVars[param] = {
                type: "string", // default type
                description: "Parameter variable",
                enum: null,
                folder_id: null,
              };
            });
            form.setValue("selectedVariables", selectedVars);
          }

          console.log("Form values set successfully");
        } else {
          console.error("Action not found with ID:", actionId);
          toast({
            title: "Error",
            description: "Action not found",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching action data:", err);
      toast({
        title: "Error",
        description: "Failed to load action data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Updated useEffect to properly handle action loading:
  useEffect(() => {
    fetchGlobalVariables();

    if (actionId) {
      // Check if actionId contains JSON data (from your log)
      if (actionId.startsWith("{")) {
        // Parse the JSON data directly
        try {
          const actionData = JSON.parse(actionId);
          console.log("Parsed action data:", actionData);

          form.setValue("name", actionData.title || "");
          form.setValue("description", actionData.description || "");
          form.setValue("url", actionData.url || "");
          form.setValue("method", actionData.method || "POST");

          if (actionData.parameters && Array.isArray(actionData.parameters)) {
            const bodyValue = JSON.stringify(actionData.parameters, null, 2);
            form.setValue("body", bodyValue);

            const selectedVars: any = {};
            actionData.parameters.forEach((param: string) => {
              selectedVars[param] = {
                type: "string",
                description: "Parameter variable",
                enum: null,
                folder_id: null,
              };
            });
            form.setValue("selectedVariables", selectedVars);
          }
        } catch (error) {
          console.error("Error parsing action data:", error);
          // Fallback to treating it as an ID
          setActionData(actionId);
        }
      } else {
        // Treat as regular ID
        setActionData(actionId);
      }
    }
  }, [actionId]);

  // Handle form submission
  const onSubmit = async (data: ToolsActionFormData) => {
    setIsSubmitting(true);

    const payload = {
      name: data.name,
      description: data.description,
      method: data.method || "POST",
      url: data.url || "",
      body: {
        type: "object",
        properties: {} as Record<string, { type: string }>,
      },
    };

    if (data.body) {
      try {
        const variables: string[] = JSON.parse(data.body);
        variables.forEach((key) => {
          payload.body.properties[key] = { type: "string" }; // default type
        });
      } catch (err) {
        // console.error("Invalid JSON in body:", data.body, err);
      }
    }

    // console.log("payload", payload);

    try {
      if (actionId) {
        let actionData = JSON.parse(actionId);
        console.log("all ion with ID:", actionData.firestore_doc_id);

        const result = await axios.put(
          `${baseUrl}tools/${actionData.firestore_doc_id}`,
          payload
        );
        console.log("result", result);

        if (result.status === 200) {
          router.push("/actions-all/create-tools");
          toast({
            title: "Tool updated successfully",
          });
        }
      } else {
        const result = await axios.post(`${baseUrl}create_tool`, payload);

        if (result.status === 200) {
          router.push("/actions-all/create-tools");
          toast({
            title: "Tool saved successfully",
          });
        }
      }

      // router.push("/tools");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || // backend ka "message"
        error?.response?.data?.error || // backend ka "error"
        error?.message || // axios/js error
        "Something went wrong!"; // fallback

      toast({
        title: "Error saving tool",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch global variables on mount
  useEffect(() => {
    fetchGlobalVariables();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen  bg-gray-50 w-full">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {actionId ? "Edit" : "Create"} Tool
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Configure your custom tool with API integration
                </p>
              </div>
            </div>

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
                onClick={form.handleSubmit(onSubmit)}
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
                    {actionId ? "Update Tool" : "Save Tool"}
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
              <div className="w-full max-w-4xl">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    {/* Basic Information */}
                    <Card>
                      <CardHeader className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-blue-600" />
                          Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Title <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter tool name"
                                    className="w-full"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter a clear and descriptive name for your
                                  tool
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Description{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter tool description"
                                    className="w-full"
                                    rows={3}
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Provide a detailed description of what this
                                  tool does
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* API Configuration */}
                    <Card>
                      <CardHeader className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-green-600" />
                          API Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  URL <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://api.example.com/endpoint"
                                    className="w-full"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter the API endpoint URL
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Method <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select HTTP method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                    <SelectItem value="DELETE">
                                      DELETE
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Select the HTTP method for the API call
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="body"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Body
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder='{"key": "value"}'
                                    className="w-full font-mono text-sm"
                                    rows={8}
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  JSON body for the API request. Variables from
                                  the sidebar will be automatically added here.
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

          {/* Variables Sidebar */}
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
                          Variables
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
                      <p className="text-xs text-gray-500">
                        Select variables to include in the API body.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Select
                    value={variableCategory}
                    onValueChange={(value) => {
                      if (
                        hasSelectedGlobalVariables &&
                        selectedGlobalVariablesFolderGroup !== value
                      ) {
                        // toast({
                        //   name: "Cannot change folder group",
                        //   description: `Variables are currently selected from ${selectedGlobalVariablesFolderGroup}. Clear all variables first to change folder group.`,
                        //   variant: "destructive",
                        // });
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
                          <strong>{selectedGlobalVariablesFolderGroup}</strong>
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
                        Loading variables...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredGroupedVariables.length > 0 && (
                      <div>
                        <div className="space-y-4 mt-2">
                          {filteredGroupedVariables.map((folder) => (
                            <div key={folder.folderName} className="space-y-2">
                              <div className="space-y-2">
                                {folder.variables.map((variable: any) => {
                                  const isSelected =
                                    selectedVariables &&
                                    selectedVariables[variable.name]
                                      ? true
                                      : false;
                                  const isFromDifferentFolder =
                                    hasSelectedGlobalVariables &&
                                    selectedGlobalVariablesFolderGroup !==
                                      folder.folderName &&
                                    !isSelected;
                                  const isDisabled = isFromDifferentFolder;

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
                                          isSelected
                                            ? "ring-2 ring-purple-300"
                                            : ""
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="mt-1">
                                            <Checkbox
                                              id={variable.id}
                                              checked={isSelected}
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateToolsPage;
