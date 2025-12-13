import React from 'react';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, ArrowRight, MessageSquare, ListChecks, MessageSquareCode, Bot } from "lucide-react";
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { onboardingApi } from '@/network/Api';

// Define schema for form validation
const aiAgentSchema = z.object({
    welcomeMessage: z.string().min(10, {
        message: "Welcome message must be at least 10 characters.",
    }),
    endMessage: z.string().min(10, {
        message: "End message must be at least 10 characters.",
    }),
    aiSpeakFirst: z.boolean(),
    specialInstructions: z.string().optional(),
});

type AiAgentFormValues = z.infer<typeof aiAgentSchema>;

const AiAgentStep: React.FC<{ setStep: (step: number) => void }> = ({ setStep }) => {
    const form = useForm<AiAgentFormValues>({
        resolver: zodResolver(aiAgentSchema),
        defaultValues: {
            welcomeMessage: "",
            endMessage: "",
            aiSpeakFirst: false,
            specialInstructions: ""
        }
    });

    const onSubmit = (values: AiAgentFormValues) => {
        console.log(values);
        const payload = {
            "ai_agent": {
                "welcome_message": values.welcomeMessage,
                "end_message": values.endMessage,
                "ai_speak_first": values.aiSpeakFirst,
                "special_instructions": values.specialInstructions || ""
            },
            "complete_onboarding": false
        }
        onboardingApi(payload).then((res) => {
            if (res?.data) {
                setStep(4);
            }
        }).catch((err) => {
            console.log("err", err);
        })
    };

    const goBack = () => {
        setStep(2); // Go back to previous step
    };

    return (
        <div className="min-h-screen py-6 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                        <Bot className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-3">AI Agent Instructions</h1>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                        <p className="text-muted-foreground">Step 3 of 6</p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="welcomeMessage"
                            render={({ field }) => (
                                <FormItem className="group">
                                    <FormLabel>Welcome Message</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Textarea
                                                {...field}
                                                rows={3}
                                                placeholder="Enter the first message your AI agent will say"
                                                className="pr-10"
                                            />
                                            <MessageSquare className="absolute right-4 top-3.5 text-muted-foreground group-hover:text-primary transition-colors h-5 w-5" />
                                        </div>
                                    </FormControl>
                                    <FormDescription>This is the first message callers will hear</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endMessage"
                            render={({ field }) => (
                                <FormItem className="group">
                                    <FormLabel>End Call Message</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Textarea
                                                {...field}
                                                rows={3}
                                                placeholder="Enter the message your AI agent will say before ending the call"
                                                className="pr-10"
                                            />
                                            <MessageSquareCode className="absolute right-4 top-3.5 text-muted-foreground group-hover:text-primary transition-colors h-5 w-5" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="aiSpeakFirst"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <FormLabel className="text-foreground">Should AI Speak First?</FormLabel>
                                        <FormDescription>Enable if you want the AI to initiate the conversation</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="specialInstructions"
                            render={({ field }) => (
                                <FormItem className="group">
                                    <FormLabel>
                                        Special Instructions
                                        <span className="text-muted-foreground text-sm font-normal ml-1">(Optional)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Textarea
                                                {...field}
                                                rows={4}
                                                placeholder="Enter any special instructions or guidelines for your AI agent"
                                                className="pr-10"
                                            />
                                            <ListChecks className="absolute right-4 top-3.5 text-muted-foreground group-hover:text-primary transition-colors h-5 w-5" />
                                        </div>
                                    </FormControl>
                                    <FormDescription>Add any specific handling instructions, keywords, or scenarios</FormDescription>
                                    <FormMessage />
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

export default AiAgentStep;