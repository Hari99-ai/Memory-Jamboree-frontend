import { QRCodeSVG} from 'qrcode.react';
import { generateSessionId } from '../lib/utils';


export default function QRGenerate() {
  const sessionId = generateSessionId()

  return (
    <div>
      <QRCodeSVG value={`http://192.168.29.88:5173/stream?session=${sessionId}`} size={200}
        bgColor="#ffffff"
        fgColor="#000000"
        />
    </div>
  );
}
