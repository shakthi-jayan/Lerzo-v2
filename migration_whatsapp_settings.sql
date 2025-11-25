-- Add WhatsApp configuration columns to the settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS "whatsappProvider" text DEFAULT 'click-to-chat',
ADD COLUMN IF NOT EXISTS "twilioAccountSid" text,
ADD COLUMN IF NOT EXISTS "twilioAuthToken" text,
ADD COLUMN IF NOT EXISTS "twilioWhatsAppNumber" text;

-- Update RLS policies if needed (usually existing ones cover updates to new columns)
