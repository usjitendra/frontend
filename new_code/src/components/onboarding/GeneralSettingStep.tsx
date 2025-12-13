import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, ArrowRight, Settings, Clock, Calendar, CalendarCheck, HelpCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { onboardingApi } from '@/network/Api';

// Define schema for form validation
const generalSettingsSchema = z.object({
    appointmentTypes: z.array(z.string()).min(1, {
        message: "Please select at least one appointment type.",
    }),
    weekdayStart: z.string().min(1, {
        message: "Please select a start time.",
    }),
    weekdayEnd: z.string().min(1, {
        message: "Please select an end time.",
    }),
    weekendStart: z.string().min(1, {
        message: "Please select a start time.",
    }),
    weekendEnd: z.string().min(1, {
        message: "Please select an end time.",
    }),
    calendarIntegration: z.string().min(1, {
        message: "Please select a calendar integration.",
    }),
    separateCalendars: z.boolean().default(false),
});

type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

const GeneralSettingStep: React.FC<{ setStep?: (step: number) => void }> = ({ setStep }) => {
    const form = useForm<GeneralSettingsFormValues>({
        resolver: zodResolver(generalSettingsSchema),
        defaultValues: {
            appointmentTypes: [],
            weekdayStart: "9:00 AM",
            weekdayEnd: "5:00 PM",
            weekendStart: "10:00 AM",
            weekendEnd: "2:00 PM",
            calendarIntegration: "",
            separateCalendars: false,
        }
    });

    const onSubmit = (values: GeneralSettingsFormValues) => {
        console.log(values);
        const payload = {
            "general_settings": {
                "appointment_types": values.appointmentTypes,
                "weekday_start": values.weekdayStart,
                "weekday_end": values.weekdayEnd,
                "weekend_start": values.weekendStart,
                "weekend_end": values.weekendEnd,
                "calendar_integration": values.calendarIntegration,
                "separate_calendars": values.separateCalendars
            },
            "complete_onboarding": true
        }
        onboardingApi(payload).then((res) => {
            if (res && res.data) {
                if (setStep) setStep(6); // Move to next step
            }
        }).catch((err) => {
            console.log("err", err);
        })
    };

    const goBack = () => {
        if (setStep) setStep(4); // Go back to previous step
    };

    return (
        <div className="min-h-screen py-6 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                        <Settings className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-3">General Settings</h1>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                        <p className="text-muted-foreground">Step 5 of 6</p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="appointmentTypes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type of Appointments</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            const currentValues = field.value || [];
                                            if (currentValues.includes(value)) {
                                                field.onChange(currentValues.filter(v => v !== value));
                                            } else {
                                                field.onChange([...currentValues, value]);
                                            }
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select appointment types" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="dental">Dental</SelectItem>
                                            <SelectItem value="eye">Eye</SelectItem>
                                            <SelectItem value="pediatric">Pediatric</SelectItem>
                                            <SelectItem value="dermatology">Dermatology</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="mt-2">
                                        {field.value && field.value.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {field.value.map((type) => (
                                                    <div key={type} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            className="h-4 w-4 p-0 ml-2 text-primary hover:text-primary/80"
                                                            onClick={() => {
                                                                field.onChange(field.value.filter(t => t !== type));
                                                            }}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No appointment types selected</p>
                                        )}
                                    </div>
                                    <FormDescription>
                                        You can select multiple appointment types
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <FormLabel className="block mb-4">Business Operating Hours</FormLabel>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center">
                                        <Clock className="text-primary mr-3 h-5 w-5" />
                                        <div>
                                            <p className="font-medium">Weekdays</p>
                                            <p className="text-sm text-muted-foreground">Monday to Friday</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FormField
                                            control={form.control}
                                            name="weekdayStart"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="w-[110px]">
                                                        <SelectValue placeholder="Start time" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                                                        <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                                                        <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        <span className="text-muted-foreground">to</span>
                                        <FormField
                                            control={form.control}
                                            name="weekdayEnd"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="w-[110px]">
                                                        <SelectValue placeholder="End time" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                                                        <SelectItem value="5:00 PM">5:00 PM</SelectItem>
                                                        <SelectItem value="6:00 PM">6:00 PM</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center">
                                        <Clock className="text-primary mr-3 h-5 w-5" />
                                        <div>
                                            <p className="font-medium">Weekends</p>
                                            <p className="text-sm text-muted-foreground">Saturday & Sunday</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FormField
                                            control={form.control}
                                            name="weekendStart"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="w-[110px]">
                                                        <SelectValue placeholder="Start time" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                                                        <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                                                        <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        <span className="text-muted-foreground">to</span>
                                        <FormField
                                            control={form.control}
                                            name="weekendEnd"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="w-[110px]">
                                                        <SelectValue placeholder="End time" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1:00 PM">1:00 PM</SelectItem>
                                                        <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                                                        <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="calendarIntegration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Calendar Integration</FormLabel>
                                    <div className="grid grid-cols-3 gap-4 mt-2">
                                        {[
                                            {
                                                id: "avros",
                                                label: "Avros",
                                                icon: <img src="/avaros_logo.png" alt="Avros" className="h-12 w-12 object-cover rounded-full" />
                                            },
                                            {
                                                id: "google",
                                                label: "Google Calendar",
                                                icon: <img src="/google_calendar_logo.png" alt="Google Calendar" className="h-12 w-12 object-cover rounded-full" />
                                            },
                                            {
                                                id: "calendly",
                                                label: "Calendly",
                                                icon: <img src="/calendly_logo.webp" alt="Calendly" className="h-12 w-12 object-cover rounded-full" />
                                            }
                                        ].map((item) => (
                                            <div
                                                key={item.id}
                                                className={`border rounded-lg p-4 cursor-pointer transition-colors ${field.value === item.id ? 'border-primary bg-primary/5' : 'hover:border-primary'}`}
                                                onClick={() => field.onChange(item.id)}
                                            >
                                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-3">
                                                    {item.icon}
                                                </div>
                                                <p className="text-center text-sm font-medium">{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="separateCalendars"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Separate Calendar for Each Service</FormLabel>
                                        <FormDescription>
                                            Enable different calendars for different services
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between mt-10">
                            <Button type="button" variant="outline" className="group" onClick={goBack}>
                                <ArrowLeft className="mr-2 h-4 w-4 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                                Back
                            </Button>
                            <Button type="submit" className="group">
                                Next Step
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:transform group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default GeneralSettingStep;