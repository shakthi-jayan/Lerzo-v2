import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();

export const sendOtpEmail = async (email: string, otp: string, name: string = 'User') => {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || SERVICE_ID === 'your_service_id') {
        console.warn('EmailJS is not configured. Check your .env file.');
        return false;
    }

    console.log('Sending Email with:', {
        ServiceId: SERVICE_ID,
        TemplateId: TEMPLATE_ID,
        PublicKey: '...' + PUBLIC_KEY?.slice(-4)
    });

    const templateParams = {
        // Common variations for "To Email" field
        email: email,
        to_email: email,
        recipient: email,
        user_email: email,

        // Other fields
        to_name: name,
        otp_code: otp,
        passcode: otp,
        time: '10 minutes',
        company: 'Lerzo',
        message: `Your OTP for Lerzo Login is ${otp}. It is valid for 10 minutes.`,
        reply_to: 'support@lerzo.com'
    };

    try {
        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log('SUCCESS!', response.status, response.text);
        return true;
    } catch (error) {
        console.error('FAILED...', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        } else {
            console.error('Error object:', JSON.stringify(error));
        }
        throw error;
    }
};
