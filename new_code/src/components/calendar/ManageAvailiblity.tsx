import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Trash2, Clock, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type TimeSlot = {
  id: string;
  startTime: string;
  endTime: string;
  isEmergency: boolean;
};

type DayAvailability = {
  enabled: boolean;
  timeSlots: TimeSlot[];
};

type WeekAvailability = {
  [key: string]: DayAvailability;
};

type FormattedAvailability = {
  [key: string]: Array<{
    start_time: string;
    end_time: string;
    is_emergency: boolean;
  }>;
};

const ManageAvailability = ({
  isOpen,
  onClose,
  calendarId,
  onSave,
  initialAvailability
}: {
  isOpen: boolean;
  onClose: () => void;
  calendarId: string;
  onSave?: (availability: FormattedAvailability) => void;
  initialAvailability?: FormattedAvailability;
}) => {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  const timeOptions = [
    "12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM", "2:00 AM", "2:30 AM",
    "3:00 AM", "3:30 AM", "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM",
    "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM",
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
    "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"
  ];

  // Convert API time format (24h) to display format (12h)
  const convertTimeToDisplayFormat = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Initialize availability for each day
  const getInitialAvailability = (): WeekAvailability => {
    const initial: WeekAvailability = {};
    
    daysOfWeek.forEach(day => {
      const dayLowerCase = day.toLowerCase();
      const dayAvailability = initialAvailability?.[dayLowerCase] || [];
      
      initial[day] = {
        enabled: dayAvailability.length > 0,
        timeSlots: dayAvailability.map((slot, index) => ({
          id: `${day}-${index + 1}`,
          startTime: convertTimeToDisplayFormat(slot.start_time),
          endTime: convertTimeToDisplayFormat(slot.end_time),
          isEmergency: slot.is_emergency
        }))
      };
    });
    
    return initial;
  };

  const [availability, setAvailability] = useState<WeekAvailability>(getInitialAvailability());

  // Update availability when initialAvailability changes
  useEffect(() => {
    setAvailability(getInitialAvailability());
  }, [initialAvailability]);

  const toggleDayEnabled = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        timeSlots: !prev[day].enabled && prev[day].timeSlots.length === 0 
          ? [{ id: `${day}-${Date.now()}`, startTime: "9:00 AM", endTime: "5:00 PM", isEmergency: false }] 
          : prev[day].timeSlots
      }
    }));
  };

  const addTimeSlot = (day: string) => {
    // Find a time slot that doesn't overlap with existing slots
    const existingSlots = availability[day].timeSlots;
    
    // Default new slot
    let newSlot = {
      id: `${day}-${Date.now()}`,
      startTime: "9:00 AM",
      endTime: "5:00 PM",
      isEmergency: false
    };
    
    // Try to find a non-overlapping time slot
    if (existingSlots.length > 0) {
      // Convert time strings to indices for easier comparison
      const timeToIndex = (time: string) => timeOptions.indexOf(time);
      
      // Find all used time indices
      const usedTimeRanges: [number, number][] = existingSlots.map(slot => 
        [timeToIndex(slot.startTime), timeToIndex(slot.endTime)]
      );
      
      // Find the first available time slot
      for (let startIdx = 0; startIdx < timeOptions.length - 1; startIdx++) {
        for (let endIdx = startIdx + 1; endIdx < timeOptions.length; endIdx++) {
          // Check if this time range overlaps with any existing slot
          const isOverlapping = usedTimeRanges.some(([usedStart, usedEnd]) => {
            return !(endIdx <= usedStart || startIdx >= usedEnd);
          });
          
          if (!isOverlapping) {
            newSlot = {
              id: `${day}-${Date.now()}`,
              startTime: timeOptions[startIdx],
              endTime: timeOptions[endIdx],
              isEmergency: false
            };
            break;
          }
        }
        
        if (newSlot.startTime !== "9:00 AM" || newSlot.endTime !== "5:00 PM") {
          break; // We found a non-default slot
        }
      }
    }
    
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...prev[day].timeSlots, newSlot]
      }
    }));
  };

  const removeTimeSlot = (day: string, slotId: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter(slot => slot.id !== slotId)
      }
    }));
  };

  const updateTimeSlot = (day: string, slotId: string, field: 'startTime' | 'endTime' | 'isEmergency', value: string | boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map(slot => 
          slot.id === slotId ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const handleEmergencyChange = (day: string, slotId: string, checked: boolean) => {
    updateTimeSlot(day, slotId, 'isEmergency', checked);
  };

  // Format time from "1:00 PM" to "13:00" format
  const formatTimeForAPI = (timeString: string): string => {
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatAvailabilityForAPI = (): FormattedAvailability => {
    const formattedAvailability: FormattedAvailability = {};
    
    daysOfWeek.forEach(day => {
      const dayLowerCase = day.toLowerCase();
      
      if (availability[day].enabled && availability[day].timeSlots.length > 0) {
        formattedAvailability[dayLowerCase] = availability[day].timeSlots.map(slot => ({
          start_time: formatTimeForAPI(slot.startTime),
          end_time: formatTimeForAPI(slot.endTime),
          is_emergency: slot.isEmergency
        }));
      } else {
        formattedAvailability[dayLowerCase] = [];
      }
    });
    
    return formattedAvailability;
  };

  const saveAvailability = () => {
    const formattedAvailability = formatAvailabilityForAPI();
    console.log("Saving availability:", formattedAvailability);
    
    // Call onSave with the formatted availability
    if (onSave) {
      onSave(formattedAvailability);
    }
    
    // Close the modal
    if (onClose) {
      onClose();
    }
  };

  // Check if a time option is within any existing time slot for a day
  const isTimeDisabled = (day: string, time: string, currentSlotId: string, isStartTime: boolean) => {
    const timeIndex = timeOptions.indexOf(time);
    if (timeIndex === -1) return false;
    
    return availability[day].timeSlots.some(slot => {
      if (slot.id === currentSlotId) return false; // Don't disable for the current slot
      
      const slotStartIndex = timeOptions.indexOf(slot.startTime);
      const slotEndIndex = timeOptions.indexOf(slot.endTime);
      
      // For start time: disable if the time is within any other slot's range
      if (isStartTime) {
        return timeIndex >= slotStartIndex && timeIndex < slotEndIndex;
      }
      // For end time: disable if the time is within any other slot's range
      else {
        return timeIndex > slotStartIndex && timeIndex <= slotEndIndex;
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="sticky top-0 z-10 bg-white pb-4 border-b">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-indigo-600" />
              Manage Availability
            </DialogTitle>
            <Button 
              onClick={saveAvailability}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 mr-2"
            >
              Save Availability
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4 overflow-y-auto">
          <div className="space-y-6">
            {daysOfWeek.map(day => (
              <div key={day} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Switch 
                      checked={availability[day].enabled}
                      onCheckedChange={() => toggleDayEnabled(day)}
                      className="mr-3"
                    />
                    <h3 className={`font-medium text-lg ${availability[day].enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                      {day}
                    </h3>
                  </div>
                  
                  {availability[day].enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(day)}
                      className="flex items-center text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Time Slot
                    </Button>
                  )}
                </div>

                {availability[day].enabled && (
                  <div className="space-y-3">
                    {availability[day].timeSlots.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No time slots added</p>
                    ) : (
                      availability[day].timeSlots.map((slot, index) => (
                        <div key={slot.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`${slot.id}-start`} className="text-xs text-gray-500 mb-1 block">
                                Start Time
                              </Label>
                              <Select
                                value={slot.startTime}
                                onValueChange={(value) => updateTimeSlot(day, slot.id, 'startTime', value)}
                              >
                                <SelectTrigger id={`${slot.id}-start`} className="w-full">
                                  <SelectValue placeholder="Select start time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map(time => (
                                    <SelectItem 
                                      key={`start-${time}`} 
                                      value={time}
                                      disabled={isTimeDisabled(day, time, slot.id, true)}
                                    >
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor={`${slot.id}-end`} className="text-xs text-gray-500 mb-1 block">
                                End Time
                              </Label>
                              <Select
                                value={slot.endTime}
                                onValueChange={(value) => updateTimeSlot(day, slot.id, 'endTime', value)}
                              >
                                <SelectTrigger id={`${slot.id}-end`} className="w-full">
                                  <SelectValue placeholder="Select end time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map(time => (
                                    <SelectItem 
                                      key={`end-${time}`} 
                                      value={time}
                                      disabled={isTimeDisabled(day, time, slot.id, false) || 
                                                timeOptions.indexOf(time) <= timeOptions.indexOf(slot.startTime)}
                                    >
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <Checkbox 
                                id={`${slot.id}-emergency`}
                                checked={slot.isEmergency}
                                onCheckedChange={(checked) => 
                                  handleEmergencyChange(day, slot.id, checked === true)
                                }
                                className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                              />
                              <Label 
                                htmlFor={`${slot.id}-emergency`} 
                                className="text-xs cursor-pointer flex items-center text-amber-700"
                              >
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Emergency/After Hours
                              </Label>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTimeSlot(day, slot.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageAvailability;