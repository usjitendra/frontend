// "use client";

// import { useRouter } from "next/navigation";
// import AssistantCard from "./AssistantCard";
// import { getAssistantListApi } from "@/network/Api";
// import { useEffect, useState, useRef } from "react";
// import { BotIcon, PlusCircle } from "lucide-react";
// import { Button } from "./ui/button";

// import Vapi from "@vapi-ai/web";
// const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
// if (!vapiPublicKey) {
//   throw new Error("NEXT_PUBLIC_VAPI_PUBLIC_KEY is not defined");
// }
// const vapi = new Vapi(vapiPublicKey);

// import { ElevenLabsClient } from "elevenlabs";

// const AgentsCards = ({
//   handleCreateFromScratch,
// }: {
//   handleCreateFromScratch: () => void;
// }) => {
//   const router = useRouter();
//   const [assistantsList, setAssistantsList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeCallId, setActiveCallId] = useState<string | null>(null);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [isCallConnected, setIsCallConnected] = useState(false);
//   const [voices, setVoices] = useState<any>([]);

//   const client = new ElevenLabsClient({
//     apiKey: process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY,
//   });

//   const fetchVoices = async () => {
//     try {
//       const response = await client.voices.getAll();
//       if (response && response.voices) {
//         setVoices(response.voices);
//         console.log("Fetched voices:", response.voices);
//       } else {
//         console.log("Invalid response format:", response);
//         // Fallback to default voice if API fails
//         setVoices([
//           {
//             voice_id: "xrNwYO0xeioXswMCcFNF",
//             name: "Ingmar - Intimately Mysterious",
//             preview_url:
//               "https://storage.googleapis.com/eleven-public-prod/database/user/iqZvP9uOFYfUw0BsDUQRmHyEHA02/voices/xrNwYO0xeioXswMCcFNF/FLZMQcL3u2BDyQksaRcN.mp3",
//             labels: {
//               accent: "american",
//               descriptive: "whispery",
//               gender: "male",
//             },
//             description:
//               "Middle-aged male voice that captivates with its soft, husky tone.",
//           },
//         ]);
//       }
//     } catch (error) {
//       console.log("Error fetching voices:", error);
//       // Fallback to default voice if API fails
//       setVoices([
//         {
//           voice_id: "xrNwYO0xeioXswMCcFNF",
//           name: "Ingmar - Intimately Mysterious",
//           preview_url:
//             "https://storage.googleapis.com/eleven-public-prod/database/user/iqZvP9uOFYfUw0BsDUQRmHyEHA02/voices/xrNwYO0xeioXswMCcFNF/FLZMQcL3u2BDyQksaRcN.mp3",
//           labels: {
//             accent: "american",
//             descriptive: "whispery",
//             gender: "male",
//           },
//           description:
//             "Middle-aged male voice that captivates with its soft, husky tone.",
//         },
//       ]);
//     }
//   };

//   const fetchAssistants = () => {
//     const page = 1;
//     const page_size = 10;
//     setLoading(true);
//     getAssistantListApi(page, page_size)
//       .then((res) => {
//         if (res?.data) {
//           console.log("res?.data", res?.data);
//           setAssistantsList(res?.data?.data?.assistants);
//         }
//       })
//       .catch((err) => {
//         console.log("err", err);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetchVoices();
//   }, []);

//   useEffect(() => {
//     // Initialize Vapi only on client side

//     fetchAssistants();

//     // Speech events
//     vapi.on("speech-start", () => {
//       setIsSpeaking(true);
//     });

//     vapi.on("speech-end", () => {
//       setIsSpeaking(false);
//     });

//     // Call lifecycle events
//     vapi.on("call-start", () => {
//       setIsConnecting(false);
//       setIsCallConnected(true);
//     });

//     vapi.on("call-end", () => {
//       setActiveCallId(null);
//       setIsSpeaking(false);
//       setIsConnecting(false);
//       setIsCallConnected(false);
//     });

//     return () => {
//       vapi.removeAllListeners();
//     };
//   }, []);

//   const handleTestAssistant = (
//     assistantId: string,
//     systemPrompt: string,
//     voice: string,
//     name: string,
//     firstMessage: string,
//     endCallMessage: string
//   ) => {
//     if (activeCallId === assistantId) {
//       vapi?.stop();
//       setActiveCallId(null);
//     } else {
//       if (activeCallId) {
//         vapi?.stop();
//       }
//       setActiveCallId(assistantId);
//       setIsConnecting(true);

//       vapi.start({
//         transcriber: {
//           provider: "deepgram",
//           model: "nova-3",
//           language: "en-US",
//         },
//         model: {
//           provider: "openai",
//           model: "gpt-4o-mini",
//           messages: [
//             {
//               role: "system",
//               content: systemPrompt,
//             },
//           ],
//         },
//         voice: {
//           provider: "11labs",
//           voiceId: voice,
//         },
//         name: name,
//         firstMessage: firstMessage,
//         endCallMessage: endCallMessage,
//         firstMessageMode: "assistant-speaks-first",
//       });
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
//       </div>
//     );
//   }

//   if (assistantsList.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-96 p-6">
//         <div className="bg-gray-50 dark:bg-gray-800 rounded-full p-6 mb-6">
//           <BotIcon className="h-16 w-16 text-indigo-500" />
//         </div>
//         <h2 className="text-2xl font-semibold mb-2">No agents found</h2>
//         <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md">
//           You haven't created any agents yet. Create your first agent to get
//           started.
//         </p>
//         <Button
//           onClick={handleCreateFromScratch}
//           className="flex items-center gap-2"
//         >
//           <PlusCircle className="h-5 w-5" />
//           Create your first agent
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-4 bg-gray-100">
//       {assistantsList.map((item: any, index) => {
//         const isActive = activeCallId === item?.id;
//         return (
//           <div key={index} className="min-h-[200px]">
//             <AssistantCard
//               id={item?.id}
//               name={item?.name}
//               description={item?.description}
//               status="active"
//               calls={item?.calls}
//               avgTime={item?.avgTime}
//               voiceName={
//                 voices.find((voice: any) => voice.voice_id === item?.voice)
//                   ?.name
//               }
//               gradientFrom="blue-400"
//               gradientTo="indigo-600"
//               onClick={() => router?.push(`/agents/${item?.id}`)}
//               isActive={isActive}
//               isSpeaking={isSpeaking && isActive}
//               isConnecting={isConnecting && isActive}
//               isCallConnected={isCallConnected && isActive}
//               onTestAssistant={() =>
//                 handleTestAssistant(
//                   item?.id,
//                   item?.system_prompt,
//                   item?.voice,
//                   item?.name,
//                   item?.first_message,
//                   item?.end_call_message
//                 )
//               }
//             />
//           </div>
//         );
//       })}
//     </div>
//   );
// };
// export default AgentsCards;

"use client";

import { useRouter } from "next/navigation";
import AssistantCard from "./AssistantCard";
import { getAssistantListApi } from "@/network/Api";
import { useEffect, useState, useRef } from "react";
import { BotIcon, PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import { getVapi_keyApi } from "@/network/Api";
import Vapi from "@vapi-ai/web";
import { toast } from "@/hooks/use-toast";

import { ElevenLabsClient } from "elevenlabs";

const AgentsCards = ({
  handleCreateFromScratch,
}: {
  handleCreateFromScratch: () => void;
}) => {
  const router = useRouter();
  const [assistantsList, setAssistantsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [voices, setVoices] = useState<any>([]);
  const [vapi, setVapi] = useState<any>();

  const client = new ElevenLabsClient({
    apiKey: process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY,
  });

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

  const fetchVoices = async () => {
    try {
      const response = await client.voices.getAll();
      if (response && response.voices) {
        setVoices(response.voices);
        console.log("Fetched voices:", response.voices);
      } else {
        console.log("Invalid response format:", response);
        // Fallback to default voice if API fails
        setVoices([
          {
            voice_id: "xrNwYO0xeioXswMCcFNF",
            name: "Ingmar - Intimately Mysterious",
            preview_url:
              "https://storage.googleapis.com/eleven-public-prod/database/user/iqZvP9uOFYfUw0BsDUQRmHyEHA02/voices/xrNwYO0xeioXswMCcFNF/FLZMQcL3u2BDyQksaRcN.mp3",
            labels: {
              accent: "american",
              descriptive: "whispery",
              gender: "male",
            },
            description:
              "Middle-aged male voice that captivates with its soft, husky tone.",
          },
        ]);
      }
    } catch (error) {
      console.log("Error fetching voices:", error);
      // Fallback to default voice if API fails
      setVoices([
        {
          voice_id: "xrNwYO0xeioXswMCcFNF",
          name: "Ingmar - Intimately Mysterious",
          preview_url:
            "https://storage.googleapis.com/eleven-public-prod/database/user/iqZvP9uOFYfUw0BsDUQRmHyEHA02/voices/xrNwYO0xeioXswMCcFNF/FLZMQcL3u2BDyQksaRcN.mp3",
          labels: {
            accent: "american",
            descriptive: "whispery",
            gender: "male",
          },
          description:
            "Middle-aged male voice that captivates with its soft, husky tone.",
        },
      ]);
    }
  };

  const fetchAssistants = () => {
    const page = 1;
    const page_size = 10;
    setLoading(true);
    getAssistantListApi(page, page_size)
      .then((res) => {
        if (res?.data) {
          console.log("res?.data", res?.data);
          setAssistantsList(res?.data?.data?.assistants);
        }
      })
      .catch((err) => {
        console.log("err", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVoices();
    fetchVapiKeyAndInit();
  }, []);

  useEffect(() => {
    // Initialize Vapi only on client side
    if (!vapi) return;
    fetchAssistants();

    // Speech events
    vapi.on("speech-start", () => {
      setIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setIsSpeaking(false);
    });

    // Call lifecycle events
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

    return () => {
      vapi.removeAllListeners();
    };
  }, [vapi]);

  const handleTestAssistant = (
    assistantId: string,
    systemPrompt: string,
    voice: string,
    name: string,
    firstMessage: string,
    endCallMessage: string
  ) => {
    if (activeCallId === assistantId) {
      vapi?.stop();
      setActiveCallId(null);
    } else {
      if (activeCallId) {
        vapi?.stop();
      }
      setActiveCallId(assistantId);
      setIsConnecting(true);

      vapi.start({
        transcriber: {
          provider: "deepgram",
          model: "nova-3",
          language: "en-US",
        },
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
          ],
        },
        voice: {
          provider: "11labs",
          voiceId: voice,
        },
        name: name,
        firstMessage: firstMessage,
        endCallMessage: endCallMessage,
        firstMessageMode: "assistant-speaks-first",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (assistantsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-full p-6 mb-6">
          <BotIcon className="h-16 w-16 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No agents found</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md">
          You haven't created any agents yet. Create your first agent to get
          started.
        </p>
        <Button
          onClick={handleCreateFromScratch}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          Create your first agent
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-4 bg-gray-100">
      {assistantsList.map((item: any, index) => {
        const isActive = activeCallId === item?.id;
        return (
          <div key={index} className="min-h-[200px]">
            <AssistantCard
              id={item?.id}
              name={item?.name}
              description={item?.description}
              status="active"
              calls={item?.calls}
              avgTime={item?.avgTime}
              voiceName={
                voices.find((voice: any) => voice.voice_id === item?.voice)
                  ?.name
              }
              gradientFrom="blue-400"
              gradientTo="indigo-600"
              onClick={() => router?.push(`/agents/${item?.id}`)}
              isActive={isActive}
              isSpeaking={isSpeaking && isActive}
              isConnecting={isConnecting && isActive}
              isCallConnected={isCallConnected && isActive}
              onTestAssistant={() =>
                handleTestAssistant(
                  item?.id,
                  item?.system_prompt,
                  item?.voice,
                  item?.name,
                  item?.first_message,
                  item?.end_call_message
                )
              }
            />
          </div>
        );
      })}
    </div>
  );
};
export default AgentsCards;
