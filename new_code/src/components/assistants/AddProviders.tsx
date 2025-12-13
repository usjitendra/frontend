"use client"

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Briefcase, Clock, CheckCircle, Plus, ExternalLink, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProviderListApi } from "@/network/Api";
import { useRouter } from "next/navigation";

const AddProviders = ({ initialValues, onFormDataChange }: { initialValues: any, onFormDataChange: (data: any) => void }) => {
    const [providers, setProviders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedProviders, setSelectedProviders] = useState<string[]>(initialValues?.providers || []);
    const prevProvidersRef = useRef<string[]>(initialValues?.providers || []);
    const router = useRouter();
    
    useEffect(() => {
        if (JSON.stringify(selectedProviders) !== JSON.stringify(prevProvidersRef.current)) {
            prevProvidersRef.current = selectedProviders;
            onFormDataChange({ providers: selectedProviders });
        }
    }, [selectedProviders, onFormDataChange]);

    const fetchProviders = () => {
        setIsLoading(true);
        getProviderListApi().then((res:any) => {
            if(res.data){
                console.log(res?.data?.data?.providers);
                setProviders(res?.data?.data?.providers);
            }
        }).catch((err:any) => {
            console.log(err);
            setProviders([]);
        }).finally(() => {
            setIsLoading(false);
        });
    };
    
    useEffect(() => {
        fetchProviders();
    }, []); 

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        const firstInitial = parts[0]?.charAt(0) || '';
        const secondInitial = parts[1]?.charAt(0) || '';
        return (firstInitial + secondInitial).toUpperCase().slice(0, 2);
    };

    const formatAvailability = (availability: any) => {
        if (!availability) return ["No availability set"];
        
        const formatTime = (time: string) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        };

        const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayAbbreviations: { [key: string]: string } = {
            'monday': 'Mon',
            'tuesday': 'Tue', 
            'wednesday': 'Wed',
            'thursday': 'Thu',
            'friday': 'Fri',
            'saturday': 'Sat',
            'sunday': 'Sun'
        };

        const availabilityLines = dayOrder
            .filter(day => availability[day] && Array.isArray(availability[day]) && availability[day].length > 0)
            .map(day => {
                const timeSlots = availability[day] as { start_time: string; end_time: string; is_emergency?: boolean }[];
                const formattedSlots = timeSlots.map(slot => {
                    const timeRange = `${formatTime(slot.start_time)}-${formatTime(slot.end_time)}`;
                    return slot.is_emergency ? `${timeRange} (Emergency)` : timeRange;
                }).join(', ');
                return `${dayAbbreviations[day]}: ${formattedSlots}`;
            });
        
        return availabilityLines.length > 0 
            ? availabilityLines
            : ["No availability set"];
    };

    // Function to check if provider is available today
    const isAvailableToday = (availability: any) => {
        if (!availability) return false;
        
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = daysOfWeek[new Date().getDay()];
        
        const todaySlots = availability[today as keyof typeof availability];
        return todaySlots !== null && todaySlots !== undefined && todaySlots.length > 0;
    };

    // Function to check if provider has emergency slots today
    const hasEmergencyToday = (availability: any) => {
        if (!availability) return false;
        
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = daysOfWeek[new Date().getDay()];
        
        const todaySlots = availability[today as keyof typeof availability];
        if (!todaySlots || !Array.isArray(todaySlots)) return false;
        
        return todaySlots.some((slot: any) => slot.is_emergency === true);
    };

    const toggleProviderSelection = (providerId: string) => {
        setSelectedProviders(prev => {
            const newSelection = prev.includes(providerId)
                ? prev.filter(id => id !== providerId)
                : [...prev, providerId];
            return newSelection;
        });
    };

    return (
        <div className="p-4">
            
            <div className="mb-4 flex items-center justify-between">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-0 px-3 py-1">
                    {selectedProviders.length} provider{selectedProviders.length !== 1 ? 's' : ''} selected
                </Badge>
                <Button 
                    onClick={() => router.push('/providers/create')}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Create New Provider
                </Button>
            </div>
            
            <ScrollArea className="h-full">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <span className="ml-2 text-gray-600">Loading providers...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {providers.length > 0 ? (
                            providers.map((provider) => {
                                const isSelected = selectedProviders.includes(provider.id);
                                const availableToday = isAvailableToday(provider.availability);
                                const emergencyToday = hasEmergencyToday(provider.availability);
                                const availabilityLines = formatAvailability(provider.availability);
                                return (
                                    <Card 
                                        key={provider.id}
                                        className={`rounded-xl hover:shadow-md transition-all cursor-pointer relative flex flex-col ${
                                            isSelected 
                                                ? 'border-2 border-blue-500' 
                                                : 'border border-gray-200'
                                        }`}
                                        onClick={() => toggleProviderSelection(provider.id)}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-blue-500 rounded-full">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        <CardContent className="p-3 flex-1">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                                                    isSelected 
                                                        ? 'bg-blue-600' 
                                                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                                }`}>
                                                    {getInitials(provider.name)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{provider.name}</h4>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{provider.description || "Healthcare Provider"}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-2">
                                                        <Calendar className="w-3 h-3 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">{provider.calendar_id ? "Calendar Connected" : "No Calendar"}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center mr-2">
                                                        <Briefcase className="w-3 h-3 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            {provider.services.length} {provider.services.length === 1 ? "Service" : "Services"}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start">
                                                    <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center mr-2 mt-0.5">
                                                        <Clock className="w-3 h-3 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        {availabilityLines.map((line, index) => (
                                                            <p key={index} className="text-xs text-gray-500 leading-relaxed break-words">{line}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="px-3 py-2 bg-gray-50 rounded-b-xl mt-auto">
                                            <div className="flex items-center gap-2 w-full">
                                                <Badge 
                                                    variant="outline" 
                                                    className={`${
                                                        availableToday 
                                                            ? "bg-green-100 text-green-700" 
                                                            : "bg-red-100 text-red-700"
                                                    } border-0 text-xs px-2 py-0.5 flex-1`}
                                                >
                                                    {availableToday ? "Available Today" : "Not Available Today"}
                                                </Badge>
                                                {emergencyToday && (
                                                    <Badge 
                                                        variant="outline" 
                                                        className="bg-orange-100 text-orange-700 border-0 text-xs px-2 py-0.5"
                                                    >
                                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                                        Emergency
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500">No providers found. Please add providers first.</p>
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

export default AddProviders;