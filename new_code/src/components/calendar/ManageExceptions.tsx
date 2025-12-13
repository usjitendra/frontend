import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash2, Edit, Clock, CalendarX } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Exception = {
  id: string;
  date: Date;
  reason: string;
};

const ManageExceptions = ({
  isOpen,
  onClose,
  calendarId
}: {
  isOpen: boolean;
  onClose: () => void;
  calendarId: string;
}) => {
  const [exceptions, setExceptions] = useState<Exception[]>([
    {
      id: "1",
      date: new Date(2023, 11, 25),
      reason: "Christmas Holiday"
    },
    {
      id: "2",
      date: new Date(2024, 0, 1),
      reason: "New Year's Day"
    },
    {
      id: "3",
      date: new Date(2024, 1, 14),
      reason: "Valentine's Day"
    }
  ]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddException = () => {
    if (!date || !reason.trim()) return;
    
    if (editingId) {
      // Update existing exception
      setExceptions(prev => 
        prev.map(exc => 
          exc.id === editingId 
            ? { ...exc, date, reason } 
            : exc
        )
      );
      setEditingId(null);
    } else {
      // Add new exception
      const newException: Exception = {
        id: Date.now().toString(),
        date,
        reason
      };
      setExceptions(prev => [...prev, newException]);
    }
    
    // Reset form
    setDate(undefined);
    setReason("");
  };

  const handleEditException = (exception: Exception) => {
    setDate(exception.date);
    setReason(exception.reason);
    setEditingId(exception.id);
  };

  const handleDeleteException = (id: string) => {
    setExceptions(prev => prev.filter(exc => exc.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setDate(undefined);
      setReason("");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setDate(undefined);
    setReason("");
  };

  const saveExceptions = () => {
    // Here you would save the exceptions to your backend
    console.log("Saving exceptions:", exceptions);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="sticky top-0 z-10 bg-white pb-4 border-b">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <CalendarX className="mr-2 h-5 w-5 text-indigo-600" />
              Manage Calendar Exceptions
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-0 overflow-y-auto">
          <div className="space-y-4">
            <div className="p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="exception-date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="exception-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      {/* <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      /> */}
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exception-reason">Reason</Label>
                  <Input
                    id="exception-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Holiday, Personal Day, etc."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleAddException}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {editingId ? "Update Exception" : "Add Exception"}
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-medium text-lg mb-4 text-gray-900">Existing Exceptions</h3>
              
              <div className="space-y-3 max-h-[30vh] overflow-y-auto">
                {exceptions.map((exception) => (
                  <div 
                    key={exception.id} 
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 text-indigo-800 p-2 rounded-md">
                        <CalendarX className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{format(exception.date, "PPP")}</p>
                        <p className="text-sm text-gray-600">{exception.reason}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditException(exception)}
                        className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteException(exception.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>            
      </DialogContent>
    </Dialog>
  );
};

export default ManageExceptions;