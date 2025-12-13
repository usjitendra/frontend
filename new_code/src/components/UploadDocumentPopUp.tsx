"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Upload, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getDocumentListApi, uploadDocumentApi } from "@/network/Api";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  fileName: z.string().min(1, "Document name is required"),
  file: z.union([z.instanceof(File), z.undefined()])
});

type FormValues = z.infer<typeof formSchema>;

const UploadDocumentPopUp = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileName: "",
      file: undefined
    }
  });

  const file = form.watch("file");
  
  const handleFileChange = (selectedFile: File | null) => {
      if (selectedFile) {
          form.setValue("file", selectedFile, { shouldValidate: true });
          form.setValue("fileName", selectedFile.name, { shouldValidate: true });
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };
    
    const removeFile = () => {
        form.setValue("file", undefined, { shouldValidate: true });
        form.setValue("fileName", "", { shouldValidate: true });
    };
    
    const onSubmit = (data: FormValues) => {
        setIsLoading(true);
        // Handle file upload logic here
        console.log("Uploading file:", data);   
        const formData = new FormData();
        formData.append("file", data.file as Blob);
        formData.append("file_name", data.fileName);
        uploadDocumentApi(formData).then((res) => {
            if(res.data){
                toast({
                    title: "Document uploaded successfully",
                    description: "Document uploaded successfully",
                });
                onClose();
                setIsLoading(false);
            }
        }).catch((err) => {
            console.log(err);
            toast({
                title: "Error uploading document",
                description: "Error uploading document",
            });
            setIsLoading(false);
        });
    };
    
    const handleClose = () => {
        form.reset();
        onClose();
    };

    // Reset form when dialog closes
    useEffect(() => {
      if (!isOpen) {
        form.reset();
        setIsDragging(false);
      }
    }, [isOpen, form]);
    
    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Document</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter document name"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                    } transition-colors duration-200 cursor-pointer`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {file ? (
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full hover:bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Upload className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Drag and drop your file here or click to browse
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Supports PDF, DOCX, TXT, CSV, XLSX (max 10MB)
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                      accept=".pdf,.docx,.txt,.csv,.xlsx"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} className="mr-2">
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800"
              >
                {isLoading ? "Uploading..." : "Upload Document"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentPopUp;