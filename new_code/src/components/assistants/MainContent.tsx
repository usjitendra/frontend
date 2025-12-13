"use client"

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AssistantForm } from "./AssistantForm";
import { Prompt } from "./Prompt";
import { Step } from "./StepsSidebar";
import ActionTab from "./ActionTab";
import { useRouter } from "next/navigation";
import { deleteAssistantApi, updateAssistantApi } from "@/network/Api";
import { toast } from "@/hooks/use-toast";
import { Phone, PhoneOff, Save, Trash } from "lucide-react";
import PhoneSetup from "./PhoneSetup";
import DeleteAlert from "../DeleteAlert";
import AddProviders from "./AddProviders";
import KnowledgeBase from "./KnowledgeBase";

interface MainContentProps {
  activeStep: Step;
  id: string,
  onTestAssistant?: any;
  isSpeaking?: boolean;
  isConnecting?: boolean;
  isCallConnected?: boolean;
  initialValues?: any;
  formData?: any;
  setFormData?: any;
  loading?: boolean;
  fetchAgentData?: any;
}

interface FormData {
  name?: string;
  description?: string;
  systemPrompt?: string;
  firstMessage?: string;
  endCallMessage?: string;
  voicemailEnabled?: boolean;
  voicemailMessage?: string;
  actions?: any[];
  language?: string;
  speakingRate?: string;
  voicePitch?: string;
  voice?: string;
  enableVoicemail?: boolean;
  voiceRecording?: boolean;
  backgroundSound?: boolean;
  voiceSpeed?: number;
  backchanneling?: boolean;
  forwardingNumber?: string;
  onTestAssistant?: any;
  timezone?: string;
  providers?: string[];
  detectCallerNumber?: boolean;
}

const MainContent = ({ activeStep, id, onTestAssistant, isSpeaking, isConnecting, isCallConnected, initialValues, formData, setFormData, loading, fetchAgentData }: MainContentProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  



  const handleFormDataChange = (newData: Partial<FormData>) => {
    setFormData((prev: any) => ({ ...prev, ...newData }));
  };

  const handleDeleteAssistant = () => {
    deleteAssistantApi(id).then((res) => {
      if (res) {
        toast({
          title: "Assistant deleted",
          description: "The assistant has been successfully deleted",
          variant: "default"
        });
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      router.push('/agents');
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    
    const payload = {
      "language": formData?.language,
      "name": formData?.name,
      "description": formData?.description,
      "system_prompt": formData?.systemPrompt,
      "voice": formData?.voice,
      "actions": formData?.actions,
      "first_message": formData?.firstMessage,
      "first_message_mode": "assistant-speaks-first",
      "end_call_message": formData?.endCallMessage,
      "end_call_function_enabled": true,
      "recording_enabled": formData?.voiceRecording,
      "timezone": formData?.timezone,
      "providers": formData?.providers,
      "detect_caller_number": formData?.detectCallerNumber || false,
      "file_ids": formData?.file_ids,
      "multi_lingual_enabled": formData?.multi_lingual_enabled || false,
      // "voicemail_message": formData.voicemailMessage,
      // "forwarding_number": formData.forwardingNumber
    };

    try {
      const res = await updateAssistantApi(id, payload);
      if (res) {
        toast({
          title: "Success",
          description: "Assistant updated successfully",
        });
      }
      console.log("res>>", res);
      fetchAgentData();
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: "Failed to update assistant",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (!initialValues) return null;
    
    switch (activeStep) {
      case "configure":
        return <AssistantForm initialValues={initialValues} onFormDataChange={handleFormDataChange} />;
      case "prompt":
        return <Prompt initialValues={initialValues} onFormDataChange={handleFormDataChange} />;
      case "actions":
        return <ActionTab initialValues={initialValues} onFormDataChange={handleFormDataChange} />;
      case "providers":
        return <AddProviders initialValues={initialValues} onFormDataChange={handleFormDataChange} />;
      case "phone":
        return <PhoneSetup initialValues={initialValues} onFormDataChange={handleFormDataChange} />;
      case "knowledge-base":
        return <KnowledgeBase initialValues={initialValues} onFormDataChange={handleFormDataChange} />;
      default:
        return <AssistantForm initialValues={initialValues} onFormDataChange={handleFormDataChange} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white shadow-sm px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeStep === "configure" && "Configure Assistant"}
              {activeStep === "prompt" && "Define Assistant Behavior"}
              {activeStep === "actions" && "Set Up Actions"}
              {activeStep === "providers" && "Select Providers"}
              {activeStep === "phone" && "Configure Phone Number"}
              {activeStep === "knowledge-base" && "Configure Knowledge Base"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeStep === "configure" && "Set up the basic details and voice settings"}
              {activeStep === "prompt" && "Configure how your assistant should respond and behave"}
              {activeStep === "actions" && "Set up automated tasks and workflows"}
              {activeStep === "providers" && "Choose the providers that this assistant will work with. Click on a card to select or deselect a provider."}
              {activeStep === "phone" && "Configure the phone number for your assistant"}
              {activeStep === "knowledge-base" && "Configure the knowledge base for your assistant"}
            </p>
          </div>
          {/* <Button variant="outline" onClick={() => router.push('/agents')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button> */}
          <div className="flex items-center gap-4">              
            <Button
              variant={isCallConnected ? "destructive" : "default"}
              className={isCallConnected ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600 text-white"}
              onClick={() => {
                onTestAssistant(
                  formData.systemPrompt || "",
                  formData.voice || "",
                  formData.name || "",
                  formData.firstMessage || "",
                  formData.endCallMessage || ""
                );
              }}
              disabled={!formData.voice || isConnecting}
            >
              {isConnecting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-white" />
                  Connecting...
                </>
              ) : isCallConnected ? (
                <>
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Call
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Test Assistant
                </>
              )}
              {(isSpeaking || isCallConnected) && (
                <div className="flex gap-1 items-center ml-2">
                  <span className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1 h-2.5 bg-white rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></span>
                  <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "450ms" }}></span>
                  <span className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "600ms" }}></span>
                </div>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
            <div className="flex items-center">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash className="h-4 w-4 text-white" />
                </Button>
              </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
      <DeleteAlert
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={() => { handleDeleteAssistant() }}
      />
    </div>
  );
}

export default MainContent;