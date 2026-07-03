import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm border-2 transition-all duration-300",
                isDone ? "bg-harvest border-harvest text-white" :
                isActive ? "bg-white border-harvest text-harvest" :
                "bg-white border-border text-slate_mist"
              )}>
                {isDone ? <Check className="w-4 h-4" /> : <span>{i + 1}</span>}
              </div>
              <span className={cn(
                "text-[10px] mt-1.5 font-medium tracking-wide text-center max-w-[70px] leading-tight",
                isActive ? "text-harvest" : isDone ? "text-ink" : "text-slate_mist"
              )}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "h-[2px] w-12 md:w-20 mb-5 transition-all duration-300",
                i < currentStep ? "bg-harvest" : "bg-border"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}