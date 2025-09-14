import Toast from 'react-native-toast-message';

export const toastService = {
  success: (title: string, subtitle?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: subtitle,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  error: (title: string, subtitle?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: subtitle,
      position: 'top',
      visibilityTime: 4000,
    });
  },

  info: (title: string, subtitle?: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: subtitle,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  favorite: (title: string, subtitle?: string) => {
    Toast.show({
      type: 'favorite',
      text1: title,
      text2: subtitle,
      position: 'top',
      visibilityTime: 3000,
    });
  },
};

export default toastService;
