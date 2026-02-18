import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export const useBiometrics = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsAvailable(compatible);

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType(Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType(Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint');
        }
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const authenticate = useCallback(
    async (promptMessage = 'Authenticate to continue'): Promise<boolean> => {
      try {
        if (!isAvailable || !isEnrolled) {
          return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });

        return result.success;
      } catch (error) {
        console.error('Biometric authentication error:', error);
        return false;
      }
    },
    [isAvailable, isEnrolled]
  );

  return {
    isAvailable,
    isEnrolled,
    biometricType,
    authenticate,
  };
};
