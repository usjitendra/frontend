// "use client"

// import { useEffect, useState } from "react";
// import { StepsSidebar } from "./StepsSidebar";
// import { useSidebar } from "../ui/sidebar";
// import MainContent from "./MainContent";
// import { useRouter } from "next/navigation";
// import { getAssistantDetailsApi, getWebcallApi } from "@/network/Api";

// export function AssistantSetup({id}: {id: string}) {
//   const [activeStep, setActiveStep] = useState<any>("configure");
//   const { toggleSidebar, open } = useSidebar();
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [isCallConnected, setIsCallConnected] = useState(false);
//   const [activeCallId, setActiveCallId] = useState<string | null>(null);
//   const [vapi, setVapi] = useState<any>(null);
//   const router = useRouter()
//   const [initialValues, setInitialValues] = useState<any>(null);
//   const [formData, setFormData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [assistantName, setAssistantName] = useState<string>("");
//   const [webcallData, setWebcallData] = useState<any>(null);

//   const fetchWebcallData = async (id: string) => {
//     getWebcallApi(id).then((res) => {
//       if(res.data){
//         console.log("webcall",res.data);
//         setWebcallData(res.data?.data?.assistant);
//       }
//     }).catch((err) => {
//       console.log(err);
//     });
//   }

//   const fetchAgentData = async () => {
//     try {
//       if (!id) {
//         router.push('/agents');
//         return;
//       }

//       getAssistantDetailsApi(id).then((res) => {
//         if (res.data) {
//           const data = {
//             id: id, // Add id to initialValues
//             name: res.data?.data?.assistant?.name,
//             description: res.data?.data?.assistant?.description,
//             systemPrompt: res.data?.data?.assistant?.system_prompt,
//             firstMessage: res.data?.data?.assistant?.first_message,
//             endCallMessage: res.data?.data?.assistant?.end_call_message,
//             // voicemailEnabled: res.data?.data?.assistant?.voicemail_enabled,
//             // voicemailMessage: res.data?.data?.assistant?.voicemail_message,
//             actions: res.data?.data?.assistant?.actions,
//             language: res.data?.data?.assistant?.language,
//             // speakingRate: res.data?.data?.assistant?.speaking_rate,
//             // voicePitch: res.data?.data?.assistant?.voice_pitch,
//             voice: res.data?.data?.assistant?.voice,
//             voiceRecording: res.data?.data?.assistant?.recording_enabled,
//             // forwardingNumber: res.data?.data?.assistant?.forwarding_number,
//             // backgroundSound: res.data?.data?.assistant?.background_sound,
//             // voiceSpeed: res.data?.data?.assistant?.voice_speed,
//             // backchanneling: res.data?.data?.assistant?.backchanneling,
//             system_prompt: res.data?.data?.assistant?.system_prompt, // Add system_prompt
//             first_message: res.data?.data?.assistant?.first_message, // Add first_message
//             end_call_message: res.data?.data?.assistant?.end_call_message, // Add end_call_message
//             timezone: res.data?.data?.assistant?.timezone,
//             providers: res.data?.data?.assistant?.providers || [],
//             detectCallerNumber: res.data?.data?.assistant?.detect_caller_number || false,
//             file_ids: res.data?.data?.assistant?.file_ids || [],
//             multi_lingual_enabled: res.data?.data?.assistant?.multi_lingual_enabled || false,
//           };
//           setInitialValues(data);
//           setFormData(data);
//           setAssistantName(res.data?.data?.assistant?.name)
//         }
//         setLoading(false);
//       }).catch((err) => {
//         console.log(err);
//         setLoading(false);
//       });
//     } catch (err) {
//       console.log(err);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAgentData();
//     fetchWebcallData(id);
//   }, [id, router]);

//   useEffect(() => {
//     if(open){
//       toggleSidebar()
//     }
//   }, [open, toggleSidebar]);

//   useEffect(() => {
//     // Initialize Vapi when component mounts on client side
//     if (typeof window !== 'undefined') {
//       import('@vapi-ai/web').then((mod) => {
//         const Vapi = mod.default;
//         const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
//         if (!vapiPublicKey) {
//           throw new Error('NEXT_PUBLIC_VAPI_PUBLIC_KEY is not defined');
//         }
//         const vapiInstance = new Vapi(vapiPublicKey);
//         setVapi(vapiInstance);

//         // Set up event listeners
//         vapiInstance.on("speech-start", () => {
//           setIsSpeaking(true);
//         });

//         vapiInstance.on("speech-end", () => {
//           setIsSpeaking(false);
//         });

//         vapiInstance.on("call-start", () => {
//           setIsConnecting(false);
//           setIsCallConnected(true);
//         });

//         vapiInstance.on("call-end", () => {
//           setActiveCallId(null);
//           setIsSpeaking(false);
//           setIsConnecting(false);
//           setIsCallConnected(false);
//         });
//       });

//       return () => {
//         if (vapi) {
//           vapi.removeAllListeners();
//         }
//       };
//     }
//   }, []);

//   const handleTestAssistant = (system_prompt: string, voice: string, name: string, first_message: string, end_call_message: string) => {
//     if (!vapi) return;

//     if (isCallConnected) {
//       // End the call if one is already in progress
//       vapi.stop();
//       setIsCallConnected(false);
//       setIsSpeaking(false);
//       setIsConnecting(false);
//       setActiveCallId(null);
//       return;
//     }

//     setIsConnecting(true);
//     setActiveCallId(id); // Set active call ID

//     // vapi.start(webcallData)

//     // Use the webcallData configuration which already contains all necessary settings
//     // Just update the dynamic values if they're passed as parameters
//     const configData = { ...webcallData };

//     // Override specific values if they were passed to the function
//     if (name) configData.name = name;
//     if (voice) configData.voice.voiceId = voice;
//     if (system_prompt && configData.model?.messages?.length > 0) {
//       configData.model.messages[0].content = system_prompt;
//     }
//     if (first_message) configData.firstMessage = first_message;
//     if (end_call_message) configData.endCallMessage = end_call_message;

//     vapi.start(configData);
//   };

//   if (loading) {
//     return (
//       <div className="w-full flex h-screen bg-gray-100 items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full flex bg-gray-100 overflow-hidden">
//       <StepsSidebar onStepChange={(val) => {setActiveStep(val)}} activeStep={activeStep} assistantName={assistantName}/>
//       <MainContent
//         activeStep={activeStep}
//         id={id}
//         isSpeaking={isSpeaking}
//         isConnecting={isConnecting}
//         isCallConnected={isCallConnected}
//         initialValues={initialValues}
//         formData={formData}
//         setFormData={setFormData}
//         loading={loading}
//         fetchAgentData={fetchAgentData}
//         onTestAssistant={(system_prompt: string, voice: string, name: string, first_message: string, end_call_message: string) =>
//           handleTestAssistant(system_prompt, voice, name, first_message, end_call_message)
//         }
//       />
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { StepsSidebar } from "./StepsSidebar";
import { useSidebar } from "../ui/sidebar";
import MainContent from "./MainContent";
import { useRouter } from "next/navigation";
import { getAssistantDetailsApi, getWebcallApi } from "@/network/Api";
import { getVapi_keyApi } from "@/network/Api";
import Vapi from "@vapi-ai/web";
import { toast } from "@/hooks/use-toast";

export function AssistantSetup({ id }: { id: string }) {
  const [activeStep, setActiveStep] = useState<any>("configure");
  const { toggleSidebar, open } = useSidebar();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [vapi, setVapi] = useState<any>(null);
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assistantName, setAssistantName] = useState<string>("");
  const [webcallData, setWebcallData] = useState<any>(null);

  const fetchVapiKeyAndInit = async () => {
    try {
      const res = await getVapi_keyApi();
      const vapiKey = res?.data?.vapi_public_key;
      if (!vapiKey) {
        throw new Error("Vapi key not found from API");
      }
      const vapiInstance = new Vapi(vapiKey);
      console.log("✅ Vapi initialized with key:", vapiKey);
      setVapi(vapiInstance);
    } catch (error: any) {
      toast({
        title: "Vapi Initialization Failed",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Vapi key not found.",
        variant: "destructive",
      });
      //   console.error("Error initializing Vapi:", error);
    }
  };

  const fetchWebcallData = async (id: string) => {
    getWebcallApi(id)
      .then((res) => {
        if (res.data) {
          console.log("webcall", res.data);
          setWebcallData(res.data?.data?.assistant);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchAgentData = async () => {
    try {
      if (!id) {
        router.push("/agents");
        return;
      }

      getAssistantDetailsApi(id)
        .then((res) => {
          if (res.data) {
            const data = {
              id: id, // Add id to initialValues
              name: res.data?.data?.assistant?.name,
              description: res.data?.data?.assistant?.description,
              systemPrompt: res.data?.data?.assistant?.system_prompt,
              firstMessage: res.data?.data?.assistant?.first_message,
              endCallMessage: res.data?.data?.assistant?.end_call_message,
              // voicemailEnabled: res.data?.data?.assistant?.voicemail_enabled,
              // voicemailMessage: res.data?.data?.assistant?.voicemail_message,
              actions: res.data?.data?.assistant?.actions,
              language: res.data?.data?.assistant?.language,
              // speakingRate: res.data?.data?.assistant?.speaking_rate,
              // voicePitch: res.data?.data?.assistant?.voice_pitch,
              voice: res.data?.data?.assistant?.voice,
              voiceRecording: res.data?.data?.assistant?.recording_enabled,
              // forwardingNumber: res.data?.data?.assistant?.forwarding_number,
              // backgroundSound: res.data?.data?.assistant?.background_sound,
              // voiceSpeed: res.data?.data?.assistant?.voice_speed,
              // backchanneling: res.data?.data?.assistant?.backchanneling,
              system_prompt: res.data?.data?.assistant?.system_prompt, // Add system_prompt
              first_message: res.data?.data?.assistant?.first_message, // Add first_message
              end_call_message: res.data?.data?.assistant?.end_call_message, // Add end_call_message
              timezone: res.data?.data?.assistant?.timezone,
              providers: res.data?.data?.assistant?.providers || [],
              detectCallerNumber:
                res.data?.data?.assistant?.detect_caller_number || false,
              file_ids: res.data?.data?.assistant?.file_ids || [],
              multi_lingual_enabled:
                res.data?.data?.assistant?.multi_lingual_enabled || false,
            };
            setInitialValues(data);
            setFormData(data);
            setAssistantName(res.data?.data?.assistant?.name);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
    fetchWebcallData(id);
  }, [id, router]);

  useEffect(() => {
    if (open) {
      toggleSidebar();
      fetchVapiKeyAndInit();
    }
  }, [open, toggleSidebar]);
  useEffect(() => {
    if (typeof window !== "undefined" && vapi) {
      // Set up event listeners
      vapi.on("speech-start", () => setIsSpeaking(true));
      vapi.on("speech-end", () => setIsSpeaking(false));
      vapi.on("call-start", () => {
        setIsConnecting(false);
        setIsCallConnected(true);
      });
      vapi.on("call-end", () => {
        setActiveCallId(null);
        setIsSpeaking(false);
        setIsConnecting(false);
        setIsCallConnected(false);
      });
    }

    return () => {
      if (vapi) vapi.removeAllListeners();
    };
  }, [vapi]);

  const handleTestAssistant = (
    system_prompt: string,
    voice: string,
    name: string,
    first_message: string,
    end_call_message: string
  ) => {
    if (!vapi) return;

    if (isCallConnected) {
      // End the call if one is already in progress
      vapi.stop();
      setIsCallConnected(false);
      setIsSpeaking(false);
      setIsConnecting(false);
      setActiveCallId(null);
      return;
    }

    setIsConnecting(true);
    setActiveCallId(id); // Set active call ID

    // vapi.start(webcallData)

    // Use the webcallData configuration which already contains all necessary settings
    // Just update the dynamic values if they're passed as parameters
    const configData = { ...webcallData };

    // Override specific values if they were passed to the function
    if (name) configData.name = name;
    if (voice) configData.voice.voiceId = voice;
    if (system_prompt && configData.model?.messages?.length > 0) {
      configData.model.messages[0].content = system_prompt;
    }
    if (first_message) configData.firstMessage = first_message;
    if (end_call_message) configData.endCallMessage = end_call_message;

    vapi.start(configData);
  };

  if (loading) {
    return (
      <div className="w-full flex h-screen bg-gray-100 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex bg-gray-100 overflow-hidden">
      <StepsSidebar
        onStepChange={(val) => {
          setActiveStep(val);
        }}
        activeStep={activeStep}
        assistantName={assistantName}
      />
      <MainContent
        activeStep={activeStep}
        id={id}
        isSpeaking={isSpeaking}
        isConnecting={isConnecting}
        isCallConnected={isCallConnected}
        initialValues={initialValues}
        formData={formData}
        setFormData={setFormData}
        loading={loading}
        fetchAgentData={fetchAgentData}
        onTestAssistant={(
          system_prompt: string,
          voice: string,
          name: string,
          first_message: string,
          end_call_message: string
        ) =>
          handleTestAssistant(
            system_prompt,
            voice,
            name,
            first_message,
            end_call_message
          )
        }
      />
    </div>
  );
}
