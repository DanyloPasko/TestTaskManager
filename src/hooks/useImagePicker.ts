import { useCallback } from 'react';
import { launchImageLibrary, CameraOptions } from 'react-native-image-picker';

export interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
  size: number;
}

/**
 * Hook for picking images from device gallery
 */
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
          console.log('📸 Image picker cancelled');
          resolve(null);
        } else if (response.errorCode) {
          console.error('❌ Image picker error:', response.errorCode, response.errorMessage);
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
          console.log('📸 No asset found in response');
          resolve(null);
        }
      });
    });
  }, []);

  return { pickImage };
};

/**
 * Hook for uploading images to Firebase Storage
 */
export const useImageUpload = () => {
  const uploadImage = useCallback(async (imageUri: string, taskId: string): Promise<string> => {
    try {
      console.log('📤 Uploading image for task:', taskId);
      // This will be integrated with firestoreService.uploadImage
      // For now, we'll just return the URI
      return imageUri;
    } catch (error) {
      console.error('❌ Failed to upload image:', error);
      throw error;
    }
  }, []);

  return { uploadImage };
};

/**
 * Hook for deleting images from Firebase Storage
 */
export const useImageDelete = () => {
  const deleteImage = useCallback(async (imageUrl: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting image:', imageUrl);
      // This will be integrated with firestoreService.deleteImage
      // For now, we'll just log it
    } catch (error) {
      console.error('❌ Failed to delete image:', error);
      throw error;
    }
  }, []);

  return { deleteImage };
};
