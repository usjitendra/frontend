import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRightIcon, MailIcon, PhoneIcon, UserIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { onboardingApi } from "@/network/Api";
import { useState } from "react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'

// Step 1: Personal Information
const personalInfoSchema = z.object({
    firstName: z.string().min(2, {
        message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
        message: "Last name must be at least 2 characters.",
    }),
    // email: z.string().email({
    //     message: "Please enter a valid email address.",
    // }),
    phoneNumber: z.string().min(10, {
        message: "Phone number must be at least 10 digits.",
    }),
});

const BasicInfoStep1: React.FC<any> = ({ setStep }) => {
    const [isLoading, setIsLoading] = useState(false);
    const personalForm = useForm<z.infer<typeof personalInfoSchema>>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            // email: "test@gmail.com",
            phoneNumber: "",
        }
    });

    const handleSubmit = (values: z.infer<typeof personalInfoSchema>) => {
        setIsLoading(true);
        const payload = {
            "user_information": {
                "first_name": values.firstName,
                "last_name": values.lastName,
                // "email": values.email,
                "phone_number": values.phoneNumber
            },
            "complete_onboarding": false
        }
        onboardingApi(payload).then((res) => {
            if (res?.data) {
                setStep(2)
            }
        }).catch((err) => {
            console.log("err", err);
        }).finally(() => {
            setIsLoading(false);
        });     
    };

    return (
        <div>
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                    <UserIcon className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Tell us about yourself</h1>
                <div className="flex items-center justify-center gap-3 mt-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></div>
                    <p className="text-gray-600">Step 1 of 3</p>
                </div>
            </div>
            <Form {...personalForm}>
                <form onSubmit={personalForm.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="flex gap-4">
                        <FormField
                            control={personalForm.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="Enter your first name" {...field} />
                                            <UserIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={personalForm.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="Enter your last name" {...field} />
                                            <UserIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* <FormField
                        control={personalForm.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input disabled {...field} className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                                        <MailIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    This email is associated with your account
                                </FormDescription>
                            </FormItem>
                        )}
                    /> */}

                    <FormField
                        control={personalForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <PhoneInput
                                            international
                                            defaultCountry="CA"                                        
                                            placeholder="Enter phone number"
                                            value={field.value}
                                            onChange={field.onChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                                            inputclassname="w-full border-0 bg-transparent p-0 outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                            countries={["US", "CA"]}
                                            maxLength={15}
                                        />
                                        <PhoneIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-between mt-10">
                        <Button variant="outline" type="button" className="group" disabled>
                            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                            Back
                        </Button>
                        <Button type="submit" className="group" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Next Step
                                    <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:transform group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default BasicInfoStep1;