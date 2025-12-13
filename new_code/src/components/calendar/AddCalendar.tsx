import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Calendar, Mail, Building } from "lucide-react";

interface AddCalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCalendar = ({ isOpen, onClose }: AddCalendarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);

  const handleConnect = (calendarId: string) => {
    console.log(`Connecting to calendar: ${calendarId}`);
    // Here you would implement the actual connection logic
    setSelectedCalendars(prev => [...prev, calendarId]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-6">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-semibold">Add Calendar</DialogTitle>     
          </div>
        </DialogHeader>          

        <div className="overflow-y-auto max-h-[60vh]">
          <Tabs defaultValue="google" className="w-full bg-transparent">
            <TabsList className="grid grid-cols-3 w-full mb-6 p-1 bg-transparent">
              <TabsTrigger 
                value="google" 
                className="flex items-center justify-center py-2 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none shadow-none"
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </TabsTrigger>
              <TabsTrigger 
                value="microsoft" 
                className="flex items-center justify-center py-2 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none shadow-none"
              >
                <Mail className="mr-2 h-4 w-4" />
                Microsoft
              </TabsTrigger>
              <TabsTrigger 
                value="clinic" 
                className="flex items-center justify-center py-2 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none shadow-none"
              >
                <Building className="mr-2 h-4 w-4" />
                EMR
              </TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-3 mt-0">
              {["personal", "work"].map((calendar) => (
                <div key={calendar} className="flex items-center justify-between p-4 border rounded-xl hover:border-indigo-200 hover:bg-gray-50 transition-all">
                  <div>
                    <h4 className="font-medium">{calendar === "personal" ? "Personal Calendar" : "Work Calendar"}</h4>
                    <p className="text-sm text-gray-500">
                      {calendar === "personal" ? "doctor.personal@gmail.com" : "doctor.work@gmail.com"}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleConnect(`google-${calendar}`)}
                    disabled={selectedCalendars.includes(`google-${calendar}`)}
                    className={selectedCalendars.includes(`google-${calendar}`) 
                      ? "bg-green-100 text-green-700 hover:bg-green-100" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"}
                  >
                    {selectedCalendars.includes(`google-${calendar}`) ? "Connected" : "Connect"}
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="microsoft" className="space-y-3 mt-0">
              {["outlook", "office365"].map((calendar) => (
                <div key={calendar} className="flex items-center justify-between p-4 border rounded-xl hover:border-indigo-200 hover:bg-gray-50 transition-all">
                  <div>
                    <h4 className="font-medium">{calendar === "outlook" ? "Outlook Calendar" : "Office 365"}</h4>
                    <p className="text-sm text-gray-500">
                      {calendar === "outlook" ? "doctor@outlook.com" : "doctor@office365.com"}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleConnect(`microsoft-${calendar}`)}
                    disabled={selectedCalendars.includes(`microsoft-${calendar}`)}
                    className={selectedCalendars.includes(`microsoft-${calendar}`) 
                      ? "bg-green-100 text-green-700 hover:bg-green-100" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"}
                  >
                    {selectedCalendars.includes(`microsoft-${calendar}`) ? "Connected" : "Connect"}
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="clinic" className="space-y-3 mt-0">
              {["main", "branch"].map((calendar) => (
                <div key={calendar} className="flex items-center justify-between p-4 border rounded-xl hover:border-indigo-200 hover:bg-gray-50 transition-all">
                  <div>
                    <h4 className="font-medium">{calendar === "main" ? "Main Clinic" : "Branch Office"}</h4>
                    <p className="text-sm text-gray-500">
                      {calendar === "main" ? "clinic.main@doctena.com" : "clinic.branch@doctena.com"}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleConnect(`clinic-${calendar}`)}
                    disabled={selectedCalendars.includes(`clinic-${calendar}`)}
                    className={selectedCalendars.includes(`clinic-${calendar}`) 
                      ? "bg-green-100 text-green-700 hover:bg-green-100" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"}
                  >
                    {selectedCalendars.includes(`clinic-${calendar}`) ? "Connected" : "Connect"}
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>        
      </DialogContent>
    </Dialog>
  );
};

export default AddCalendar;