import { useCallback } from 'react';
import { launchImageLibrary, CameraOptions } from 'react-native-image-picker';

export interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
  size: number;
}

export const useImagePicker = () => {
  const pickImage = useCallback(async (): Promise<ImagePickerResult | null> => {
    return new Promise((resolve) => {
      const options: CameraOptions = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      };

      console.log('📸 Opening image picker...');
      launchImageLibrary(options, (response) => {
        console.log('📸 Image picker response:', response);

        if (response.didCancel) {
          resolve(null);
        } else if (response.errorCode) {
          resolve(null);
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          console.log('✅ Image picked:', asset.uri);
          resolve({
            uri: asset.uri || '',
            type: asset.type || 'image/jpeg',
            name: asset.fileName || 'image.jpg',
            size: asset.fileSize || 0,
          });
        } else {
          resolve(null);
        }
      });
    });
  }, []);

  return { pickImage };
};
