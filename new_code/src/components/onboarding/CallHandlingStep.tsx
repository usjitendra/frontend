import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, ArrowRight, Phone, User, PhoneCall, AlertTriangle, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { onboardingApi } from '@/network/Api';

// Define schema for form validation
const callHandlingSchema = z.object({
    enableLiveAgentTransfer: z.boolean().default(false),
    agentName: z.string().optional(),
    agentPhoneNumber: z.string().optional(),
    offerSameDayAppointments: z.boolean().default(false),
    appointmentBookingWindow: z.string().min(1, {
        message: "Please select an appointment booking window.",
    }),
    emergencyHandling: z.string().min(1, {
        message: "Please select an emergency handling option.",
    }),
});

type CallHandlingFormValues = z.infer<typeof callHandlingSchema>;

const CallHandlingStep: React.FC<{ setStep: (step: number) => void }> = ({ setStep }) => {
    const form = useForm<CallHandlingFormValues>({
        resolver: zodResolver(callHandlingSchema),
        defaultValues: {
            enableLiveAgentTransfer: false,
            agentName: "",
            agentPhoneNumber: "",
            offerSameDayAppointments: false,
            appointmentBookingWindow: "14",
            emergencyHandling: "transfer",
        }
    });

    const watchEnableLiveAgent = form.watch("enableLiveAgentTransfer");

    const onSubmit = (values: CallHandlingFormValues) => {
        console.log(values);
        const payload = {
            "call_handling": {
                "enable_live_agent_transfer": values.enableLiveAgentTransfer,
                "agent_name": values.agentName || "",
                "agent_phone_number": values.agentPhoneNumber || "",
                "offer_same_day_appointments": values.offerSameDayAppointments,
                "appointment_booking_window": values.appointmentBookingWindow,
                "emergency_handling": values.emergencyHandling
            },
            "complete_onboarding": false
        }
        onboardingApi(payload).then((res) => {
            if (res?.data) {
                setStep(5); // Move to next step
            }
        }).catch((err) => {
            console.log("err", err);
        })
    };

    const goBack = () => {
        setStep(3); // Go back to previous step
    };

    return (
        <div className="min-h-screen py-6 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                        <Phone className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-3">Call Handling Settings</h1>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                        <p className="text-muted-foreground">Step 4 of 6</p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div>
                            <h3 className="text-lg font-medium mb-4">Call Flow Settings</h3>
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <FormField
                                        control={form.control}
                                        name="enableLiveAgentTransfer"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Enable Live Agent Transfer</FormLabel>
                                                    <FormDescription>
                                                        Allow calls to be transferred to a live agent
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {watchEnableLiveAgent && (
                                        <div className="mt-4 ml-7 space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="agentName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    placeholder="Agent Name"
                                                                    {...field}
                                                                    className="pr-10"
                                                                />
                                                                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="agentPhoneNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    placeholder="Agent Phone Number"
                                                                    type="tel"
                                                                    {...field}
                                                                    className="pr-10"
                                                                />
                                                                <PhoneCall className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-4">Appointment Settings</h3>
                            <div className="space-y-6">
                                <div className="p-6 border rounded-lg bg-muted/30">
                                    <FormField
                                        control={form.control}
                                        name="offerSameDayAppointments"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Offer same-day appointments if available</FormLabel>
                                                    <FormDescription>
                                                        AI will check and suggest available slots for the current day
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="p-6 border rounded-lg bg-muted/30">
                                    <FormField
                                        control={form.control}
                                        name="appointmentBookingWindow"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Appointment booking window</FormLabel>
                                                <FormDescription>
                                                    Select how many days ahead the AI can schedule appointments
                                                </FormDescription>
                                                <div className="grid grid-cols-4 gap-3 mt-4">
                                                    <Button
                                                        type="button"
                                                        variant={field.value === "7" ? "default" : "outline"}
                                                        onClick={() => field.onChange("7")}
                                                    >
                                                        7 days
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={field.value === "14" ? "default" : "outline"}
                                                        onClick={() => field.onChange("14")}
                                                    >
                                                        14 days
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={field.value === "30" ? "default" : "outline"}
                                                        onClick={() => field.onChange("30")}
                                                    >
                                                        30 days
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={field.value === "60" ? "default" : "outline"}
                                                        onClick={() => field.onChange("60")}
                                                    >
                                                        60 days
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-4">Emergency Call Handling</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="emergencyHandling"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select emergency handling option" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="transfer">Transfer to emergency line immediately</SelectItem>
                                                    <SelectItem value="details">Ask for emergency details first</SelectItem>
                                                    <SelectItem value="doctor">Route to on-call doctor</SelectItem>
                                                    <SelectItem value="custom">Custom handling</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-start">
                                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                        <p className="ml-3 text-sm text-yellow-700">
                                            Emergency calls will always be given highest priority in the queue
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

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

export default CallHandlingStep;