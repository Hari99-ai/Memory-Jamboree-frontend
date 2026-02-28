// import React, { useCallback, useState } from "react";
// import Cropper from "react-easy-crop";
// import Slider from "@mui/material/Slider";
// import Modal from "@mui/material/Modal";
// import Box from "@mui/material/Box";

// type Props = {
//   open: boolean;
//   imageSrc: string;
//   onClose: () => void;
//   onCropComplete: (croppedBlob: Blob) => void;
// };

// const createImage = (url: string): Promise<HTMLImageElement> =>
//   new Promise((resolve, reject) => {
//     const image = new window.Image();
//     image.addEventListener("load", () => resolve(image));
//     image.addEventListener("error", (error) => reject(error));
//     image.setAttribute("crossOrigin", "anonymous"); // needed for cross-origin images
//     image.src = url;
//   });

// // Utility to get cropped image blob
// async function getCroppedImg(imageSrc: string, crop: any, zoom: number) {
//   const image = await createImage(imageSrc);
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");

//   const scaleX = image.naturalWidth / image.width;
//   const scaleY = image.naturalHeight / image.height;

//   canvas.width = crop.width;
//   canvas.height = crop.height;

//   ctx?.drawImage(
//     image,
//     crop.x * scaleX,
//     crop.y * scaleY,
//     crop.width * scaleX,
//     crop.height * scaleY,
//     0,
//     0,
//     crop.width,
//     crop.height
//   );

//   return new Promise<Blob>((resolve, reject) => {
//     canvas.toBlob((blob) => {
//       if (blob) resolve(blob);
//       else reject(new Error("Canvas is empty"));
//     }, "image/jpeg");
//   });
// }

// export default function ImageCropperModal({
//   open,
//   imageSrc,
//   onClose,
//   onCropComplete,
// }: Props) {
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

//   const onCropCompleteHandler = useCallback((_: any, croppedAreaPixels: any) => {
//     setCroppedAreaPixels(croppedAreaPixels);
//   }, []);

//   const handleDone = async () => {
//     if (!croppedAreaPixels) return;
//     const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, zoom);
//     onCropComplete(croppedBlob);
//     onClose();
//   };

//   return (
//     <Modal open={open} onClose={onClose}>
//       <Box
//         sx={{
//           position: "absolute",
//           top: "50%",
//           left: "50%",
//           transform: "translate(-50%, -50%)",
//           width: 350,
//           bgcolor: "background.paper",
//           boxShadow: 24,
//           p: 2,
//           borderRadius: 2,
//         }}
//       >
//         <div style={{ position: "relative", width: "100%", height: 250, background: "#333" }}>
//           <Cropper
//             image={imageSrc}
//             crop={crop}
//             zoom={zoom}
//             aspect={1}
//             onCropChange={setCrop}
//             onZoomChange={setZoom}
//             onCropComplete={onCropCompleteHandler}
//           />
//         </div>
//         <Slider
//           value={zoom}
//           min={1}
//           max={3}
//           step={0.1}
//           onChange={(_, value) => setZoom(value as number)}
//           sx={{ mt: 2 }}
//         />
//         <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
//           <button onClick={onClose} style={{ marginRight: 8 }}>Cancel</button>
//           <button onClick={handleDone} style={{ background: "#245cab", color: "#fff", padding: "6px 16px", borderRadius: 4 }}>
//             Crop & Save
//           </button>
//         </div>
//       </Box>
//     </Modal>
//   );
// }



import { useCallback, useState } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import Slider from "@mui/material/Slider";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

type Props = {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

// Utility to get cropped image blob
async function getCroppedImg(imageSrc: string, crop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx?.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas is empty"));
    }, "image/jpeg");
  });
}

export default function ImageCropperModal({
  open,
  imageSrc,
  onClose,
  onCropComplete,
}: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteHandler = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedBlob);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 350,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 2,
          borderRadius: 2,
        }}
      >
        <div style={{ position: "relative", width: "100%", height: 250, background: "#333" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteHandler}
          />
        </div>
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          onChange={(_, value) => setZoom(value as number)}
          sx={{ mt: 2 }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose} style={{ marginRight: 8 }}>Cancel</button>
          <button onClick={handleDone} style={{ background: "#245cab", color: "#fff", padding: "6px 16px", borderRadius: 4 }}>
            Crop & Save
          </button>
        </div>
      </Box>
    </Modal>
  );
}
