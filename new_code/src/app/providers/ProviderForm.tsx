"use client";

import {
  createProviderApi,
  deleteProviderKnowledgeBaseApi,
  getCalendarListApi,
  getDocumentListApi,
  getProviderDetailsApi,
  getServiceListApi,
  updateProviderApi,
  updateProviderKnowledgeBaseApi,
} from "@/network/Api";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import ManageAvailability from "@/components/calendar/ManageAvailiblity";
import {
  Clock,
  ArrowLeft,
  Plus,
  X,
  ChevronDown,
  Save,
  Loader2,
  Calendar,
  AlertCircle,
  Clipboard,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

// Knowledge Base Form Schema
const knowledgeBaseSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  files: z
    .array(z.string())
    .min(1, { message: "Please select at least one file" }),
});

type KnowledgeBaseFormValues = z.infer<typeof knowledgeBaseSchema>;

// Define the form schema with Zod
const formSchema = z.object({
  providerName: z
    .string()
    .min(2, { message: "Provider name must be at least 2 characters." }),
  description: z.string().optional(),
  includeGender: z.boolean().default(false),
  gender: z.string().optional(),
  calendarId: z.string().min(1, { message: "Please select a calendar." }),
  services: z
    .array(z.string())
    .min(1, { message: "Please select at least one service." }),
  availability: z.any().optional(),
  knowledgebaseEntries: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        files: z.array(z.string()),
      })
    )
    .default([]),
});

type FormValues = z.infer<typeof formSchema>;

const ProviderForm = ({ id }: { id?: string }) => {
  const router = useRouter();
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showKnowledgebaseDropdown, setShowKnowledgebaseDropdown] =
    useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [calendarId, setCalendarId] = useState("temp-calendar-id"); // You'll need to replace this with actual calendar ID
  const [serviceList, setServiceList] = useState<any>([]);
  const [serviceListLoading, setServiceListLoading] = useState(false);
  const [availability, setAvailability] = useState<Record<string, any[]>>({});
  const [connectedCalendarList, setConnectedCalendarList] = useState([]);
  const [selectedServiceNames, setSelectedServiceNames] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providerDetails, setProviderDetails] = useState<any>(null);
  const [calendarListLoading, setCalendarListLoading] = useState(false);
  const [showPrerequisiteDialog, setShowPrerequisiteDialog] = useState(false);
  const [prerequisiteType, setPrerequisiteType] = useState<
    "calendar" | "service" | "both"
  >("both");
  const [isKnowledgeBaseModalOpen, setIsKnowledgeBaseModalOpen] =
    useState(false);
  const [knowledgeBaseEntries, setKnowledgeBaseEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isKnowledgeBaseLoading, setIsKnowledgeBaseLoading] = useState(false);
  const [documentList, setDocumentList] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  const fetchDocumentList = () => {
    setIsLoading(true);
    getDocumentListApi()
      .then((res) => {
        if (res.data) {
          console.log("res.data", res.data?.data?.files);
          setDocumentList(res.data?.data?.files);
        }
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "Error loading documents",
          description: "There was a problem fetching your documents",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDocumentList();
  }, []);

  const fetchProviderDetails = async () => {
    console.log("Fetching provider details for ID:", id);
    getProviderDetailsApi(id)
      .then((res) => {
        if (res.data) {
          console.log("Provider details response:", res.data);
          const provider = res.data?.data?.provider;
          console.log(
            "Provider knowledge base data:",
            provider?.knowledge_base || provider?.knowledgebaseEntries
          );
          console.log("Setting provider details:", provider);
          setProviderDetails(provider);
        }
      })
      .catch((err) => {
        console.log("Error fetching provider details:", err);
      });
  };

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      providerName: "",
      description: "",
      includeGender: false,
      gender: "male",
      calendarId: "",
      services: [],
      availability: {},
      knowledgebaseEntries: [],
    },
  });

  // Initialize the knowledge base form
  const knowledgeBaseForm = useForm<KnowledgeBaseFormValues>({
    resolver: zodResolver(knowledgeBaseSchema),
    defaultValues: {
      name: "",
      description: "",
      files: [],
    },
  });

  const toggleServiceDropdown = () => {
    setShowServiceDropdown(!showServiceDropdown);
  };

  const toggleKnowledgebaseDropdown = () => {
    setShowKnowledgebaseDropdown(!showKnowledgebaseDropdown);
  };

  const handleServiceChange = (
    service: string,
    serviceName: string,
    checked: boolean
  ) => {
    const currentServices = form.getValues("services");
    if (checked) {
      form.setValue("services", [...currentServices, service], {
        shouldValidate: true,
      });
      setSelectedServiceNames((prev) => ({ ...prev, [service]: serviceName }));
    } else {
      form.setValue(
        "services",
        currentServices.filter((s) => s !== service),
        { shouldValidate: true }
      );
      const updatedServiceNames = { ...selectedServiceNames };
      delete updatedServiceNames[service];
      setSelectedServiceNames(updatedServiceNames);
    }
  };

  const removeService = (service: string) => {
    const currentServices = form.getValues("services");
    form.setValue(
      "services",
      currentServices.filter((s) => s !== service),
      { shouldValidate: true }
    );
    const updatedServiceNames = { ...selectedServiceNames };
    delete updatedServiceNames[service];
    setSelectedServiceNames(updatedServiceNames);
  };

  const handleAvailabilitySave = (availabilityData: any) => {
    console.log("Saving availability:", availabilityData);
    // Update the availability data in the form state
    form.setValue("availability", availabilityData, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    // Update the local state for UI rendering
    setAvailability(availabilityData);
    // Close the modal after saving
    setIsAvailabilityModalOpen(false);
  };

  const handleKnowledgeBaseSubmit = (data: any) => {
    setIsKnowledgeBaseLoading(true);
    const payload = {
      name: data.name,
      description: data.description,
      file_ids: data.files,
    };
    updateProviderKnowledgeBaseApi(id, payload)
      .then((res) => {
        if (res.data) {
          console.log("Knowledge base entry added successfully", res);

          // Create the new entry for local state
          const newEntry = {
            id: res.data?.data?.id || Math.random().toString(36).substr(2, 9),
            name: data.name,
            description: data.description,
            files: data.files,
          };

          // Update local state immediately for better UX
          const updatedEntries = [...knowledgeBaseEntries, newEntry];
          setKnowledgeBaseEntries(updatedEntries);
          form.setValue("knowledgebaseEntries", updatedEntries);

          toast({
            title: "Knowledge base entry added",
            description:
              "The knowledge base entry has been successfully created",
          });
        }
      })
      .catch((err) => {
        console.log("Error adding knowledge base entry:", err);
        toast({
          title: "Error adding knowledge base entry",
          description: "There was a problem adding the knowledge base entry",
          variant: "destructive",
        });
      })
      .finally(() => {
        fetchProviderDetails();
        setIsKnowledgeBaseModalOpen(false);
        setIsKnowledgeBaseLoading(false);
      });
  };

  const removeKnowledgeBaseEntry = (entryId: any) => {
    console.log("Attempting to delete knowledge base entry with ID:", entryId);
    setIsKnowledgeBaseLoading(true);
    deleteProviderKnowledgeBaseApi(entryId)
      .then((res) => {
        console.log("Delete API response:", res);
        if (res.data) {
          console.log("Knowledge base entry deleted successfully", res);

          toast({
            title: "Knowledge base entry deleted",
            description:
              "The knowledge base entry has been successfully removed",
          });

          // Refresh provider details to get updated data
          return fetchProviderDetails();
        }
      })
      .catch((err) => {
        console.log("Error deleting knowledge base entry:", err);
        toast({
          title: "Error deleting knowledge base entry",
          description: "There was a problem deleting the knowledge base entry",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsKnowledgeBaseLoading(false);
      });
  };

  const handleFileSelectionChange = (fileId: string, checked: boolean) => {
    const currentFiles = knowledgeBaseForm.getValues("files");
    if (checked) {
      knowledgeBaseForm.setValue("files", [...currentFiles, fileId]);
    } else {
      knowledgeBaseForm.setValue(
        "files",
        currentFiles.filter((f) => f !== fileId)
      );
    }
  };

  // Get initials from provider name
  const getInitials = () => {
    const providerName = form.getValues("providerName");
    if (!providerName) return "AI";
    return providerName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
    setIsSubmitting(true);
    // Format the data according to the API requirements
    const formattedData = {
      name: data.providerName,
      description: data.description || "", // Use the description field
      services: data.services,
      calendar_id: data.calendarId,
      gender: data.includeGender ? data.gender : undefined,
      // knowledge_base: data.knowledgebaseIds.map(kb => ({
      //   name: kb,
      //   description: `Information about ${kb}`,
      //   file_ids: [] // Add file IDs if available
      // })),
      availability: availability, // Use the availability state directly instead of data.availability
    };

    // Here you would call your API to create the provider
    if (id) {
      // Update existing provider
      updateProviderApi(id, formattedData)
        .then((response) => {
          console.log("Provider updated:", response);
          router.push("/providers");
        })
        .catch((error) => {
          console.log("Error updating provider:", error);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      // Create new provider
      createProviderApi(formattedData)
        .then((response) => {
          console.log("Provider created:", response);
          router.push("/providers");
        })
        .catch((error) => {
          console.log("Error creating provider:", error);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  const fetchServiceList = () => {
    setServiceListLoading(true);
    getServiceListApi()
      .then((res) => {
        if (res.data?.data) {
          console.log("res.data", res.data?.data?.services);
          setServiceList(res.data?.data?.services);
        }
      })
      .catch((err) => {
        console.log(err);
        setServiceListLoading(false);
      })
      .finally(() => {
        setServiceListLoading(false);
      });
  };

  const fetchCalendarList = async () => {
    setCalendarListLoading(true);
    getCalendarListApi()
      .then((res) => {
        if (res.data) {
          console.log("calendar list", res.data?.data?.calendars);
          setConnectedCalendarList(res.data?.data?.calendars);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setCalendarListLoading(false);
      });
  };

  const navigateToCreateService = () => {
    router.push("/services");
  };

  const navigateToConnectCalendar = () => {
    router.push("/settings/calendars");
  };

  const handleKnowledgeBaseModalOpen = () => {
    knowledgeBaseForm.reset();
    setIsKnowledgeBaseModalOpen(!isKnowledgeBaseModalOpen);
  };

  useEffect(() => {
    if (providerDetails) {
      console.log("Full provider details object:", providerDetails);

      form.setValue("providerName", providerDetails.name);
      form.setValue("description", providerDetails.description);
      form.setValue(
        "includeGender",
        providerDetails.gender === "male" || providerDetails.gender === "female"
      );
      form.setValue("gender", providerDetails.gender);
      form.setValue("calendarId", providerDetails.calendar_id);
      form.setValue("services", providerDetails.services);
      form.setValue("availability", providerDetails.availability);
      setAvailability(providerDetails.availability);

      // Initialize knowledge base entries if they exist
      // Handle both possible data structures for knowledge base entries
      let kbEntries = [];

      console.log("Checking knowledge base in multiple locations:");
      console.log(
        "providerDetails.knowledgebaseEntries:",
        providerDetails.knowledgebaseEntries
      );
      console.log(
        "providerDetails.knowledge_base:",
        providerDetails.knowledge_base
      );
      console.log(
        "providerDetails.knowledgeBase:",
        providerDetails.knowledgeBase
      );

      // Check multiple possible locations for knowledge base data
      if (
        providerDetails.knowledgebaseEntries &&
        Array.isArray(providerDetails.knowledgebaseEntries)
      ) {
        kbEntries = providerDetails.knowledgebaseEntries;
      } else if (
        providerDetails.knowledge_base &&
        Array.isArray(providerDetails.knowledge_base)
      ) {
        // Map file_ids to files for compatibility
        kbEntries = providerDetails.knowledge_base.map((entry: any) => ({
          ...entry,
          files: entry.file_ids || entry.files || [],
          id: entry.id || Math.random().toString(36).substr(2, 9), // Generate ID if not present
        }));
      } else if (
        providerDetails.knowledgeBase &&
        Array.isArray(providerDetails.knowledgeBase)
      ) {
        // Alternative naming convention
        kbEntries = providerDetails.knowledgeBase.map((entry: any) => ({
          ...entry,
          files: entry.file_ids || entry.files || [],
          id: entry.id || Math.random().toString(36).substr(2, 9), // Generate ID if not present
        }));
      } else if (
        Array.isArray(providerDetails) &&
        providerDetails.length > 0 &&
        providerDetails[0].name
      ) {
        // Handle case where providerDetails itself is the knowledge base array
        kbEntries = providerDetails.map((entry: any) => ({
          ...entry,
          files: entry.file_ids || entry.files || [],
          id: entry.id || Math.random().toString(36).substr(2, 9), // Generate ID if not present
        }));
      }

      console.log("Knowledge base entries to set:", kbEntries);

      // Always update the knowledge base entries, even if empty
      form.setValue("knowledgebaseEntries", kbEntries);
      setKnowledgeBaseEntries(kbEntries);
      console.log("Updated knowledge base entries state:", kbEntries);

      // Update calendar ID for availability modal
      setCalendarId(providerDetails.calendar_id);

      // Update selected service names
      if (providerDetails.services && serviceList.length > 0) {
        const serviceNameMap: Record<string, string> = {};
        providerDetails.services.forEach((serviceId: string) => {
          const service = serviceList.find(
            (s: any) => s.id.toString() === serviceId
          );
          if (service) {
            serviceNameMap[serviceId] = service.name;
          }
        });
        setSelectedServiceNames(serviceNameMap);
      }
    }
  }, [providerDetails, serviceList]);

  useEffect(() => {
    fetchServiceList();
    fetchCalendarList();
    if (id) {
      fetchProviderDetails();
    }
  }, []);

  useEffect(() => {
    // Check if both data fetches are complete
    if (!serviceListLoading && !calendarListLoading) {
      if (serviceList.length === 0 && connectedCalendarList.length === 0) {
        setPrerequisiteType("both");
        setShowPrerequisiteDialog(true);
      } else if (serviceList.length === 0) {
        setPrerequisiteType("service");
        setShowPrerequisiteDialog(true);
      } else if (connectedCalendarList.length === 0) {
        setPrerequisiteType("calendar");
        setShowPrerequisiteDialog(true);
      }
    }
  }, [
    serviceList,
    connectedCalendarList,
    serviceListLoading,
    calendarListLoading,
  ]);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowServiceDropdown(false);
      }
    }

    if (showServiceDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showServiceDropdown]);

  if (serviceListLoading || calendarListLoading) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading provider setup...</h2>
        <p className="text-muted-foreground mt-2">
          Fetching services and calendars
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/providers")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {id ? "Edit Provider" : "Create New Provider"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure provider details, services, and availability
            </p>
          </div>
        </div>
        <Button
          className="gap-2"
          onClick={form.handleSubmit(onSubmit)}
          disabled={
            isSubmitting ||
            serviceList.length === 0 ||
            connectedCalendarList.length === 0
          }
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting
            ? id
              ? "Updating..."
              : "Creating..."
            : id
            ? "Update Provider"
            : "Create Provider"}
        </Button>
      </div>

      {/* Prerequisites Alert */}
      {(serviceList.length === 0 || connectedCalendarList.length === 0) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing prerequisites</AlertTitle>
          <AlertDescription>
            {serviceList.length === 0 && connectedCalendarList.length === 0
              ? "You need to create services and connect a calendar before creating a provider."
              : serviceList.length === 0
              ? "You need to create services before creating a provider."
              : "You need to connect a calendar before creating a provider."}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="pb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Provider Profile */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>Provider Profile</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-3 relative">
                        <span className="text-2xl font-bold text-primary">
                          {getInitials()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="providerName"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>
                              Provider Name{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter provider description"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="includeGender"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  id="include-gender"
                                />
                              </FormControl>
                              <FormLabel htmlFor="include-gender">
                                Include gender for this provider
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {form.watch("includeGender") && (
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>
                                Gender{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex space-x-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="male"
                                      id="gender-male"
                                    />
                                    <Label htmlFor="gender-male">Male</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="female"
                                      id="gender-female"
                                    />
                                    <Label htmlFor="gender-female">
                                      Female
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>Calendar Assignment</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a primary calendar for this provider. The
                      provider's availability and bookings will be managed
                      through this calendar.
                    </p>

                    {connectedCalendarList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed">
                        <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                        <h4 className="font-medium">No Calendars Connected</h4>
                        <p className="text-sm text-muted-foreground text-center mt-1 mb-3">
                          You need to connect a calendar before creating a
                          provider
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={navigateToConnectCalendar}
                        >
                          Connect Calendar
                        </Button>
                      </div>
                    ) : (
                      <FormField
                        control={form.control}
                        name="calendarId"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setCalendarId(value);
                                }}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a calendar" />
                                </SelectTrigger>
                                <SelectContent>
                                  {connectedCalendarList?.map(
                                    (calendar: any) => (
                                      <SelectItem
                                        key={calendar.id}
                                        value={calendar.id}
                                      >
                                        {calendar.name}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>Knowledge Base</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsKnowledgeBaseModalOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Knowledge
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add knowledge base entries to help the provider with
                      relevant information and resources.
                    </p>

                    {knowledgeBaseEntries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed">
                        <Clipboard className="h-8 w-8 text-muted-foreground mb-2" />
                        <h4 className="font-medium">
                          No Knowledge Base Entries
                        </h4>
                        <p className="text-sm text-muted-foreground text-center mt-1 mb-3">
                          Add knowledge base entries to provide relevant
                          information for this provider
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsKnowledgeBaseModalOpen(true)}
                        >
                          Add First Entry
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {knowledgeBaseEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="border rounded-lg p-4 bg-card"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">
                                  {entry.name}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {entry.description}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {entry.files.map((fileId: string) => {
                                    const file = documentList?.find(
                                      (f: any) => f.id === fileId
                                    );
                                    return (
                                      <Badge
                                        key={fileId}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {file?.name || fileId}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isKnowledgeBaseLoading}
                                onClick={() => removeKnowledgeBaseEntry(id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                {isKnowledgeBaseLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Services and Availability */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>Service Assignment</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select the services this provider can offer. Clients will
                      be able to book these services with this provider.
                    </p>

                    {serviceList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed">
                        <Clipboard className="h-8 w-8 text-muted-foreground mb-2" />
                        <h4 className="font-medium">No Services Available</h4>
                        <p className="text-sm text-muted-foreground text-center mt-1 mb-3">
                          You need to create services before creating a provider
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={navigateToCreateService}
                        >
                          Create Service
                        </Button>
                      </div>
                    ) : (
                      <FormField
                        control={form.control}
                        name="services"
                        render={({ field }) => (
                          <FormItem>
                            <div className="mb-4">
                              <div className="relative" ref={dropdownRef}>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-between"
                                  onClick={toggleServiceDropdown}
                                >
                                  <span className="truncate">
                                    {field.value.length === 0
                                      ? "Select services"
                                      : field.value.length > 2
                                      ? `${Object.values(selectedServiceNames)
                                          .slice(0, 2)
                                          .join(", ")} +${
                                          field.value.length - 2
                                        } more`
                                      : Object.values(
                                          selectedServiceNames
                                        ).join(", ")}
                                  </span>
                                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                </Button>

                                {showServiceDropdown && (
                                  <div className="absolute z-30 mt-1 w-full bg-background rounded-md shadow-lg border border-border py-2 max-h-60 overflow-auto">
                                    {/* <div className="px-3 pb-1 pt-1 text-xs font-semibold text-muted-foreground">Medical Services</div> */}
                                    <div className="px-2">
                                      {serviceList?.map((service: any) => (
                                        <div
                                          key={service.id}
                                          className="flex items-center py-1.5 px-1 rounded-lg hover:bg-accent cursor-pointer"
                                        >
                                          <Checkbox
                                            id={service.id}
                                            checked={field.value.includes(
                                              `${service.id}`
                                            )}
                                            onCheckedChange={(checked) =>
                                              handleServiceChange(
                                                `${service.id}`,
                                                service.name,
                                                checked as boolean
                                              )
                                            }
                                            className="mr-2"
                                          />
                                          <Label
                                            htmlFor={service.id}
                                            className="flex-1 cursor-pointer text-sm"
                                          >
                                            {service.name}{" "}
                                            <span className="ml-1 text-xs text-muted-foreground">
                                              {service.details}
                                            </span>
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 mt-4">
                                {field.value.map((service) => (
                                  <Badge
                                    key={service}
                                    variant="secondary"
                                    className="px-2 py-1 gap-1.5"
                                  >
                                    <span>
                                      {selectedServiceNames[service] || service}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0"
                                      onClick={() => removeService(service)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>Availability Settings</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 text-primary"
                        onClick={() => setIsAvailabilityModalOpen(true)}
                        disabled={connectedCalendarList.length === 0}
                      >
                        <Clock className="h-4 w-4" />
                        Manage Availability
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure the provider's working hours and availability
                      for appointments. You can set different schedules for each
                      day of the week.
                    </p>

                    {Object.keys(availability).length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium">Availability Set</h4>
                              <p className="text-sm text-muted-foreground">
                                Custom schedule configured
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAvailabilityModalOpen(true)}
                            disabled={connectedCalendarList.length === 0}
                          >
                            Edit Schedule
                          </Button>
                        </div>

                        <div className="space-y-3 mt-4">
                          {Object?.entries?.(availability)?.map(
                            ([day, slots]) => {
                              if (slots?.length > 0) {
                                return (
                                  <div
                                    key={day}
                                    className="border rounded-md p-3"
                                  >
                                    <h4 className="font-medium capitalize mb-2">
                                      {day}
                                    </h4>
                                    <div className="space-y-2">
                                      {slots.map((slot: any, index: number) => {
                                        // Convert to 12-hour format
                                        const formatTime = (time: string) => {
                                          const [hours, minutes] =
                                            time.split(":");
                                          const hour = parseInt(hours, 10);
                                          const ampm = hour >= 12 ? "PM" : "AM";
                                          const hour12 = hour % 12 || 12;
                                          return `${hour12}:${minutes} ${ampm}`;
                                        };

                                        const startTime12h = formatTime(
                                          slot.start_time
                                        );
                                        const endTime12h = formatTime(
                                          slot.end_time
                                        );

                                        return (
                                          <div
                                            key={index}
                                            className="flex items-center text-sm"
                                          >
                                            <div className="flex-1 flex items-center gap-2">
                                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                              <span>
                                                {startTime12h} - {endTime12h}
                                              </span>
                                              {slot.is_emergency && (
                                                <Badge
                                                  variant="outline"
                                                  className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200"
                                                >
                                                  Emergency
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed">
                        <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                        <h4 className="font-medium">No Availability Set</h4>
                        <p className="text-sm text-muted-foreground text-center mt-1 mb-3">
                          Click the button below to configure provider's
                          schedule
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAvailabilityModalOpen(true)}
                        >
                          Set Availability
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Manage Availability Modal */}
      <ManageAvailability
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        calendarId={form.getValues("calendarId")}
        onSave={(availabilityData: any) =>
          handleAvailabilitySave(availabilityData)
        }
        initialAvailability={availability}
      />

      {/* Knowledge Base Modal */}
      <Dialog
        open={isKnowledgeBaseModalOpen}
        onOpenChange={handleKnowledgeBaseModalOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Knowledge Base Entry</DialogTitle>
            <DialogDescription>
              Create a new knowledge base entry with relevant information and
              files for this provider.
            </DialogDescription>
          </DialogHeader>

          <Form {...knowledgeBaseForm}>
            <form
              onSubmit={knowledgeBaseForm.handleSubmit(
                handleKnowledgeBaseSubmit
              )}
              className="space-y-6"
            >
              <div className="grid gap-4">
                <FormField
                  control={knowledgeBaseForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Treatment Guidelines, Emergency Protocols"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={knowledgeBaseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this knowledge base entry contains and how it will help the provider..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={knowledgeBaseForm.control}
                  name="files"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Knowledge Files{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Select relevant files to include in this knowledge
                          base entry:
                        </p>
                        <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                          <div className="space-y-3">
                            {documentList?.map((file: any) => (
                              <div
                                key={file.id}
                                className="flex items-center space-x-3"
                              >
                                <Checkbox
                                  id={`file-${file.id}`}
                                  checked={field.value.includes(file.id)}
                                  onCheckedChange={(checked) =>
                                    handleFileSelectionChange(
                                      file.id,
                                      checked as boolean
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`file-${file.id}`}
                                  className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {file.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleKnowledgeBaseModalOpen();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={isKnowledgeBaseLoading}
                >
                  {isKnowledgeBaseLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {isKnowledgeBaseLoading ? "Adding..." : "Add Entry"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderForm;
