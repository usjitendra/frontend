"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Calendar,
  Briefcase,
  Clock,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteProviderApi, getProviderListApi } from "@/network/Api";
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

interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  is_emergency: boolean;
}

interface Provider {
  id: string;
  company_id: string;
  name: string;
  calendar_id: string;
  availability: {
    monday: AvailabilitySlot[] | null;
    tuesday: AvailabilitySlot[] | null;
    wednesday: AvailabilitySlot[] | null;
    thursday: AvailabilitySlot[] | null;
    friday: AvailabilitySlot[] | null;
    saturday: AvailabilitySlot[] | null;
    sunday: AvailabilitySlot[] | null;
  };
  services: string[];
  gender: string;
  accept_new: boolean;
  description: string;
  knowledge_base: string[];
  knowledge_base_id: string;
  assigned_patients: string[];
  created_at: string;
  updated_at: string;
  accept_walk_in: boolean;
}

const Providers = () => {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

  const fetchProviders = () => {
    setIsLoading(true);
    getProviderListApi()
      .then((res: any) => {
        if (res.data) {
          console.log(res?.data?.data?.providers);
          setProviders(res?.data?.data?.providers);
        }
      })
      .catch((err: any) => {
        console.log(err);
        setProviders([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Function to get provider initials
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    let initials = "";

    if (parts.length === 1) {
      // If only one name, take first letter
      initials = parts[0].charAt(0);
    } else {
      // Take first letter of first name and first letter of last name
      initials = parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
    }

    return initials.toUpperCase();
  };

  // Function to format availability
  const formatAvailability = (availability: Provider["availability"]) => {
    if (!availability) return ["No availability set"];

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    const availableDaysWithTimes = Object.entries(availability)
      .filter(([_, slots]) => slots && slots.length > 0)
      .map(([day, slots]) => {
        const formattedSlots = slots
          ?.map(
            (slot: AvailabilitySlot) =>
              `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}${
                slot.is_emergency ? " (Emergency)" : ""
              }`
          )
          .join(", ");

        return `${
          day.charAt(0).toUpperCase() + day.slice(1)
        }: ${formattedSlots}`;
      });

    return availableDaysWithTimes.length > 0
      ? availableDaysWithTimes
      : ["No availability set"];
  };

  // Function to check if provider is available today
  const isAvailableToday = (availability: Provider["availability"]) => {
    if (!availability) return { available: false, emergency: false };

    const daysOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = daysOfWeek[new Date().getDay()];

    const todaySlots = availability[today as keyof typeof availability];
    const hasSlots =
      todaySlots !== null && todaySlots !== undefined && todaySlots.length > 0;
    const hasEmergencySlots =
      hasSlots && todaySlots.some((slot) => slot.is_emergency);

    return { available: hasSlots, emergency: hasEmergencySlots };
  };

  const openDeleteConfirm = (id: string) => {
    setProviderToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteProvider = (id: string) => {
    setIsDeleting(true);
    deleteProviderApi(id)
      .then((res: any) => {
        if (res.data) {
          console.log(res?.data?.message);
          fetchProviders();
        }
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        setIsDeleting(false);
        setDeleteConfirmOpen(false);
        setProviderToDelete(null);
      });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <div id="main-content" className="flex-1 overflow-auto">
        <div id="header" className="bg-white shadow-sm px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Providers</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage your service providers and their capabilities
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search providers..."
                  className="pl-10 pr-4 py-2.5 w-64"
                />
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              </div>
              <Button
                id="add-provider-btn"
                variant="default"
                onClick={() => router.push("/providers/create")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </div>
          </div>
        </div>

        <div id="providers-categories" className="p-8">
          {/* Filters */}
          <div
            id="provider-filters"
            className="mb-6 flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Filter by:
              </span>
              <Select defaultValue="all-specialties">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-specialties">
                    All Specialties
                  </SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="dental">Dental</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Select defaultValue="all-availability">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-availability">
                    All Availability
                  </SelectItem>
                  <SelectItem value="available-today">
                    Available Today
                  </SelectItem>
                  <SelectItem value="available-this-week">
                    Available This Week
                  </SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <Select defaultValue="name-az">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Name (A-Z)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-az">Name (A-Z)</SelectItem>
                  <SelectItem value="name-za">Name (Z-A)</SelectItem>
                  <SelectItem value="most-services">Most Services</SelectItem>
                  <SelectItem value="recently-added">Recently Added</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Providers Grid */}
          <div id="providers-grid" className="mb-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading providers...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {providers.length > 0 ? (
                  providers.map((provider: any) => {
                    const todayAvailability = isAvailableToday(
                      provider.availability
                    );
                    const availabilityLines = formatAvailability(
                      provider.availability
                    );

                    return (
                      <Card
                        key={provider.id}
                        id={`provider-card-${provider.id}`}
                        className="rounded-2xl hover:shadow-md transition-all flex flex-col"
                      >
                        <CardContent className="p-6 flex-grow">
                          <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                {getInitials(provider.name)}
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">
                                  {provider.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {provider.description ||
                                    "Healthcare Provider"}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-blue-600"
                                onClick={() =>
                                  router.push(`/providers/${provider.id}`)
                                }
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-red-600"
                                onClick={() => openDeleteConfirm(provider.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4 mb-5">
                            {/* Calendar */}
                            <div className="flex items-center">
                              <div
                                className={`w-8 h-8 ${
                                  provider.calendar_id
                                    ? "bg-blue-100"
                                    : "bg-red-100"
                                } rounded-lg flex items-center justify-center mr-3`}
                              >
                                <Calendar
                                  className={`w-4 h-4 ${
                                    provider.calendar_id
                                      ? "text-blue-600"
                                      : "text-red-600"
                                  }`}
                                />
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">
                                  Calendar
                                </h5>
                                {provider.calendar_id ? (
                                  <p className="text-xs text-gray-500">
                                    Connected
                                  </p>
                                ) : (
                                  <p className="text-xs text-red-500">
                                    Not connected - required for appointment
                                    booking
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Services */}
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <Briefcase className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">
                                  {provider.services.length}{" "}
                                  {provider.services.length === 1
                                    ? "Service"
                                    : "Services"}{" "}
                                  Attached
                                </h5>
                                <p className="text-xs text-gray-500">
                                  {provider.services.length > 0
                                    ? `${provider.services.length} services configured`
                                    : "No services configured"}
                                </p>
                              </div>
                            </div>

                            {/* Availability */}
                            <div className="flex items-start">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                <Clock className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-medium text-gray-900">
                                  Availability
                                </h5>
                                <div className="text-xs text-gray-500 space-y-1">
                                  {availabilityLines.map((line, index) => (
                                    <p key={index} className="break-words">
                                      {line}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="px-6 py-3 bg-gray-50 rounded-b-2xl">
                          <div className="flex flex-wrap gap-2 w-full">
                            <Badge
                              variant="outline"
                              className={`${
                                todayAvailability.available
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              } border-0`}
                            >
                              {todayAvailability.available
                                ? "Available Today"
                                : "Not Available Today"}
                            </Badge>
                            {todayAvailability.emergency && (
                              <Badge
                                variant="outline"
                                className="bg-red-100 text-red-700 border-0 flex items-center gap-1"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                Emergency
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={`${
                                provider.accept_new_registrations
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              } border-0`}
                            >
                              {provider.accept_new_registrations
                                ? "Accepting New Patients"
                                : "Not Accepting New Patients"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-indigo-100 text-indigo-700 border-0"
                            >
                              {provider.accept_walk_in
                                ? "Walk-ins Welcome"
                                : "Appointment Only"}
                            </Badge>
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-gray-500">
                      No providers found. Add your first provider to get
                      started.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this provider? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                providerToDelete && handleDeleteProvider(providerToDelete)
              }
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Providers;
