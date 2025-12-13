'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Mail,
    Shield,
    Lock,
    KeyRound,
    ArrowRight,
    ArrowLeft,
    Eye,
    RotateCw,
    Check,
    CheckCircle,
    Loader2,
    EyeOff,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordApi, setPasswordApi, verifyOtpApi } from '@/network/Api';
import { removeToken, setToken } from '@/_utils/cookies';

// Email step validation schema
const emailSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
});

// Verification step validation schema
const verificationSchema = z.object({
    code: z.string().min(6, { message: 'Verification code must be 6 digits' }).max(6),
});

// Password step validation schema
const passwordSchema = z.object({
    password: z.string()
        .min(8, { message: 'Password must be at least 8 characters' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' })
        .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [timer, setTimer] = useState(30);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
    const router = useRouter();

    // Email form
    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: '',
        },
    });

    // Verification form
    const verificationForm = useForm<z.infer<typeof verificationSchema>>({
        resolver: zodResolver(verificationSchema),
        defaultValues: {
            code: '',
        },
    });

    // Password form
    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            console.log('Timer expired');
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, timer]);

    const handleEmailSubmit = (values: z.infer<typeof emailSchema>) => {
        console.log(values);
        setIsLoading(true);
        
        const payload = {
            "email": values?.email,
        }
        
        resetPasswordApi(payload).then((res: any) => {
            if (res) {
                setStep(2);
                setTimer(30);
                toast({
                    title: "Success",
                    description: "Password reset code sent to your email",
                    variant: "default",
                });
            }
        }).catch((err) => {
            console.log("err", err);
            toast({
                title: "Error",
                description: err?.message || "Failed to send reset code. Please try again.",
                variant: "destructive",
            });
        }).finally(() => {
            setIsLoading(false);
        });
    };

    const handleVerificationSubmit = (values: z.infer<typeof verificationSchema>) => {
        setIsLoading(true);
        
        const payload = {
            "email": emailForm.getValues('email'),
            "otp": values?.code
        }
        
        verifyOtpApi(payload).then((res) => {
            if (res?.data) {
                setStep(3);
                toast({
                    title: "Success",
                    description: "Code verified successfully",
                    variant: "default",
                });
                setToken(res?.data?.data?.token)
            }
        }).catch((err) => {
            console.log("err", err);
            toast({
                title: "Verification Failed",
                description: err?.message || "Invalid verification code. Please try again.",
                variant: "destructive",
            });
        }).finally(() => {
            setIsLoading(false);
        });
    };

    const handlePasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
        setIsLoading(true);
        
        const payload = {
            "password": values?.password
        }
        
        setPasswordApi(payload).then((res) => {
            if (res) {
                setToken(null)
                setStep(4); // Move to success step
                toast({
                    title: "Success",
                    description: "Password reset successfully!",
                    variant: "default",
                });
            }
        }).catch((err) => {
            console.log("err", err);
            toast({
                title: "Error",
                description: err?.message || "Failed to reset password. Please try again.",
                variant: "destructive",
            });
        }).finally(() => {
            setIsLoading(false);
            setToken(null)
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
            {(step === 2 || step === 3) && (
                <button
                    type="button"
                    onClick={() => setStep(step === 2 ? 1 : 2)}
                    className="absolute top-8 left-8 text-sm text-gray-500 hover:text-indigo-600 flex items-center transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span>Back to {step === 2 ? 'email' : 'verification'}</span>
                </button>
            )}
            <div className="max-w-md mx-auto">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                        <KeyRound className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Reset Password</h1>
                    <p className="text-gray-600">Enter your email to reset your password</p>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className={`w-8 h-8 ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                                <Mail className={`h-4 w-4 text-${step >= 1 ? 'white' : 'gray-400'}`} />
                            </div>
                            <div className="ml-3">
                                <p className={`text-sm font-medium ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>Email</p>
                            </div>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200">
                            <div className={`${step >= 2 ? 'w-full' : 'w-0'} h-full bg-indigo-600 rounded-full transition-all duration-300`}></div>
                        </div>
                        <div className="flex items-center">
                            <div className={`w-8 h-8 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                                <Shield className={`h-4 w-4 text-${step >= 2 ? 'white' : 'gray-400'}`} />
                            </div>
                            <div className="ml-3">
                                <p className={`text-sm font-medium ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>Verify</p>
                            </div>
                        </div>
                        <div className="flex-1 mx-4 h-1 bg-gray-200">
                            <div className={`${step >= 3 ? 'w-full' : 'w-0'} h-full bg-indigo-600 rounded-full transition-all duration-300`}></div>
                        </div>
                        <div className="flex items-center">
                            <div className={`w-8 h-8 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                                <Lock className={`h-4 w-4 text-${step >= 3 ? 'white' : 'gray-400'}`} />
                            </div>
                            <div className="ml-3">
                                <p className={`text-sm font-medium ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>New Password</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100 p-8">
                    {step === 1 && (
                        <Form {...emailForm}>
                            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
                                <FormField
                                    control={emailForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">Email Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Enter your email"
                                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                                        {...field}
                                                    />
                                                    <Mail className="h-5 w-5 absolute right-4 top-3 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full mt-4 px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center transition-colors"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            <span>Sending Code...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Reset Code</span>
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    )}

                    {step === 2 && (
                        <Form {...verificationForm}>
                            <form onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)} className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <Mail className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h2>
                                    <p className="text-sm text-gray-600">We've sent a password reset code to</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{emailForm.getValues('email')}</p>
                                </div>

                                <FormField
                                    control={verificationForm.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="flex justify-center gap-2">
                                                    {[0, 1, 2, 3, 4, 5].map((index) => (
                                                        <input
                                                            key={index}
                                                            type="text"
                                                            maxLength={1}
                                                            className="w-12 h-12 text-center text-xl rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                                            value={field.value[index] || ''}
                                                            onChange={(e) => {
                                                                const newValue = e.target.value;
                                                                const newCode = field.value.split('');
                                                                newCode[index] = newValue;
                                                                field.onChange(newCode.join(''));

                                                                // Auto-focus next input
                                                                if (newValue && index < 5) {
                                                                    const nextInput = document.querySelector(`input[name="code-${index + 1}"]`) as HTMLInputElement;
                                                                    if (nextInput) nextInput.focus();
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                // Handle backspace to go to previous input
                                                                if (e.key === 'Backspace' && !field.value[index] && index > 0) {
                                                                    const prevInput = document.querySelector(`input[name="code-${index - 1}"]`) as HTMLInputElement;
                                                                    if (prevInput) prevInput.focus();
                                                                }
                                                            }}
                                                            onPaste={(e) => {
                                                                e.preventDefault();
                                                                const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-digits
                                                                
                                                                if (pastedData.length === 6) {
                                                                    // If exactly 6 digits, fill all inputs
                                                                    field.onChange(pastedData);
                                                                    
                                                                    // Focus the last input
                                                                    setTimeout(() => {
                                                                        const lastInput = document.querySelector(`input[name="code-5"]`) as HTMLInputElement;
                                                                        if (lastInput) lastInput.focus();
                                                                    }, 0);
                                                                } else if (pastedData.length > 0) {
                                                                    // If partial paste, fill from current position
                                                                    const newCode = field.value.split('');
                                                                    const remainingSlots = 6 - index;
                                                                    const codeToPaste = pastedData.slice(0, remainingSlots);
                                                                    
                                                                    for (let i = 0; i < codeToPaste.length; i++) {
                                                                        if (index + i < 6) {
                                                                            newCode[index + i] = codeToPaste[i];
                                                                        }
                                                                    }
                                                                    
                                                                    field.onChange(newCode.join(''));
                                                                    
                                                                    // Focus appropriate next input
                                                                    const nextIndex = Math.min(index + codeToPaste.length, 5);
                                                                    setTimeout(() => {
                                                                        const nextInput = document.querySelector(`input[name="code-${nextIndex}"]`) as HTMLInputElement;
                                                                        if (nextInput) nextInput.focus();
                                                                    }, 0);
                                                                }
                                                            }}
                                                            name={`code-${index}`}
                                                        />
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-center mt-2" />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-4">
                                    <Button
                                        type="submit"
                                        className="w-full px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center transition-colors"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                <span>Verifying...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Verify Code</span>
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </>
                                        )}
                                    </Button>                                    
                                </div>

                                {timer > 0 && (
                                    <div className="mt-6 text-center">
                                        <p className="text-sm text-gray-600">Code expires in: <span className="text-indigo-600 font-medium">{formatTime(timer)}</span></p>
                                    </div>
                                )}
                            </form>
                        </Form>
                    )}

                    {step === 3 && (
                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">Set new password</h2>
                                    <p className="text-gray-600 mt-2">Choose a strong password for your account</p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                                        className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
                                    >
                                        <span>Password Requirements</span>
                                        {showPasswordRequirements ?
                                            <ChevronUp className="h-4 w-4 text-gray-500" /> :
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        }
                                    </button>

                                    {showPasswordRequirements && (
                                        <ul className="space-y-2 mt-3">
                                            <li className="flex items-center text-sm text-gray-600">
                                                <Check className="h-4 w-4 text-green-500 mr-2" />
                                                At least 8 characters
                                            </li>
                                            <li className="flex items-center text-sm text-gray-600">
                                                <Check className="h-4 w-4 text-green-500 mr-2" />
                                                Mix of uppercase & lowercase letters
                                            </li>
                                            <li className="flex items-center text-sm text-gray-600">
                                                <Check className="h-4 w-4 text-green-500 mr-2" />
                                                At least one number
                                            </li>
                                            <li className="flex items-center text-sm text-gray-600">
                                                <Check className="h-4 w-4 text-green-500 mr-2" />
                                                At least one special character
                                            </li>
                                        </ul>
                                    )}
                                </div>

                                <FormField
                                    control={passwordForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter your new password"
                                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                                        {...field}
                                                    />
                                                    {showPassword ? (
                                                        <EyeOff
                                                            className="h-5 w-5 absolute right-4 top-3 text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                                                            onClick={() => setShowPassword(false)}
                                                        />
                                                    ) : (
                                                        <Eye
                                                            className="h-5 w-5 absolute right-4 top-3 text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                                                            onClick={() => setShowPassword(true)}
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">Confirm New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Confirm your new password"
                                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                                        {...field}
                                                    />
                                                    {showConfirmPassword ? (
                                                        <EyeOff
                                                            className="h-5 w-5 absolute right-4 top-3 text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                                                            onClick={() => setShowConfirmPassword(false)}
                                                        />
                                                    ) : (
                                                        <Eye
                                                            className="h-5 w-5 absolute right-4 top-3 text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                                                            onClick={() => setShowConfirmPassword(true)}
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center transition-colors"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            <span>Resetting Password...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            <span>Reset Password</span>
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    )}

                    {step === 4 && (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            
                            <div className="space-y-3">
                                <h2 className="text-2xl font-bold text-gray-900">Password Reset Successful!</h2>
                                <p className="text-gray-600 text-lg">
                                    Your password has been successfully updated.
                                </p>
                                <p className="text-gray-500">
                                    You can now sign in with your new password.
                                </p>
                            </div>

                            <div className="pt-6">
                                <Button
                                    onClick={() => {
                                        removeToken()
                                        setTimeout(() => {
                                            router.push('/login')
                                        }, 1000)
                                    }}
                                    className="w-full px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center transition-colors text-lg"
                                >
                                    <span>Go to Login</span>
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                            </div>

                            <div className="pt-4">
                                <p className="text-sm text-gray-500">
                                    You will be automatically redirected to the login page in a few seconds.
                                </p>
                            </div>
                        </div>
                    )}

                    {step !== 3 && step !== 4 && (
                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Remember your password?
                                <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium ml-1">
                                    Back to Login
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 