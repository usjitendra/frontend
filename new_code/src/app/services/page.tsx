"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Plus,
  Pencil,
  Clock,
  Stethoscope,
  Heart,
  Scissors,
  Flower2,
  Hospital,
  Zap,
  Leaf,
  Smile,
  Utensils,
  Brain,
  Dumbbell,
  Microscope,
  Pill,
  TestTubes,
  Ambulance,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { createServiceApi, getServiceListApi, updateServiceApi, deleteServiceApi } from '@/network/Api';
import { toast } from '@/hooks/use-toast';
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

interface IconOption {
  value: string;
  icon: any;
  label: string;
  color: string;
}

const iconOptions: IconOption[] = [
  { value: "stethoscope", icon: Stethoscope, label: "Stethoscope", color: "from-green-500 to-emerald-600" },
  { value: "heart", icon: Heart, label: "Heart", color: "from-red-500 to-rose-600" },
  { value: "hospital", icon: Hospital, label: "Hospital", color: "from-blue-500 to-indigo-600" },
  { value: "scissors", icon: Scissors, label: "Scissors", color: "from-yellow-500 to-amber-600" },
  { value: "flower", icon: Flower2, label: "Flower", color: "from-purple-500 to-pink-600" },
  { value: "zap", icon: Zap, label: "Energy", color: "from-yellow-500 to-amber-600" },
  { value: "leaf", icon: Leaf, label: "Leaf", color: "from-green-500 to-emerald-600" },
  { value: "smile", icon: Smile, label: "Smile", color: "from-orange-500 to-amber-600" },
  { value: "utensils", icon: Utensils, label: "Food", color: "from-red-500 to-rose-600" },
  { value: "brain", icon: Brain, label: "Brain", color: "from-purple-500 to-pink-600" },
  { value: "dumbbell", icon: Dumbbell, label: "Fitness", color: "from-blue-500 to-indigo-600" },
  { value: "microscope", icon: Microscope, label: "Science", color: "from-yellow-500 to-amber-600" },
  { value: "pill", icon: Pill, label: "Medicine", color: "from-green-500 to-emerald-600" },
  { value: "test-tubes", icon: TestTubes, label: "Test Tubes", color: "from-red-500 to-rose-600" },
  { value: "ambulance", icon: Ambulance, label: "Ambulance", color: "from-red-500 to-rose-600" },
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Service name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  duration: z.string().min(1, {
    message: "Please select a duration.",
  }),
  icon: z.string().min(1, {
    message: "Please select an icon.",
  }),
  calendar: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  max_advance_booking_days: z.coerce.string(),
  min_buffer_minutes_from_now: z.coerce.string(),
  slot_interval_minutes: z.coerce.string(),
});

interface ServiceFormProps {
  mode: 'add' | 'edit';
  defaultValues?: any;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  loading: boolean;
  onCancel: () => void;
}

const ServicesPage = () => {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serviceList, setServiceList] = useState([]);
  const [serviceListLoading, setServiceListLoading] = useState(false);
  const [filteredServiceList, setFilteredServiceList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentService, setCurrentService] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: "30",
      icon: "",
      status: "active",
      max_advance_booking_days: "15",
      min_buffer_minutes_from_now: "60",
      slot_interval_minutes: "10",
    },
  });

  useEffect(() => {
    if (currentService) {
      form.reset({
        name: currentService.name,
        description: currentService.description,
        duration: currentService.duration.toString(),
        icon: currentService.icon,
        status: currentService.status,
        max_advance_booking_days: currentService.max_advance_booking_days.toString(),
        min_buffer_minutes_from_now: currentService.min_buffer_minutes_from_now.toString(),
        slot_interval_minutes: currentService.slot_interval_minutes.toString(),
      });
    } else {
      form.reset({
        name: "",
        description: "",
        duration: "30",
        icon: "",
        status: "active",
        max_advance_booking_days: "15",
        min_buffer_minutes_from_now: "60",
        slot_interval_minutes: "10",
      });
    }
  }, [currentService, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    const payload = {
      name: values.name,
      description: values.description,
      duration: values.duration,
      icon: values.icon,
      status: values.status,
      max_advance_booking_days: values.max_advance_booking_days,
      min_buffer_minutes_from_now: values.min_buffer_minutes_from_now,
      slot_interval_minutes: values.slot_interval_minutes,
    };

    try {
      if (currentService) {
        const res = await updateServiceApi(currentService.id, payload);
        if (res.data) {
          toast({
            title: "Service updated successfully",
            description: "Your service has been updated",
          });
          setOpen(false);
          setCurrentService(null);
        }
      } else {
        const res = await createServiceApi(payload);
        if (res.data) {
          toast({
            title: "Service created successfully",
            description: "Service created successfully",
          });
          setOpen(false);
        }
      }
      fetchServiceList();
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: currentService ? "Failed to update service" : "Failed to create service",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: any) => {
    setCurrentService(service);
    setOpen(true);
  };

  const handleDelete = () => {
    setLoading(true);
    deleteServiceApi(currentService.id).then((res) => {
      if (res.data) {
        toast({
          title: "Service deleted",
          description: "The service has been deleted successfully",
        });
        setDeleteOpen(false);
        setLoading(false);
        fetchServiceList(); // Refresh the service list after deleting
        setCurrentService(null);
      }
    }).catch((err) => {
      console.log(err);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    });
  };

  const handleDeleteClick = (service: any) => {
    setCurrentService(service);
    setDeleteOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredServiceList(serviceList);
    } else {
      const filtered = serviceList.filter((service: any) =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
      setFilteredServiceList(filtered);
    }
  };

  const fetchServiceList = () => {
    setServiceListLoading(true);
    getServiceListApi().then((res) => {
      if (res.data?.data) {
        console.log("res.data", res.data?.data?.services);
        setServiceList(res.data?.data?.services);
        setFilteredServiceList(res.data?.data?.services);
      }
    }).catch((err) => {
      console.log(err);
      setServiceListLoading(false);
    }).finally(() => {
      setServiceListLoading(false);
    });
  };

  useEffect(() => {
    fetchServiceList();
  }, []);

  // Helper function to get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName);
    return iconOption ? iconOption.icon : Stethoscope;
  };

  // Helper function to get color class by icon name
  const getIconColor = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName);
    return iconOption ? iconOption.color : "from-green-500 to-emerald-600";
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentService(null);
    }
    setOpen(open);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="border-b px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Services</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage your service offerings and calendars</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <DialogTitle>{currentService ? 'Edit Service' : 'Create New Service'}</DialogTitle>
                        <DialogDescription>
                          {currentService ? 'Update your service details below.' : 'Add a new service to your offerings.'}
                        </DialogDescription>
                      </div>
                      <Button type="submit" className='mr-5' form="service-form" disabled={loading}>
                        {loading ? (currentService ? "Updating..." : "Creating...") : (currentService ? "Update Service" : "Create Service")}
                      </Button>
                    </div>
                  </DialogHeader>
                  <Form {...form}>
                    <form id="service-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-3">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter service name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Icon</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an icon">
                                    {field.value && (
                                      <div className="flex items-center gap-2">
                                        {React.createElement(
                                          iconOptions.find(i => i.value === field.value)?.icon || Stethoscope,
                                          { className: "h-4 w-4" }
                                        )}
                                        <span>{iconOptions.find(i => i.value === field.value)?.label}</span>
                                      </div>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-48 overflow-y-auto">
                                {iconOptions.map((iconOption) => {
                                  const Icon = iconOption.icon;
                                  return (
                                    <SelectItem key={iconOption.value} value={iconOption.value}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${iconOption.color} flex items-center justify-center`}>
                                          <Icon className="h-3 w-3 text-white" />
                                        </div>
                                        <span>{iconOption.label}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description of the service"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="15">15 minutes</SelectItem>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="45">45 minutes</SelectItem>
                                  <SelectItem value="60">1 hour</SelectItem>
                                  <SelectItem value="90">1.5 hours</SelectItem>
                                  <SelectItem value="120">2 hours</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="slot_interval_minutes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slot Interval (Minutes)</FormLabel>
                              <FormControl>
                                <Input type="number" min="5" placeholder="10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="max_advance_booking_days"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Advance Booking (Days)</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" placeholder="15" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="min_buffer_minutes_from_now"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Buffer (Minutes)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" placeholder="60" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {currentService && (
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}                    
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {/* Delete Confirmation Dialog */}
              <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the service "{currentService?.name}". This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCurrentService(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-100 h-full">
          {/* Services List */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {serviceListLoading ? (
                // Loading state
                <div className="col-span-4 text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground text-sm">Loading services...</p>
                  </div>
                </div>
              ) : filteredServiceList.length > 0 ? (
                filteredServiceList.map((service: any, index: number) => {
                  const IconComponent = getIconComponent(service.icon);
                  const colorClass = getIconColor(service.icon);

                  return (
                    <Card key={service.id || index} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <Badge variant="outline" className={`${service.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} border-0 text-xs px-2 py-0.5`}>
                            {service.status === 'active' ? 'Active' : service.status}
                          </Badge>
                        </div>
                        <h4 className="text-base font-bold mb-1">{service.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{service.duration} min</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEdit(service)}
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDeleteClick(service)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-4 text-center py-8">
                  {searchQuery ? (
                    <p className="text-muted-foreground text-sm">No services found matching "{searchQuery}". Try a different search term.</p>
                  ) : (
                    <p className="text-muted-foreground text-sm">No services found. Create your first service to get started.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;