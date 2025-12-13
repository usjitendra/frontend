'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Bot, Loader2, PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { getActionsApi } from '@/network/Api'

export const formSchema = z.object({
  name: z.string().min(2, { message: "Assistant name must be at least 2 characters" }),
  description: z.string().optional(),
  systemPrompt: z.string().min(10, { message: "System prompt must be at least 10 characters" }),
  firstMessage: z.string().min(5, { message: "First message must be at least 5 characters" }),
  endCallMessage: z.string().min(5, { message: "End call message must be at least 5 characters" }),
  voicemailEnabled: z.boolean().default(false),
  voicemailMessage: z.string().optional(),
  actions: z.array(z.string()).optional()
})

export type AgentFormValues = z.infer<typeof formSchema>

interface AgentFormProps {
  initialValues?: Partial<AgentFormValues>
  onSubmit: (values: AgentFormValues) => Promise<void>
  isSubmitting?: boolean
  title?: string
  description?: string
}

const AgentForm = ({
  initialValues = {},
  onSubmit,
  isSubmitting = false,
  title = "Create New Assistant",
  description = "Configure your AI voice agent"
}: AgentFormProps) => {
  const router = useRouter()
  const [actions, setActions] = useState<{id: string, name: string}[]>([])

  const getActions =  () => {
    getActionsApi().then((res:any)=>{
      if(res.data){
        setActions(res.data?.data?.actions)
      }
    }).catch((err:any)=>{
      console.log(err)
    })
  }
  
  useEffect(()=>{
    getActions()
  },[])

  // Initialize form with proper default values
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
      firstMessage: "",
      endCallMessage: "",
      voicemailEnabled: initialValues.voicemailEnabled || false,
      voicemailMessage: initialValues.voicemailMessage || "",
      actions: initialValues.actions || [],
      ...initialValues
    }
  })

  // Get the current value of voicemailEnabled from the form
  const voicemailEnabled = form.watch("voicemailEnabled")

  // Sync voicemailEnabled with voicemailMessage on initial load
  useEffect(() => {
    if (initialValues.voicemailMessage && !initialValues.voicemailEnabled) {
      form.setValue('voicemailEnabled', true);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values: AgentFormValues) => {
    // If voicemail is disabled, clear the voicemail message
    if (!values.voicemailEnabled) {
      values.voicemailMessage = "";
    }
    await onSubmit(values);
  }

  return (
    <div className="flex flex-col">
      <div className="bg-white shadow-sm px-8 py-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/agents')} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Assistant"
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-100">
        <div className="max-w-4xl mx-auto p-8 pb-16">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <Card>
                <CardHeader className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Assistant Name" 
                                className="text-xl font-bold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 w-full placeholder-gray-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what this assistant does..." 
                              className="bg-gray-50 border-0 rounded-xl resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Messages Configuration</h3>
                    
                    <FormField
                      control={form.control}
                      name="systemPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Prompt</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Define the assistant's behavior and context..." 
                              className="bg-gray-50 border-0 rounded-xl resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="firstMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Initial greeting message..." 
                              className="bg-gray-50 border-0 rounded-xl resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endCallMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Call Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Message to say before ending the call..." 
                              className="bg-gray-50 border-0 rounded-xl resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
                    <FormField
                      control={form.control}
                      name="actions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select an Action</FormLabel>
                          <FormControl>
                            {actions.length > 0 ? (
                              <Select 
                                onValueChange={(value) => field.onChange([value])} 
                                defaultValue={field.value?.[0]}
                              >
                                <SelectTrigger className="bg-gray-50 border-0 rounded-xl">
                                  <SelectValue placeholder="Select an action" />
                                </SelectTrigger>
                                <SelectContent>
                                  {actions.map((action:any) => (
                                    <SelectItem key={action.id} value={action.id}>
                                      {action.function?.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                                <div className="text-center">
                                  <p className="text-sm text-gray-500 mb-2">No actions available</p>
                                  <Link href="/action">
                                    <Button variant="outline" size="sm">
                                      <PlusCircle className="h-4 w-4 mr-2" />
                                      Create an Action
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Voicemail Settings</h3>
                        <p className="text-sm text-gray-500">Configure how the assistant handles missed calls</p>
                      </div>
                      <FormField
                        control={form.control}
                        name="voicemailEnabled"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {voicemailEnabled && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <FormField
                          control={form.control}
                          name="voicemailMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Voicemail Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Message to play when leaving a voicemail..." 
                                  className="bg-white border-0 rounded-xl resize-none"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default AgentForm 