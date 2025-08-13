'use client';

import React from 'react';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { CollaborationProvider } from "@/contexts/CollaborationContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { MediaProvider } from "@/contexts/MediaContext";
import { ProjectManagementProvider } from "@/contexts/ProjectManagementContext";
import ChatbotOverlay from "@/components/ui/ChatbotOverlay";
import { useChatbot } from "@/contexts/ChatbotContext";
import "@/lib/i18n";

interface ClientProvidersProps {
  children: React.ReactNode;
}

function ChatbotWrapper({ children }: { children: React.ReactNode }) {
  const { isChatbotOpen, toggleChatbot } = useChatbot();
  
  return (
    <>
      {children}
      <ChatbotOverlay isOpen={isChatbotOpen} onToggle={toggleChatbot} />
    </>
  );
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <MediaProvider>
            <DatabaseProvider>
              <ProjectManagementProvider>
                <CollaborationProvider>
                  <ChatbotProvider>
                    <ChatbotWrapper>
                      {children}
                    </ChatbotWrapper>
                  </ChatbotProvider>
                </CollaborationProvider>
              </ProjectManagementProvider>
            </DatabaseProvider>
          </MediaProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}