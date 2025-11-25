/**
 * WhatsApp Business API Integration
 * Supports both Twilio WhatsApp API and click-to-chat fallback
 */

export interface WhatsAppConfig {
    provider: 'twilio' | 'click-to-chat';
    twilioAccountSid?: string;
    twilioAuthToken?: string;
    twilioWhatsAppNumber?: string; // Format: whatsapp:+919876543210
}

export interface WhatsAppMessageOptions {
    phone: string;
    message: string;
}

/**
 * Send WhatsApp message via Twilio API
 */
import { supabase } from '../lib/supabase';

/**
 * Send WhatsApp message via Twilio API (using Supabase Edge Function)
 */
export const sendWhatsAppViaTwilio = async (
    to: string,
    message: string,
    config: WhatsAppConfig
): Promise<{ success: boolean; error?: string; messageId?: string }> => {
    if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioWhatsAppNumber) {
        return { success: false, error: 'Twilio credentials not configured' };
    }

    try {
        const { data, error } = await supabase.functions.invoke('send-whatsapp', {
            body: {
                to,
                message,
                accountSid: config.twilioAccountSid,
                authToken: config.twilioAuthToken,
                from: config.twilioWhatsAppNumber
            }
        });

        if (error) {
            console.error('Supabase Function Error:', error);
            // Check for 404 (Function not found/deployed)
            if (error instanceof Error && error.message.includes('not found')) {
                return { success: false, error: 'Backend function not deployed. Please use Click-to-Chat.' };
            }
            return { success: false, error: error.message || 'Failed to invoke backend function' };
        }

        if (data && data.error) {
            return { success: false, error: data.error };
        }

        return { success: true, messageId: data?.sid };
    } catch (error: any) {
        console.error('Network/Function Error:', error);
        return { success: false, error: error.message || 'Network error' };
    }
};

/**
 * Generates a WhatsApp URL for click-to-chat (fallback method)
 */
export const generateWhatsAppURL = (phone: string, message?: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountryCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const encodedMessage = message ? encodeURIComponent(message) : '';
    const isDesktop = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseUrl = isDesktop ? 'https://web.whatsapp.com/send' : 'https://wa.me';

    const url = isDesktop
        ? `${baseUrl}?phone=${phoneWithCountryCode}${encodedMessage ? `&text=${encodedMessage}` : ''}`
        : `${baseUrl}/${phoneWithCountryCode}${encodedMessage ? `?text=${encodedMessage}` : ''}`;

    return url;
};

/**
 * Opens WhatsApp chat in a new window (click-to-chat method)
 */
export const openWhatsApp = (phone: string, message?: string): void => {
    const url = generateWhatsAppURL(phone, message);
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
        newWindow.focus();
    }
};

/**
 * Send WhatsApp message - uses API if configured, falls back to click-to-chat
 */
export const sendWhatsAppMessage = async (
    to: string,
    message: string,
    config?: WhatsAppConfig
): Promise<{ success: boolean; error?: string; method: 'api' | 'click-to-chat' }> => {
    // If Twilio is configured, use API
    if (config?.provider === 'twilio' && config.twilioAccountSid) {
        const result = await sendWhatsAppViaTwilio(to, message, config);
        return { ...result, method: 'api' };
    }

    // Fallback to click-to-chat
    openWhatsApp(to, message);
    return { success: true, method: 'click-to-chat' };
};

/**
 * Send bulk WhatsApp messages
 */
export const sendBulkWhatsAppMessages = async (
    messages: Array<{ to: string; message: string }>,
    config?: WhatsAppConfig,
    onProgress?: (sent: number, total: number) => void
): Promise<{ success: number; failed: number; errors: string[] }> => {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < messages.length; i++) {
        const { to, message } = messages[i];

        const result = await sendWhatsAppMessage(to, message, config);

        if (result.success) {
            success++;
        } else {
            failed++;
            errors.push(`${to}: ${result.error || 'Unknown error'}`);
        }

        // Call progress callback
        if (onProgress) {
            onProgress(i + 1, messages.length);
        }

        // Delay between messages (1.5s for click-to-chat, 0.5s for API)
        if (i < messages.length - 1) {
            const delay = result.method === 'click-to-chat' ? 1500 : 500;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return { success, failed, errors };
};

/**
 * Message Templates
 */
export const WhatsAppTemplates = {
    feeReminder: (studentName: string, amount: number, dueDate: string) =>
        `Dear ${studentName},\n\nThis is a friendly reminder that your fee payment of ₹${amount} is pending.\n\nDue Date: ${dueDate}\n\nPlease make the payment at your earliest convenience.\n\nThank you!`,

    paymentReceipt: (studentName: string, amount: number, receiptNo: string) =>
        `Dear ${studentName},\n\nThank you for your payment of ₹${amount}.\n\nReceipt No: ${receiptNo}\n\nYour payment has been successfully recorded.`,

    attendanceAlert: (studentName: string, absentDays: number) =>
        `Dear Parent,\n\nThis is to inform you that ${studentName} has been absent for ${absentDays} days.\n\nPlease ensure regular attendance for better academic performance.\n\nThank you!`,

    enquiryFollowUp: (name: string, courseName: string) =>
        `Hello ${name},\n\nThank you for your interest in ${courseName}.\n\nWe would love to discuss the course details with you.\n\nWhen would be a good time to connect?`,

    general: (name: string) =>
        `Hello ${name},\n\n`,

    admissionConfirmation: (studentName: string, courseName: string, batchName: string) =>
        `Dear ${studentName},\n\nCongratulations! Your admission to ${courseName} (${batchName}) has been confirmed.\n\nWelcome to our institute!`,

    certificateReady: (studentName: string, courseName: string) =>
        `Dear ${studentName},\n\nYour course completion certificate for ${courseName} is ready for collection.\n\nPlease visit the office during working hours.\n\nCongratulations on completing the course!`
};
