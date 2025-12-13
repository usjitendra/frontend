"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  getPhoneNumbersApi,
  getAssistantListApi,
  assignAssistantToPhoneNumberApi,
  deletPhoneNumber,
} from "@/network/Api";
import { useEffect, useState } from "react";
import {
  Loader2,
  Phone,
  Calendar,
  MoreVertical,
  Flag,
  Plus,
  Search,
  Bot,
  Unlock,
  Ban,
  Trash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Swal from "sweetalert2";

import { toast } from "@/hooks/use-toast";
import BuyPhoneNumber from "@/components/BuyPhoneNumber";

const PhoneNumbers = () => {
  const router = useRouter();
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [filteredPhoneNumbers, setFilteredPhoneNumbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<any>(null);
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState("");
  const [isAssistantsLoading, setIsAssistantsLoading] = useState(false);
  const [openBuyPhoneNumberModal, setOpenBuyPhoneNumberModal] = useState(false);
  const getPhoneNumbers = () => {
    setIsLoading(true);
    getPhoneNumbersApi()
      .then((res) => {
        if (res?.data?.data) {
          const numbers = res?.data?.data?.phone_numbers;
          setPhoneNumbers(numbers);
          setFilteredPhoneNumbers(numbers);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getAssistants = () => {
    setIsAssistantsLoading(true);
    getAssistantListApi(1, 100)
      .then((res) => {
        if (res?.data?.data) {
          setAssistants(res.data.data.assistants || []);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsAssistantsLoading(false);
      });
  };

  useEffect(() => {
    getPhoneNumbers();
  }, []);

  // Format phone number for display
  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return "";
    // Format +14313061823 to +1 (431) 306-1823
    const match = phoneNumber.match(/^\+(\d{1})(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    return phoneNumber;
  };

  // Get country from phone number
  const getCountryFromPhone = (phoneNumber: string) => {
    if (!phoneNumber) return "Unknown";
    if (phoneNumber.startsWith("+1")) {
      // Check area code for US vs Canada
      const areaCode = phoneNumber.substring(2, 5);
      // This is a simplified check - would need a more comprehensive list for production
      const canadaAreaCodes = [
        "204",
        "226",
        "236",
        "249",
        "250",
        "289",
        "306",
        "343",
        "365",
        "387",
        "403",
        "416",
        "418",
        "431",
        "437",
        "438",
        "450",
        "506",
        "514",
        "519",
        "548",
        "579",
        "581",
        "587",
        "604",
        "613",
        "639",
        "647",
        "705",
        "709",
        "778",
        "780",
        "782",
        "807",
        "819",
        "825",
        "867",
        "873",
        "902",
        "905",
      ];
      return canadaAreaCodes.includes(areaCode) ? "Canada" : "United States";
    }
    if (phoneNumber.startsWith("+44")) return "United Kingdom";
    return "International";
  };

  // Get background color based on country
  const getCountryBgColor = (country: string) => {
    switch (country) {
      case "United States":
        return "from-blue-500 to-indigo-600";
      case "Canada":
        return "from-red-500 to-pink-600";
      case "United Kingdom":
        return "from-green-500 to-emerald-600";
      default:
        return "from-purple-500 to-violet-600";
    }
  };

  // Get country icon based on country
  const getCountryIcon = (country: string) => {
    switch (country) {
      case "United States":
        return "fa-flag-usa";
      case "Canada":
      case "United Kingdom":
      default:
        return "fa-flag";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      // Canada + eastern US compatible
    });
  };

  const handlePhoneCardClick = (phone: any) => {
    setSelectedPhone(phone);
    setSelectedAssistant(phone.assistant_id || "");
    setIsDialogOpen(true);

    // Load assistants if not already loaded
    if (assistants.length === 0) {
      getAssistants();
    }
  };

  const handleAssignAssistant = () => {
    // Here you would implement the API call to assign the assistant to the phone number
    console.log(
      "Assigning assistant",
      selectedAssistant,
      "to phone",
      selectedPhone.phone_number
    );

    // Close the dialog
    const payload = {
      assistant_id: selectedAssistant == "none" ? "" : selectedAssistant,
    };
    setIsDialogOpen(false);
    assignAssistantToPhoneNumberApi(selectedPhone.id, payload)
      .then((res) => {
        if (res?.data?.data) {
          console.log(res);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        getPhoneNumbers();
        setSelectedAssistant("");
        setSelectedPhone(null);
        setIsDialogOpen(false);
        toast({
          title: "Assistant assigned to phone number",
          description: "Assistant assigned to phone number successfully",
          variant: "default",
        });
      });
  };

  const handleDelete = async (phoneId: any) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This phone number will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    try {
      if (result.isConfirmed) {
        console.log("Deleting phone:", phoneId);

        const result = await deletPhoneNumber(phoneId);
        if (result?.data) {
          toast({
            title: "Success",
            description: "Phone number deleted successfully!",
            variant: "default",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.mesaage,
        variant: "destructive",
      });
    } finally {
      getPhoneNumbers();
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="border-b bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Phone Numbers</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your virtual phone numbers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  setOpenBuyPhoneNumberModal(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buy Number
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-100 h-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPhoneNumbers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhoneNumbers?.map((phone: any) => {
                const country = getCountryFromPhone(phone.phone_number);
                const bgColor = getCountryBgColor(country);

                return (
                  <Card
                    key={phone.id}
                    className="hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => handlePhoneCardClick(phone)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${bgColor} rounded-xl flex items-center justify-center`}
                          >
                            <Flag className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            {country}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                          <span className="text-sm text-green-600 font-medium">
                            Active
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(phone.id);
                            }}
                            className="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">
                        {formatPhoneNumber(phone.phone_number)}
                      </h3>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {phone.assistant_id
                              ? "Assistant Connected"
                              : "No Assistant"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              ID: {phone.id.substring(0, 8)}...
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {formatDate(phone.created_at)}
                            </span>
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary/80">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery
                  ? "No matching phone numbers found"
                  : "No phone numbers yet"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchQuery
                  ? "Try a different search term or clear the search to see all your numbers."
                  : "You haven't purchased any phone numbers yet. Get started by buying your first number."}
              </p>
              <Button
                onClick={() => setOpenBuyPhoneNumberModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                {searchQuery ? (
                  <>Clear Search</>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Buy Number
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Assign Assistant Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Assistant to Phone Number</DialogTitle>
            <DialogDescription>
              Select an assistant to handle calls and messages for this phone
              number.
            </DialogDescription>
          </DialogHeader>

          {selectedPhone && (
            <div className="py-4">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Phone Number
                </h3>
                <p className="text-lg font-bold">
                  {formatPhoneNumber(selectedPhone.phone_number)}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Select Assistant
                </h3>
                {isAssistantsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                    <span>Loading assistants...</span>
                  </div>
                ) : (
                  <Select
                    value={selectedAssistant}
                    onValueChange={setSelectedAssistant}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an assistant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {assistants.map((assistant: any) => (
                        <SelectItem key={assistant.id} value={assistant.id}>
                          {assistant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignAssistant}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
            >
              Assign Assistant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <BuyPhoneNumber
        open={openBuyPhoneNumberModal}
        onOpenChange={setOpenBuyPhoneNumberModal}
        onSuccess={() => {
          getPhoneNumbers();
        }}
      />
    </div>
  );
};

export default PhoneNumbers;
