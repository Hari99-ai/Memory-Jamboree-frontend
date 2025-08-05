import { Label } from "./ui/label";

// Custom Toggle Switch Component
const ToggleSwitch = ({ 
  enabled, 
  onChange, 
  id = "toggle-switch" 
}: { 
  enabled: boolean; 
  onChange: (enabled: boolean) => void; 
  id?: string 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
        `}
      >
        <span className="sr-only">{enabled ? 'Enabled' : 'Disabled'}</span>
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      <Label htmlFor={id} className="text-sm font-medium">
        {enabled ? "Enabled" : "Disabled"}
      </Label>
    </div>
  );
};


export default ToggleSwitch