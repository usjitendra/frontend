"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Key,
  Save,
  Loader2,
  PhoneIcon,
  Eye,
  EyeOff,
  User,
  Shield,
  Mail,
  Settings,
  Server,
  Lock,
  TestTube,
} from "lucide-react";
import { useSelector } from "react-redux";
import ChangePassword from "@/components/ChangePassword";
import {
  getSMTPListApi,
  profileUpdate,
  updateSMTPApi,
  uploadUserProfilePictureApi,
} from "@/network/Api";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast } from "@/hooks/use-toast";
import { eachMonthOfInterval } from "date-fns";

const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  user_phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .default(""),
  company_name: z.string().optional(),
  // Address fields को separate रखें
  street: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

const smtpFormSchema = z
  .object({
    smtpHost: z.string().min(1, { message: "SMTP host is required." }),
    smtpPort: z.string().min(1, { message: "SMTP port is required." }),
    smtpUsername: z.string().min(1, { message: "SMTP username is required." }),
    smtpPassword: z.string().min(1, { message: "SMTP password is required." }),
    smtpConfirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
    smtpFromEmail: z
      .string()
      .email({ message: "Please enter a valid email address." }),
    smtpFromName: z.string().min(1, { message: "From name is required." }),
    smtpEnabled: z.boolean().default(false),
  })
  .refine((data) => data.smtpPassword === data.smtpConfirmPassword, {
    message: "Passwords don't match",
    path: ["smtpConfirmPassword"],
  });

const SettingsPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [viewPhotoDialogOpen, setViewPhotoDialogOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const userProfileData = useSelector(
    (state: any) => state?.account?.profileData
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      user_phone: "",
      company_name: "",
      street: "",
      city: "",
      postal_code: "",
      country: "",
    },
    mode: "onChange",
  });

  const smtpForm = useForm<z.infer<typeof smtpFormSchema>>({
    resolver: zodResolver(smtpFormSchema),
    defaultValues: {
      smtpHost: "",
      smtpPort: "587",
      smtpUsername: "",
      // smtpEncryption: "tls",
      smtpPassword: "",
      smtpConfirmPassword: "",
      smtpFromEmail: "",
      smtpFromName: "",
      smtpEnabled: false,
    },
    mode: "onChange",
  });

  console.log("userProfileData", userProfileData);

  useEffect(() => {
    if (userProfileData) {
      const address = userProfileData?.company?.address || {};
      const fullAddress = [
        address.street,
        address.city,
        address.postal_code,
        address.country,
      ]
        .filter(Boolean) // undefined & empty hata deta hai
        .join(", "); // clean string banata hai

      const formData = {
        firstName: userProfileData.first_name || "",
        lastName: userProfileData.last_name || "",
        email: userProfileData.email || "",
        user_phone: userProfileData.user_phone || "",
        company_name: userProfileData?.company?.company_name || "",
        // Address: fullAddress || "",
        street: address.street || "",
        city: address.city || "",
        postal_code: address.postal_code || "",
        country: address.country || "",
      };

      form.reset(formData);
      setIsDataLoaded(true);

      if (userProfileData.profile_picture && !previewImage) {
        setPreviewImage(
          process.env.NEXT_PUBLIC_IMAGE_URL + userProfileData.profile_picture
        );
      }
    } else {
      setIsDataLoaded(true);
    }
  }, [userProfileData, previewImage, form]);

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    try {
      setIsSubmitting(true);

      const PayLoad = {
        first_name: values.firstName,
        last_name: values.lastName,
        user_phone: values.user_phone,
        company_name: values.company_name,
        company_address: {
          street: values.street || "",
          city: values.city || "",
          postal_code: values.postal_code || "",
          country: values.country || "",
        },
      };
      const result = await profileUpdate(PayLoad);
      toast({
        title: "Success",
        description: result?.data?.message,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const fetchSMTPSettings = async () => {
    getSMTPListApi()
      .then((res: any) => {
        if (res.data) {
          console.log(res.data?.data);

          smtpForm.reset({
            smtpHost: res.data?.data?.smtp_host,
            smtpPort: res.data?.data?.smtp_port.toString(),
            smtpUsername: res.data?.data?.smtp_user,
            smtpPassword: res.data?.data?.smtp_pass,
            smtpConfirmPassword: res.data?.data?.smtp_pass,
            smtpFromName: res.data?.data?.sender_name,
            smtpFromEmail: res.data?.data?.sender_email,
            smtpEnabled: res.data?.data?.is_enabled,
          });
        }
      })
      .catch((err: any) => {
        console.log("Error fetching SMTP settings:", err);
      });
  };

  function onSmtpSubmit(values: z.infer<typeof smtpFormSchema>) {
    console.log("values", values);

    setIsSubmitting(true);
    const payload = {
      smtp_host: values.smtpHost,
      smtp_port: parseInt(values.smtpPort),
      smtp_user: values.smtpUsername,
      smtp_pass: values.smtpPassword,
      sender_name: values.smtpFromName,
      sender_email: values.smtpFromEmail,
      is_enabled: values.smtpEnabled,
    };
    updateSMTPApi(payload)
      .then((res: any) => {
        if (res.status) {
          toast({
            title: "SMTP Settings updated successfully",
            description: "SMTP Settings updated successfully",
          });
          setIsSubmitting(false);
        }
      })
      .catch((err: any) => {
        toast({
          title: "Error updating SMTP settings",
          description: "Error updating SMTP settings",
        });
        setIsSubmitting(false);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  const testSmtpConnection = async () => {
    setSmtpTesting(true);
    // Add your SMTP test logic here
    setTimeout(() => {
      setSmtpTesting(false);
      // Show success/error message
    }, 3000);
  };

  const getInitials = () => {
    const firstName = form.getValues().firstName || "";
    const lastName = form.getValues().lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handlePhotoChange = () => {
    fileInputRef.current?.click();
  };

  const handleViewPhoto = () => {
    setViewPhotoDialogOpen(true);
  };

  const getCurrentProfileImage = () => {
    if (previewImage) return previewImage;
    if (userProfileData?.profile_picture) {
      return (
        process.env.NEXT_PUBLIC_IMAGE_URL + userProfileData.profile_picture
      );
    }
    if (userProfileData?.avatar) return userProfileData.avatar;
    return null;
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const res = await uploadUserProfilePictureApi(formData);
      console.log("File uploaded successfully", res);
    } catch (error) {
      console.log("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchSMTPSettings();
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Settings
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
            <Button
              className="gap-2"
              onClick={
                activeTab === "profile"
                  ? form.handleSubmit(onSubmit)
                  : smtpForm.handleSubmit(onSmtpSubmit)
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Custom Tab Navigation */}
              <div className="mb-6">
                <div className="border-b border-gray-200 bg-white rounded-t-lg">
                  <nav className="flex space-x-6 px-4" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`${
                        activeTab === "profile"
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 rounded-t-lg`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          activeTab === "profile"
                            ? "bg-blue-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <User
                          className={`h-3.5 w-3.5 ${
                            activeTab === "profile"
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("security")}
                      className={`${
                        activeTab === "security"
                          ? "border-green-500 text-green-600 bg-green-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 rounded-t-lg`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          activeTab === "security"
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <Shield
                          className={`h-3.5 w-3.5 ${
                            activeTab === "security"
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                      <span>Security</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("smtp")}
                      className={`${
                        activeTab === "smtp"
                          ? "border-purple-500 text-purple-600 bg-purple-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 rounded-t-lg`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          activeTab === "smtp" ? "bg-purple-100" : "bg-gray-100"
                        }`}
                      >
                        <Mail
                          className={`h-3.5 w-3.5 ${
                            activeTab === "smtp"
                              ? "text-purple-600"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                      <span>SMTP</span>
                    </button>
                  </nav>
                </div>
              </div>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6 mt-0">
                <Card className="shadow-lg border-0 bg-white rounded-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and profile picture
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-start gap-8">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          {previewImage ? (
                            <Image
                              src={previewImage}
                              alt="Profile"
                              width={96}
                              height={96}
                              className="rounded-full border-2 border-slate-200 object-cover w-24 h-24"
                            />
                          ) : userProfileData?.avatar ? (
                            <Image
                              src={userProfileData.avatar}
                              alt="Profile"
                              width={96}
                              height={96}
                              className="rounded-full border-2 border-slate-200 object-cover w-24 h-24"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl border-2 border-slate-200">
                              {getInitials()}
                            </div>
                          )}
                          <Button
                            size="icon"
                            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full"
                            variant="default"
                            onClick={handlePhotoChange}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Camera className="text-xs" />
                            )}
                          </Button>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                          {getCurrentProfileImage() && (
                            <Button
                              variant="link"
                              className="h-auto p-0 text-sm justify-start"
                              onClick={handleViewPhoto}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View photo
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          {isDataLoaded ? (
                            <span className="font-semibold text-lg">
                              {form.getValues().firstName || ""}{" "}
                              {form.getValues().lastName || ""}
                            </span>
                          ) : (
                            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
                          )}
                          {isDataLoaded &&
                            typeof userProfileData?.verified === "boolean" && (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  userProfileData.verified
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                }`}
                              >
                                {userProfileData.verified
                                  ? "Verified"
                                  : "Unverified"}
                              </span>
                            )}
                        </div>
                        {isDataLoaded ? (
                          <Form {...form}>
                            <form
                              onSubmit={form.handleSubmit(onSubmit)}
                              className="space-y-6"
                            >
                              {/* Basic Info Grid - 2 columns */}
                              <div className="grid grid-cols-2 gap-6">
                                <FormField
                                  control={form.control}
                                  name="firstName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>First name</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          value={field.value || ""}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="lastName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Last name</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          value={field.value || ""}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Email */}
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email address</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        value={field.value || ""}
                                        disabled
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Company Name */}
                              <FormField
                                control={form.control}
                                name="company_name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Company name</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        value={field.value || ""}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />

                              {/* ADDRESS SECTION - Always in separate fields */}
                              <div className="space-y-3">
                                <FormLabel className="text-base font-semibold">
                                  Address
                                </FormLabel>

                                {/* Street - Full width */}
                                <FormField
                                  control={form.control}
                                  name="street"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Street</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          value={field.value || ""}
                                          placeholder="Enter street address"
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />

                                {/* City, Postal Code, Country - 3 columns grid */}
                                <div className="grid grid-cols-3 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            value={field.value || ""}
                                            placeholder="Enter city"
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="postal_code"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Postal Code</FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            value={field.value || ""}
                                            placeholder="Enter postal code"
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            value={field.value || ""}
                                            placeholder="Enter country"
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>

                              {/* Phone Number */}
                              <FormField
                                control={form.control}
                                name="user_phone"
                                render={({
                                  field: { value, onChange, ...field },
                                }) => (
                                  <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <PhoneInput
                                          {...field}
                                          international
                                          defaultCountry="CA"
                                          placeholder="Enter phone number"
                                          value={value || ""}
                                          onChange={(phoneValue) =>
                                            onChange(phoneValue || "")
                                          }
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
                            </form>
                          </Form>
                        ) : (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                                <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                              </div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                                <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                              <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                              <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                              <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6 mt-0">
                <Card className="shadow-lg border-0 bg-white rounded-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your password and security preferences
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Key className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-900">
                            Password
                          </h3>
                          {userProfileData?.password_changed_at ? (
                            <p className="text-xs text-slate-600">
                              Last changed{" "}
                              {new Date(
                                userProfileData.password_changed_at
                              ).toLocaleString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 italic">
                              No password change record
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => setPasswordDialogOpen(true)}
                        className="gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Change Password
                      </Button>
                    </div>

                    {/* Additional Security Options */}
                    {/* <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <Shield className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-slate-900">Two-Factor Authentication</h3>
                                                        <p className="text-xs text-slate-600">Add an extra layer of security to your account</p>
                                                    </div>
                                                </div>
                                                <Switch defaultChecked={false} />
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                        <Mail className="h-5 w-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-slate-900">Email Notifications</h3>
                                                        <p className="text-xs text-slate-600">Receive security alerts and login notifications</p>
                                                    </div>
                                                </div>
                                                <Switch defaultChecked={true} />
                                            </div>
                                        </div> */}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SMTP Tab */}
              <TabsContent value="smtp" className="space-y-6 mt-0">
                <Card className="shadow-lg border-0 bg-white rounded-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Server className="h-5 w-5" />
                          SMTP Configuration
                        </CardTitle>
                        <CardDescription>
                          Configure your email server settings for outgoing
                          emails
                        </CardDescription>
                      </div>
                      {/* <Button
                                                type="button"
                                                variant="outline"
                                                onClick={testSmtpConnection}
                                                disabled={!smtpForm.watch('smtpEnabled') || smtpTesting}
                                                className="gap-2"
                                            >
                                                {smtpTesting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <TestTube className="h-4 w-4" />
                                                )}
                                                {smtpTesting ? "Testing..." : "Test Connection"}
                                            </Button> */}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Form {...smtpForm}>
                      <form
                        onSubmit={smtpForm.handleSubmit(onSmtpSubmit)}
                        className="space-y-6"
                      >
                        {/* SMTP Enable Toggle */}
                        <FormField
                          control={smtpForm.control}
                          name="smtpEnabled"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Mail className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <FormLabel className="text-sm font-medium text-slate-900">
                                    Enable SMTP
                                  </FormLabel>
                                  <p className="text-xs text-slate-600">
                                    Enable custom SMTP server for outgoing
                                    emails
                                  </p>
                                </div>
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

                        {/* SMTP Configuration Fields */}
                        <div className="grid grid-cols-2 gap-6">
                          <FormField
                            control={smtpForm.control}
                            name="smtpHost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Host</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="smtp.gmail.com"
                                    disabled={!smtpForm.watch("smtpEnabled")}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={smtpForm.control}
                            name="smtpPort"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Port</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="587"
                                    disabled={!smtpForm.watch("smtpEnabled")}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid gap-6">
                          <FormField
                            control={smtpForm.control}
                            name="smtpUsername"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="your-email@gmail.com"
                                    disabled={!smtpForm.watch("smtpEnabled")}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* <FormField
                                                        control={smtpForm.control}
                                                        name="smtpEncryption"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Encryption</FormLabel>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                    disabled={!smtpForm.watch('smtpEnabled')}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select encryption type" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="none">None</SelectItem>
                                                                        <SelectItem value="ssl">SSL</SelectItem>
                                                                        <SelectItem value="tls">TLS</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    /> */}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <FormField
                            control={smtpForm.control}
                            name="smtpPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type={showPassword ? "text" : "password"}
                                      placeholder="••••••••"
                                      disabled={!smtpForm.watch("smtpEnabled")}
                                      className="pr-10"
                                    />
                                    <button
                                      type="button"
                                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }
                                      disabled={!smtpForm.watch("smtpEnabled")}
                                    >
                                      {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                      ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                      )}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={smtpForm.control}
                            name="smtpConfirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type={
                                        showConfirmPassword
                                          ? "text"
                                          : "password"
                                      }
                                      placeholder="••••••••"
                                      disabled={!smtpForm.watch("smtpEnabled")}
                                      className="pr-10"
                                    />
                                    <button
                                      type="button"
                                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                      onClick={() =>
                                        setShowConfirmPassword(
                                          !showConfirmPassword
                                        )
                                      }
                                      disabled={!smtpForm.watch("smtpEnabled")}
                                    >
                                      {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                      ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                      )}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <FormField
                            control={smtpForm.control}
                            name="smtpFromEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>From Email</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="noreply@yourcompany.com"
                                    disabled={!smtpForm.watch("smtpEnabled")}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={smtpForm.control}
                            name="smtpFromName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>From Name</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Your Company"
                                    disabled={!smtpForm.watch("smtpEnabled")}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <ChangePassword
        passwordDialogOpen={passwordDialogOpen}
        setPasswordDialogOpen={setPasswordDialogOpen}
      />

      {/* View Photo Dialog */}
      <Dialog open={viewPhotoDialogOpen} onOpenChange={setViewPhotoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {getCurrentProfileImage() ? (
              <Image
                src={getCurrentProfileImage()!}
                alt="Profile Photo"
                width={400}
                height={400}
                className="rounded-lg object-cover max-w-full h-auto"
              />
            ) : (
              <div className="w-64 h-64 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-4xl">
                {getInitials()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
