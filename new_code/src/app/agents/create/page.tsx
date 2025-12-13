'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AgentForm from '@/components/AgentForm'
import { createAssistantApi } from '@/network/Api'

const CreateAgent = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
    
    try {
      const res = await createAssistantApi(payload)
      if (res.data) {
        router.push('/agents')
      }
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AgentForm
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
    />
  )
}

export default CreateAgent
