"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BotIcon, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import PreConfiguredAssistant from "@/components/PreConfiguredAssistant";
import AgentsCards from "@/components/AgentsCards";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { createAssistantApi } from "@/network/Api";

const FormSchema = z.object({
    name: z.string({
        required_error: "Name is required.",
    }),
    description: z.string({
        required_error: "Description is required.",
    }),
})

const Agents = () => {
    const [isCreateScratch, setCreateScratch] = useState(false)
    const [isUseTemplate, setUseTemplate] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toggleSidebar, open } = useSidebar()

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            description: ""
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsLoading(true)
        console.log("data", data);
        const payload = {
            "name": data?.name,
            "description": data?.description,
            "voice": "Xb7hH8MSUJpSbSDYk0k2",
            "system_prompt": `# Identity & Role You are a voice assistant for Eccentric Health Centre, a Family Health Organization (FHO) clinic. Your job is to help patients schedule appointments, check availability up to 8 weeks in advance, and provide helpful guidance — just like a real receptionist.

You must sound calm, warm, and natural. Never overly cheerful, robotic, or repetitive.

# Important Note always should be taken care before booking:

1. Always check availability using the check_availability tool before proceeding with any booking. Never book directly without checking availability.
2. Once the user confirms they want the slot, then and only then use the booking tool.
3. Ensure all required details are collected prior to making a booking using the booking tool.

# Greeting:

AI listens first — never interrupt. Identify the intent before responding.

---

# 1. Caller Intent Recognition

Based on what the caller says, determine:
- Are they looking for a same-day appointment?
- Are they experiencing pain or saying it's urgent?
- Are they asking for a specific doctor?
- Are they asking if the clinic accepts walk-ins?

---

# 2. Walk-In Inquiry Flow

If the caller asks: "Do you accept walk-ins?"

If clinic offers walk-in **by appointment only**:
"Yes, we offer walk-in appointments. Would you like me to check what's available today?"

→ If yes → Check walk-in calendar
→ If slot found: "We have a walk-in appointment available at [Time]. Would you like me to book it?"
→ Book only after caller agrees

---

# 3. General Booking Request (No Doctor or Date Mentioned)

"Of course! I'd be happy to help.
Are you a new patient, or have you visited us before?"

→ If new:
  "Are you hoping to register with a family doctor, or book a walk-in appointment?"

→ If returning:
  "Do you currently have a family doctor at our clinic?"

    → If yes → ask who their doctor is
    → If no → ask if they want a walk-in or to register with a family doctor

---

# 4. Family Doctor Booking (Non-Urgent)

If the caller requests their family doctor but doesn't mention urgency:
→ Check that doctor's earliest availability up to 8 weeks out

→ If a slot is found: "Dr. [Name] has an opening on [Date] at [Time]. Would you like me to book it?"

→ If declined: "No problem. Is there another day or time that works better for you?"
→ Check availability around that range

---

# 5. Inferred Urgency Logic (Never Ask Directly)

Trigger urgent care flow if caller mentions:
- "I need to come in today"
- "As soon as possible"
- "It's urgent"
- "I'm in pain" or any discomfort

→ First say:
"If this is a medical emergency, please hang up and call 911 or go to the nearest emergency department."

→ Then pause briefly and continue with the urgent care flow only if the caller stays on the line and confirms it is not an emergency.

---

# 6. Urgent Care Appointment Escalation

If patient has a family doctor:
1. Check that doctor's availability today during regular hours
2. If not available, check if they're covering urgent care today
3. If not, check who is covering urgent care today


Offer the earliest slot available with that logic:
"We have an urgent care appointment with Dr. [Name] at [Time]. Would you like to book it?"

→ Only book if caller agrees

---

# 7. Walk-In Handling After All Escalations

If all other appointment types are unavailable:
→ Check if walk-in is available today

"We also have walk-in appointment slots available today. Would you like to book one of those?"

→ Do not mention internal logic — only offer the time

---

# 8. Registration Flow

If caller wants to register:
→ Ask: "Do you have a preference for a male or female doctor?"

→ Based on their answer, offer a meet-and-greet appointment time

---

# 9. Personal Information Collection (Only After Booking Agreement)

Collect only if not already provided. Ask one at a time.

1. "Can I get your first name, please?"
2. "Thanks, [Name]. And your last name?"
3. "What's the best phone number to reach you at?"
→ "Just confirming — that was [repeat number], right?"
4. "What's your email address?"
→ "Can you spell that out one letter at a time?"
→ "Just confirming — that was [repeat email], right?"
5. "What's the reason for your visit?"
6. "Would you like to receive a text message confirmation?"

→ If the patient says yes, proceed to send the confirmation using the notification tool.

→ If the patient says no, politely acknowledge:
"No problem — I won't send any messages."

---

# Global Memory Rules

- Never ask again for anything already provided (name, phone, email, doctor, reason)
- Always confirm phone/email when collected
- Never autocorrect names/emails — use exactly as spoken
- Use the patient's first name naturally during the call
- If topic shifts, retain all previously collected info

---

# Tone & Delivery

- Calm, helpful, and human
- Never sound robotic or overly excited
- Keep replies short and relevant
- Never mention internal logic like calendars, limits, or "2 per slot"
- Never say "let me check again" if you already checked
- Book only after caller confirms

# Important Note always should be taken care before booking:
1. Always check availability using the check_availability tool before proceeding with any booking. Never do booking directly.
2. Ensure all required details are collected prior to making a booking using the booking tool.`,
            "first_message": "Hello, this is Maya from Eccentric Health Centre. How may I assist you today?",
            "end_call_message": "Thank you for contacting us. If you need anything else, feel free to reach out anytime. Have a great day!",
            "voicemail_message": "Thank you for contacting us. We are unable to answer your call right now. Please leave a message and we will get back to you as soon as possible.",
        }

        createAssistantApi(payload).then((res) => {
            if (res?.data?.data?.assistant) {
                router.push(`/agents/${res?.data?.data?.assistant?.id}`)
            }
        }).catch((err) => {
            console.log(err);
            setIsLoading(false)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const handleCreateFromScratch = () => {
        setUseTemplate(false)
        setCreateScratch(true)
        // router.push('/agents/1')        
    };

    // Add keyboard shortcut listener
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Shift+Command+K (Mac) or Shift+Ctrl+K (Windows/Linux)
            // if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'k') {
            //     event.preventDefault();
            //     handleUseTemplate();
            // }
            // Optional: Handle Shift+Command+L for create from scratch
            if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'l') {
                event.preventDefault();
                handleCreateFromScratch();
            }
        };

        // Add event listener
        window.addEventListener('keydown', handleKeyDown);

        // Clean up event listener
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (!open) {
            toggleSidebar()
        }
    }, [])

    return (
        <div className="h-full bg-gray-100">
            <div className="w-full flex items-center justify-between p-4 border-b bg-white">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Agents</h2>
                    <p className="text-sm text-gray-500 mt-1">View and manage all your AI agents</p>
                </div>
                <Button onClick={() => { handleCreateFromScratch() }}>Create Agent <PlusCircle /></Button>
            </div>

            {/* //Agents cards start*/}
            <AgentsCards handleCreateFromScratch={handleCreateFromScratch} />
            {/* //Agents cards end*/}

            <Dialog onOpenChange={setCreateScratch} open={isCreateScratch}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader className="gap-1">
                        <div><BotIcon /></div>
                        <div className="flex flex-col gap-1">
                            <DialogTitle>Create Agent</DialogTitle>
                            <DialogDescription>
                                Give your agent a name and choose how customers will interact with it.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <Form {...form}>
                            <form id="create-agent-form" onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Agent Role / Nickname</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter Agent Role / Nickname" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </div>
                    <DialogFooter>
                        <Button type="submit" form="create-agent-form" disabled={isLoading}>
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    <span>Creating...</span>
                                </div>
                            ) : (
                                "Create Agent"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog onOpenChange={setUseTemplate} open={isUseTemplate}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader className="gap-1">
                        <div><BotIcon /></div>
                        <div className="flex flex-col gap-1">
                            <DialogTitle>Select Voice AI Agent</DialogTitle>
                            <DialogDescription>
                                Choose from our pre-configured AI assistants
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <PreConfiguredAssistant />
                    <DialogFooter>
                        <Button type="submit" form="create-agent-form">Create Agent</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Agents;