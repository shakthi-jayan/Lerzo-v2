import { useState, useCallback } from 'react';
import { AlertType } from '../components/AlertModal';

interface AlertState {
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
}

export const useAlert = () => {
    const [alert, setAlert] = useState<AlertState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showAlert = useCallback((title: string, message: string, type: AlertType = 'info') => {
        setAlert({
            isOpen: true,
            title,
            message,
            type
        });
    }, []);

    const closeAlert = useCallback(() => {
        setAlert(prev => ({ ...prev, isOpen: false }));
    }, []);

    return {
        alert,
        showAlert,
        closeAlert
    };
};
