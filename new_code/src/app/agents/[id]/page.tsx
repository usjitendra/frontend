export const runtime = 'edge';

import { AssistantSetup } from "@/components/assistants/AssistantSetup";
import { Loader2 } from "lucide-react";

const AgentDetails = async ({params}: {params: Promise<{ id: any }>}) => {    
    const { id } = await params;
    
    return (
        <div className="w-full flex h-screen bg-gray-100">
            {id ? (
                <AssistantSetup id={id} />
            ) : (
                <div className="flex items-center justify-center w-full">
                    <div className="flex flex-col items-center gap-4 w-full">
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                        <p className="text-gray-500 font-medium">Loading agent details...</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AgentDetails;