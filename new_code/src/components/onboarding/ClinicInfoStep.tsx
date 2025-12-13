import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { BuildingIcon, MapPinIcon, MapIcon, UserIcon, HospitalIcon, ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import { onboardingApi } from "@/network/Api";

const clinicInfoSchema = z.object({
    clinicName: z.string().min(2, {
        message: "Business name must be at least 2 characters.",
    }),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
    }),
    services: z.array(z.string()).optional(),
});

const serviceOptions = [
    {
        id: "general-consultation",
        label: "General Consultation",
        description: "Regular checkups & diagnostics",
    },
    {
        id: "specialized-care",
        label: "Specialized Care",
        description: "Specific medical treatments",
    },
    {
        id: "emergency-services",
        label: "Emergency Services",
        description: "24/7 emergency care",
    },
    {
        id: "lab-services",
        label: "Lab Services",
        description: "Tests & diagnostics",
    },
];

const ClinicInfoStep: React.FC<any> = ({ setStep }) => {
    const form = useForm<z.infer<typeof clinicInfoSchema>>({
        resolver: zodResolver(clinicInfoSchema),
        defaultValues: {
            clinicName: "",
            address: {
                street: "",
                city: "",
                postalCode: "",
            },
            services: [],
        },
    });

    const onSubmit = (values: z.infer<typeof clinicInfoSchema>) => {
        console.log(values);
        const payload = {
            "clinic_information": {
                "name": values.clinicName,
                "address": {
                    "street": values.address.street || "",
                    "city": values.address.city || "",
                    "postal_code": values.address.postalCode || ""
                },
                "services": values.services || []
            },
            "complete_onboarding": false
        }
        onboardingApi(payload).then((res) => {
            if (res?.data) {
                setStep(3);
            }
        }).catch((err) => {
            console.log("err", err);
        })
    };

    const handleBack = () => {
        setStep(1);
    };

    return (
        <div className="space-y-6">
            <div id="header-section" className="text-center mb-12">
                <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                    <HospitalIcon className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Tell us about your Business</h1>
                <div className="flex items-center justify-center gap-3 mt-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></div>
                    <p className="text-gray-600">Step 2 of 3</p>
                </div>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div id="clinic-name-section">
                        <FormField
                            control={form.control}
                            name="clinicName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="Enter your business name" {...field} />
                                            <BuildingIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div id="address-section" className="space-y-4">
                        <FormLabel>Business Address (Optional)</FormLabel>
                        <FormField
                            control={form.control}
                            name="address.street"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="Street Address" {...field} />
                                            <MapPinIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="address.city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="City" {...field} />
                                                <BuildingIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address.postalCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="Postal Code" {...field} />
                                                <MapIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div id="services-section">
                        <FormLabel className="block mb-4">Services Offered</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                            {serviceOptions.map((service) => (
                                <FormField
                                    key={service.id}
                                    control={form.control}
                                    name="services"
                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={service.id}
                                                className="flex p-4 space-x-3 space-y-0 border border-gray-200 rounded-lg hover:border-primary cursor-pointer transition-colors"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(service.id)}
                                                        onCheckedChange={(checked) => {
                                                            const updatedValue = checked
                                                                ? [...(field.value || []), service.id]
                                                                : (field.value || []).filter(
                                                                    (value) => value !== service.id
                                                                );
                                                            field.onChange(updatedValue);
                                                        }}
                                                        id={`service-${service.id}`}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel
                                                        className="text-sm font-medium"
                                                        htmlFor={`service-${service.id}`}
                                                    >
                                                        {service.label}
                                                    </FormLabel>
                                                    <p className="text-xs text-gray-500">
                                                        {service.description}
                                                    </p>
                                                </div>
                                            </FormItem>
                                        );
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between mt-10">
                        <Button
                            variant="outline"
                            type="button"
                            className="group"
                            onClick={handleBack}
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                            Back
                        </Button>
                        <Button type="submit" className="group">
                            Next Step
                            <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:transform group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ClinicInfoStep;