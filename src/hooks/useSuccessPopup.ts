import { useState } from 'react';

export const useSuccessPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  const showSuccess = (successMessage: string) => {
    setMessage(successMessage);
    setIsVisible(true);
  };

  const hideSuccess = () => {
    setIsVisible(false);
    setMessage('');
  };

  return {
    isVisible,
    message,
    showSuccess,
    hideSuccess,
  };
}; 