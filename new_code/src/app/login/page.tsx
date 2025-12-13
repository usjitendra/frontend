'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, Hospital, Mail, LogIn, Loader2 } from 'lucide-react'
import { setIsOnboardingDone, setIsSuspended, setIsVerified, setToken } from '@/_utils/cookies'
import { loginOtpApi } from '@/network/Api'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
})

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    // Handle login logic here
    setIsLoading(true)
    const payload = {
      "email": values?.email,
      "password": values?.password
    }
    loginOtpApi(payload).then((res) => {
      if (res?.data) {
        if(res?.data?.data?.status_onboarding=="completed"){
          setIsOnboardingDone("true")
          if(res?.data?.data?.status=="pending"){
            setIsVerified("false")
          }else{
            setIsVerified("true")
          }
         
        }else if(res?.data?.data?.status_onboarding=="pending"){
          setIsOnboardingDone("false")
        }else{
          setIsOnboardingDone("false")
        }

        if(res?.data?.data?.status=="suspend"){
          setIsSuspended("true")
          router.push('/suspend')
        }else{
          setIsSuspended("false")
          setToken(res?.data?.data?.token)
          router.push('/')
        }   
        // Don't redirect here as we need to handle different cases
        // The AuthProvider will handle redirects based on token and onboarding status
      }
    }).catch((err) => {
      console.log("err", err);
      toast({
        title: "Error",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const handleSignUp = () => {
    router.push('/signup')
  }

  const handleForgotPassword = () => {
    router.push('/forgot-password')
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-muted/50 to-background py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
            <Hospital className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Welcome Back</h1>
          <p className="text-muted-foreground">Login to manage your Business</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter your email"
                            type="email"
                            className="pr-10"
                            {...field}
                          />
                          <Mail className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Password</FormLabel>
                        {/* <Button variant="link" className="p-0 h-auto text-sm" type="button">
                          Forgot Password?
                        </Button> */}
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            className="pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Eye className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Don't have an account?
                <Button variant="link" className="px-1.5" onClick={handleSignUp}>Sign up</Button>
              </p>
              <p className="text-muted-foreground mt-2">
                <Button variant="link" className="px-1.5" onClick={handleForgotPassword}>Forgot Password?</Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}