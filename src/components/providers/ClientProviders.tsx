'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { CollaborationProvider } from "@/contexts/CollaborationContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { MediaProvider } from "@/contexts/MediaContext";
import { ProjectManagementProvider } from "@/contexts/ProjectManagementContext";
import { AlertProvider, setGlobalAlertContext, useAlert } from "@/contexts/AlertContext";
import { AuthProvider } from "@/contexts/AuthContext";
import KeycloakProviderWrapper from "@/components/providers/KeycloakProviderWrapper";
import RouteGuard from "@/components/auth/RouteGuard";
import ChatbotOverlay from "@/components/ui/ChatbotOverlay";
import { useChatbot } from "@/contexts/ChatbotContext";
import "@/lib/i18n";

interface ClientProvidersProps {
  children: React.ReactNode;
}

function AlertWrapper({ children }: { children: React.ReactNode }) {
  const alertContext = useAlert();
  
  useEffect(() => {
    // Set global alert context for use outside React components
    setGlobalAlertContext(alertContext);
  }, [alertContext]);
  
  return <>{children}</>;
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
    <KeycloakProviderWrapper>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <MediaProvider>
                <DatabaseProvider>
                  <ProjectManagementProvider>
                    <CollaborationProvider>
                      <ChatbotProvider>
                        <AlertProvider position="top-right" maxAlerts={5}>
                          <AlertWrapper>
                            <RouteGuard>
                              <ChatbotWrapper>
                                {children}
                              </ChatbotWrapper>
                            </RouteGuard>
                          </AlertWrapper>
                        </AlertProvider>
                      </ChatbotProvider>
                    </CollaborationProvider>
                  </ProjectManagementProvider>
                </DatabaseProvider>
              </MediaProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </KeycloakProviderWrapper>
  );
}