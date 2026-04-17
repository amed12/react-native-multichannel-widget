/**
 * Minimal file descriptor returned by any file/image picker.
 * The library does not depend on any specific picker implementation —
 * consumers can use react-native-document-picker, expo-document-picker,
 * react-native-image-picker, or any equivalent library as long as the
 * result is mapped to this shape before passing to the widget.
 */
export type PickedFile = {
  /** Local URI to the file (use `fileCopyUri` when available for cache safety). */
  uri: string;
  /** MIME type, e.g. "image/jpeg" or "application/pdf". */
  type: string | null;
  /** File name with extension, e.g. "photo.jpg". */
  name: string | null;
};

/**
 * Picker callback type used by AttachmentMenu and MultichannelWidget.
 * Resolve with a PickedFile on success, or null/undefined when the user cancels.
 */
export type FilePicker = () => Promise<PickedFile | null | undefined>;
