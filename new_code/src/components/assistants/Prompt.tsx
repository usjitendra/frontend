"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import MDEditor, { commands } from '@uiw/react-md-editor';

const promptSchema = z.object({
  firstMessage: z.string().min(1, { message: "First message is required" }),
  systemPrompt: z.string().min(10, { message: "System prompt should be at least 10 characters" }),
  endCallMessage: z.string().min(1, { message: "End call message is required" }),
});

interface PromptProps {
  initialValues: any;
  onFormDataChange: (data: any) => void;
}

export function Prompt({ initialValues, onFormDataChange }: PromptProps) {
  const form = useForm<z.infer<typeof promptSchema>>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      firstMessage: initialValues?.firstMessage || "",
      systemPrompt: initialValues?.systemPrompt || "",
      endCallMessage: initialValues?.endCallMessage || "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset({
        firstMessage: initialValues.firstMessage || "",
        systemPrompt: initialValues.systemPrompt || "",
        endCallMessage: initialValues.endCallMessage || "",
      });
    }
  }, [initialValues, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      onFormDataChange(value);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onFormDataChange]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      <Card>
        <Form {...form}>
          <form>
            <CardContent className="space-y-6 pt-4">
              <FormField
                control={form.control}
                name="firstMessage"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="first-message">First Message</FormLabel>
                    <FormControl>
                      <Input
                        id="first-message"
                        placeholder="Enter the first message your assistant will send..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="system-prompt">System Prompt</FormLabel>
                    <FormControl>
                      <div data-color-mode="light">
                        <MDEditor
                          value={field.value}
                          onChange={(value) => field.onChange(value || "")}
                          preview="edit"
                          hideToolbar={false}
                          visibleDragbar={false}
                          height={350}
                          data-color-mode="light"
                          commands={[
                            commands.bold,
                            commands.italic,
                            commands.unorderedListCommand,
                            commands.orderedListCommand,
                            commands.quote,
                            commands.divider,
                            commands.link,
                            commands.hr,
                            commands.title,

                          ]}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      This is the main instruction set that guides how your assistant behaves and responds.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endCallMessage"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="end-call">End Call Message</FormLabel>
                    <FormControl>
                      <Input
                        id="end-call"
                        placeholder="Enter the message your assistant will send when ending the conversation..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}