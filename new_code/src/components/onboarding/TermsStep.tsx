import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    CheckCircle,
    Check,
    ArrowLeft,
    Rocket
} from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getIsVerified, setIsOnboardingDone } from "@/_utils/cookies";
import { useRouter } from "next/navigation";

// Define schema for form validation
const termsSchema = z.object({
    termsAccepted: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions",
    }),
    notificationsAccepted: z.boolean().refine(val => val === true, {
        message: "You must accept notifications",
    }),
});

type TermsFormValues = z.infer<typeof termsSchema>;

const TermsStep: React.FC<{ setStep: (step: number) => void }> = ({ setStep }) => {
    const router = useRouter()
    const isVerified: any = getIsVerified()
    const form = useForm<TermsFormValues>({
        resolver: zodResolver(termsSchema),
        defaultValues: {
            termsAccepted: false,
            notificationsAccepted: false,
        }
    });

    const onSubmit = (values: TermsFormValues) => {
        console.log(values);
        // Handle form submission - complete setup
        setIsOnboardingDone("true")
        if(isVerified == "true"){
            router.push("/")
        }else{
            router.push("/verification-pending")
        }
    };

    return (
        <div className="py-6 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                        <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Almost Done!</h1>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></div>
                        <p className="text-gray-600">Step 3 of 3</p>
                    </div>
                </div>

                <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Summary</h3>
                    <div className="space-y-3">
                        <div className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-3" />
                            <span className="text-gray-600">Basic Information Completed</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-3" />
                            <span className="text-gray-600">Business Details Configured</span>
                        </div>
                        {/* <div className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-3" />
                            <span className="text-gray-600">AI Agent Settings Personalized</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-3" />
                            <span className="text-gray-600">Call Handling Preferences Set</span>
                        </div> */}
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="termsAccepted"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            id="terms"
                                            className="mt-1"
                                        />
                                    </FormControl>
                                    <FormLabel htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                                        I acknowledge that I have read and agree to the <span className="text-indigo-600 hover:text-indigo-700 underline cursor-pointer">Terms of Service</span> and <span className="text-indigo-600 hover:text-indigo-700 underline cursor-pointer">Privacy Policy</span>.
                                    </FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notificationsAccepted"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            id="notifications"
                                            className="mt-1"
                                        />
                                    </FormControl>
                                    <FormLabel htmlFor="notifications" className="text-sm text-gray-600 cursor-pointer">
                                        I consent to receive important updates and notifications about my AI agent's performance and business operations.
                                    </FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between mt-10">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="group" 
                                onClick={() => { setStep(5) }}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="group"
                                disabled={!form.formState.isValid}
                            >
                                Complete Setup
                                <Rocket className="ml-2 h-4 w-4 group-hover:transform group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default TermsStep;