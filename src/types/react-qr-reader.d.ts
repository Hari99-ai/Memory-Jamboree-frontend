declare module '@blackbox-vision/react-qr-reader' {
  import * as React from 'react';

  export interface QrReaderProps {
    onResult?: (
      result: { getText(): string } | null,
      error: any | null
    ) => void;
    constraints?: MediaStreamConstraints;
    containerStyle?: React.CSSProperties;
    videoStyle?: React.CSSProperties;
  }

  export const QrReader: React.FC<QrReaderProps>;
}
