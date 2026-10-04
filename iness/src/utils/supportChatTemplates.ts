export interface SupportChatTemplate {
  id: string;
  title: string;
  message: string;
  type: "session" | "general" | "plan" | "service";
}

export const supportChatTemplates: SupportChatTemplate[] = [
  {
    id: "request-session-plan",
    title: "Request a Session",
    message: "I would like to request a session for my plan: {planTitle}. Please let me know the available time slots.",
    type: "session",
  },
  {
    id: "request-session-service",
    title: "Request a Session",
    message: "I would like to request a session for my service: {planTitle}. Please let me know the available time slots.",
    type: "service",
  },
  // Add more templates here as needed
];

/**
 * Get template message by replacing placeholders with actual values
 */
export function getTemplateMessage(
  template: SupportChatTemplate,
  replacements: Record<string, string>
): string {
  let message = template.message;
  Object.keys(replacements).forEach((key) => {
    message = message.replace(`{${key}}`, replacements[key]);
  });
  return message;
}

/**
 * Get template by type
 */
export function getTemplateByType(type: SupportChatTemplate["type"]): SupportChatTemplate | undefined {
  return supportChatTemplates.find((template) => template.type === type);
}
