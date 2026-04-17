/**
 * use-file-picker.ts
 *
 * Example hook that wraps expo-document-picker and returns callbacks
 * compatible with MultichannelWidget's `pickImage` and `pickDocument` props.
 *
 * You can replace this file with any picker you prefer (react-native-image-picker, etc.)
 * as long as the returned object matches:
 *   { uri: string, type: string | null, name: string | null }
 */
import type { FilePicker } from '@qiscus-community/react-native-multichannel-widget';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback } from 'react';

const DOCUMENT_PICKER_TYPES = ['application/*', 'text/*'] as const;

export function useFilePicker(): {
  pickImage: FilePicker;
  pickDocument: FilePicker;
} {
  const pickOne = useCallback(
    async (type: string | string[]): ReturnType<FilePicker> => {
      const result = await DocumentPicker.getDocumentAsync({
        type,
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return null;

      const file = result.assets?.[0];
      if (!file) return null;

      return {
        uri: file.uri,
        type: file.mimeType ?? null,
        name: file.name ?? null,
      };
    },
    []
  );

  const pickImage: FilePicker = useCallback(async () => {
    return pickOne('image/*');
  }, [pickOne]);

  const pickDocument: FilePicker = useCallback(async () => {
    const file = await pickOne([...DOCUMENT_PICKER_TYPES]);

    // Some providers may still return images despite MIME filter.
    if (file?.type?.startsWith('image/')) return null;
    return file;
  }, [pickOne]);

  return { pickImage, pickDocument };
}
