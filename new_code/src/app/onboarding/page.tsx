"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import BasicInfoStep1 from "@/components/onboarding/BasicInfoStep1";
import ClinicInfoStep from "@/components/onboarding/ClinicInfoStep";
import AiAgentStep from "@/components/onboarding/AiAgentStep";
import CallHandlingStep from "@/components/onboarding/CallHandlingStep";
import GeneralSettingStep from "@/components/onboarding/GeneralSettingStep";
import TermsStep from "@/components/onboarding/TermsStep";

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(16);

  useEffect(() => {
    setProgress(Math.round((step / 3) * 100));
  }, [step]);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <BasicInfoStep1 setStep={setStep} />
          </>
        );
      case 2:
        return (
          <>
            <ClinicInfoStep setStep={setStep} />
          </>
        );
      // case 3:
      //   return (
      //     <>
      //       <AiAgentStep setStep={setStep}/>
      //     </>
      //   );
      // case 4:
      //   return (
      //     <>
      //       <CallHandlingStep setStep={setStep}/>
      //     </>
      //   );
      // case 5:
      //   return (
      //     <>
      //       <GeneralSettingStep setStep={setStep}/>
      //     </>
      //   );
      case 3:
        return (
          <>
            <TermsStep setStep={setStep} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-indigo-600">
              Progress
            </span>
            <span className="text-sm font-medium text-indigo-600">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardContent className="p-8">{renderStepContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
