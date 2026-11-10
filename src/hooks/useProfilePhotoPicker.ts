import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';

import { useI18n } from '@/i18n';
import { useUserData } from '@/context/userdata';

/** Opens the camera (or photo library on web) and saves the URI on the device. */
export function useProfilePhotoPicker() {
  const { tr } = useI18n();
  const { setProfilePhotoUri } = useUserData();

  async function pickProfilePhoto() {
    try {
      if (Platform.OS === 'web') {
        const library = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!library.granted) {
          Alert.alert(tr('settings.photoPermissionTitle'), tr('settings.photoPermissionBody'));
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
        if (!result.canceled && result.assets[0]?.uri) setProfilePhotoUri(result.assets[0].uri);
        return;
      }

      const camera = await ImagePicker.requestCameraPermissionsAsync();
      if (!camera.granted) {
        Alert.alert(tr('settings.photoPermissionTitle'), tr('settings.photoPermissionBody'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]?.uri) setProfilePhotoUri(result.assets[0].uri);
    } catch {
      Alert.alert(tr('common.somethingWrong'));
    }
  }

  return { pickProfilePhoto };
}
