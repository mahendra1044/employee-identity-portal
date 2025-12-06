"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage, useTranslation } from "@/i18n";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/i18n";

/**
 * LanguageSwitcher Component
 * Elegant dropdown for switching between available languages
 * Styled similar to RoleSwitcher for UI consistency
 */
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as LanguageCode);
  };

  const currentLang = SUPPORTED_LANGUAGES[language];
  
  // Safely access languageSwitcher translations with fallbacks
  const languageSwitcherT = t.languageSwitcher as Record<string, unknown> | undefined;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Select 
            value={language} 
            onValueChange={handleLanguageChange}
            onOpenChange={setIsOpen}
          >
            <SelectTrigger 
              className={`
                group h-9 w-auto min-w-[120px] max-w-[160px] px-3 py-1.5
                rounded-xl border border-indigo-200 dark:border-indigo-800/50
                bg-indigo-50 dark:bg-indigo-950/30
                backdrop-blur-sm
                shadow-sm hover:shadow-md
                transition-all duration-300 ease-out
                focus:ring-1 focus:ring-offset-1 focus:ring-indigo-300 dark:focus:ring-indigo-600
                [&>svg.lucide-chevron-down]:hidden
              `}
            >
              <div className="flex items-center gap-2 w-full">
                {/* Flag emoji */}
                <span className="text-sm flex-shrink-0">{currentLang?.flag}</span>
                
                {/* Globe icon */}
                <Globe className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                
                {/* Language name */}
                <SelectValue placeholder={(languageSwitcherT?.label as string) || "Language"}>
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 truncate">
                    {currentLang?.nativeName}
                  </span>
                </SelectValue>
                
                {/* Custom chevron with rotation */}
                <ChevronDown 
                  className={`
                    h-3.5 w-3.5 ml-auto text-indigo-400 dark:text-indigo-500 flex-shrink-0
                    transition-transform duration-300 ease-out
                    ${isOpen ? 'rotate-180' : 'rotate-0'}
                  `} 
                />
              </div>
            </SelectTrigger>
            
            <SelectContent 
              className={`
                min-w-[140px] max-h-[280px] overflow-y-auto p-1
                rounded-lg border border-slate-200/80 dark:border-slate-700/80
                bg-white/95 dark:bg-slate-900/95
                backdrop-blur-xl
                shadow-lg
                animate-in fade-in-0 zoom-in-95 duration-200
              `}
              align="end"
              sideOffset={6}
            >
              {/* Header label */}
              <div className="px-2.5 py-1.5 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {(languageSwitcherT?.label as string) || "Language"}
                </span>
              </div>
              
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, langConfig]) => {
                const isActive = code === language;
                
                return (
                  <SelectItem 
                    key={code} 
                    value={code}
                    className={`
                      relative cursor-pointer rounded-md px-2 py-1.5 my-0.5
                      transition-all duration-200 ease-out
                      focus:bg-slate-50 dark:focus:bg-slate-800/50
                      data-[highlighted]:bg-slate-50 dark:data-[highlighted]:bg-slate-800/50
                      ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Flag */}
                      <span className="text-base">{langConfig.flag}</span>
                      
                      {/* Language name */}
                      <span className={`
                        text-sm font-medium truncate flex-1
                        ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}
                      `}>
                        {langConfig.nativeName}
                      </span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent 
        side="bottom" 
        className="bg-slate-900 text-white border-slate-800 px-3 py-1.5"
      >
        <p className="text-xs font-medium">
          {(languageSwitcherT?.tooltip as string) || "Change language"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export default LanguageSwitcher;
