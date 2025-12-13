import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { X, MoreVertical, Plus, ArrowLeft } from "lucide-react";

const ManageServices = ({calendarId,isOpen,onClose}: {calendarId: string,isOpen: boolean,onClose: () => void}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [services, setServices] = useState([
    {
      id: "service-1",
      name: "General Consultation",
      description: "Regular checkup and consultation for general health concerns.",
      duration: "30 min",
      durationColor: "green"
    },
    {
      id: "service-2",
      name: "Detailed Health Assessment",
      description: "Comprehensive health evaluation including detailed medical history review.",
      duration: "1 hour",
      durationColor: "blue"
    }
  ]);

  const handleAddService = (e: any) => {
    e.preventDefault();
    // Add service logic here
    setShowAddForm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              {showAddForm ? (
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mr-2 p-0" 
                    onClick={() => setShowAddForm(false)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  Add New Service
                </div>
              ) : (
                "Manage Services"
              )}
            </DialogTitle>
            {!showAddForm && (
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 text-white hover:text-white-300 transition-all bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 mr-2"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Add New Service</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {showAddForm ? (
          <div className="py-4">
            <form className="space-y-4" onSubmit={handleAddService}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <Input 
                  type="text" 
                  placeholder="Enter service name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea 
                  placeholder="Enter service description"
                  className="h-24"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="submit">
                  Add Service
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto py-2">
            <div className="space-y-6">
              {services.map((service) => (
                <div key={service.id} className="border rounded-xl p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-800">{service.name}</h3>
                        <span className={`px-3 py-1 text-xs font-medium text-${service.durationColor}-600 bg-${service.durationColor}-50 rounded-full`}>
                          {service.duration}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageServices;