'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConsultationQuestionnaireWrapper } from '@/components/consultation/questionnaire-wrapper'
import { toast } from 'sonner'


export default function ConsultationQuestionnaire() {
  const router = useRouter()

  const handleQuestionnaireComplete = async (answers: Record<string, unknown>) => {
    try {
      toast.success('Assessment complete! Generating your consultation...')

      // Navigate to results page
      router.push('/consultation/results')
    } catch (error) {
      console.error('Failed to process questionnaire completion:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const handleBackToLanding = () => {
    router.push('/consultation/landing')
  }

  return (
    <ConsultationQuestionnaireWrapper
      onComplete={handleQuestionnaireComplete}
      onBackToLanding={handleBackToLanding}
    />
  )
}