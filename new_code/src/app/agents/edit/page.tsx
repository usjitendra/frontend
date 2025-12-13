'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AgentForm from '@/components/AgentForm'
import { getAssistantDetailsApi, updateAssistantApi } from '@/network/Api'
import { toast } from '@/hooks/use-toast'

const EditAgent = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [initialValues, setInitialValues] = useState<any>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    const fetchAgentData = async () => {
        try {
            if (!id) {
                router.push('/agents')
                return
            }

            getAssistantDetailsApi(id).then((res) => {
                if (res.data) {
                    console.log("res--",res?.data?.data?.assistant);
                    
                    setInitialValues({
                        name: res.data?.data?.assistant?.name,
                        description: res.data?.data?.assistant?.description,
                        systemPrompt: res.data?.data?.assistant?.system_prompt,
                        firstMessage: res.data?.data?.assistant?.first_message,
                        endCallMessage: res.data?.data?.assistant?.end_call_message,
                        voicemailEnabled: res.data?.data?.assistant?.voicemail_enabled,
                        voicemailMessage: res.data?.data?.assistant?.voicemail_message,
                        actions: res.data?.data?.assistant?.actions
                    })
                }
            }).catch((err) => {
                console.log(err)
            })
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        fetchAgentData()
    }, [id, router])

    const handleSubmit = async (values: any) => {
        setIsLoading(true)
        const payload = {
            "name": values?.name,
            "description": values?.description,
            "system_prompt": values?.systemPrompt,
            "first_message": values?.firstMessage,
            "end_call_message": values?.endCallMessage,
            "voicemail_message": values?.voicemailMessage,
            "actions": values?.actions
        }
        updateAssistantApi(id, payload).then((res) => {
            if (res.data) {
                setIsLoading(false)
                toast({
                    title: "Assistant updated successfully",
                    description: "Assistant updated successfully",
                    variant: "default"
                })
                router.push('/agents')
            }
        }).catch((err) => {
            console.log(err)
            setIsLoading(false)
        })
    }

    if (!initialValues) {
        return <div>Loading...</div>
    }

    return (
        <AgentForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isSubmitting={isLoading}
            title="Edit Assistant"
            description="Update your AI voice agent configuration"
        />
    )
}

export default EditAgent;