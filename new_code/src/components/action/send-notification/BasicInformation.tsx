import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

interface BasicInformationProps {
  form: UseFormReturn<any>;
}

const BasicInformation = ({ form }: BasicInformationProps) => {
  const isSilentNotification = form.watch("isSilentNotification");

  return (
    <div id="section-action-info" className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            <FormLabel className="text-sm font-medium">
              Action Title <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input 
                className="bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="e.g. Notify User About Booking" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            <FormLabel className="text-sm font-medium">
              Action Description <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea 
                className="bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Describe when this action will be invoked, e.g. When booking is confirmed, send notification to the user." 
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
        name="isSilentNotification"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox 
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="text-sm font-medium cursor-pointer">
              Send notifications silently
            </FormLabel>
          </FormItem>
        )}
      />

      {!isSilentNotification && (
        <div className="space-y-4 mt-4">
          <FormField
            control={form.control}
            name="startMessage"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="text-sm font-medium">
                  Start Message <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    className="bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="Message to show when notification starts" 
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="delayMessage"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="text-sm font-medium">
                  Delay Message <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    className="bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="Message to show during notification delay" 
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endMessage"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="text-sm font-medium">
                  End Message <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    className="bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="Message to show when notification ends" 
                    rows={2}
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
  );
};

export default BasicInformation;