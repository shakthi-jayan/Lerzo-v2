import React from 'react';
import { MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';

interface WhatsAppButtonProps {
    phone: string;
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'icon' | 'button' | 'text';
    label?: string;
    className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
    phone,
    message,
    size = 'md',
    variant = 'icon',
    label = 'WhatsApp',
    className = ''
}) => {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        openWhatsApp(phone, message);
    };

    // Size classes
    const sizeClasses = {
        sm: 'w-7 h-7 p-1.5',
        md: 'w-9 h-9 p-2',
        lg: 'w-11 h-11 p-2.5'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    // Icon-only button
    if (variant === 'icon') {
        return (
            <button
                onClick={handleClick}
                className={`${sizeClasses[size]} rounded-full bg-green-500 hover:bg-green-600 text-white transition-all hover:scale-110 flex items-center justify-center shadow-sm hover:shadow-md ${className}`}
                title={`Send WhatsApp to ${phone}`}
            >
                <MessageCircle className={iconSizes[size]} />
            </button>
        );
    }

    // Full button with text
    if (variant === 'button') {
        return (
            <button
                onClick={handleClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors shadow-sm hover:shadow-md ${className}`}
            >
                <MessageCircle className={iconSizes[size]} />
                <span>{label}</span>
            </button>
        );
    }

    // Text link style
    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium transition-colors ${className}`}
        >
            <MessageCircle className={iconSizes[size]} />
            <span className="text-sm">{label}</span>
        </button>
    );
};
