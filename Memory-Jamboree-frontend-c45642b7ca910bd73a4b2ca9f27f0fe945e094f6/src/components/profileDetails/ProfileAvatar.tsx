import { useRef } from "react";
import { Camera } from "lucide-react";
import { API_BASE_URL } from "../../lib/client";

interface ProfileAvatarProps {
  editable?: boolean;
  imageFileName?: string | null;
  onImageChange?: (file: File) => void;
}

const ProfileAvatar = ({ editable = false, imageFileName, onImageChange }: ProfileAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (editable) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  const imageUrl = imageFileName
    ? `${API_BASE_URL}/uploads/${imageFileName}`
    : "https://via.placeholder.com/150";

  return (
    <div className="relative w-28 h-28 rounded-full border-2 border-blue-500 overflow-hidden cursor-pointer group" onClick={handleClick}>
      <img
        src={imageUrl}
        alt="Profile"
        className="w-full h-full object-cover"
      />
      {editable && (
        <div className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full group-hover:scale-110 transition-transform">
          <Camera size={16} className="text-white" />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfileAvatar;
