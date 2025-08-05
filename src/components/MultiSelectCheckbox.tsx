import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "./ui/button";
import { ChevronDown, Check } from "lucide-react";

type Option = {
  label: string;
  value: string | number;
};

interface ISelectProps {
  placeholder: string;
  options: Option[];
  selectedOptions: (string | number)[];
  onSelectionChange: (selectedValues: (string | number)[]) => void;
}

const MultiSelectCheckbox = forwardRef<HTMLDivElement, ISelectProps>(
  ({ placeholder, options, selectedOptions, onSelectionChange }, forwardedRef) => {
    const innerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(forwardedRef, () => innerRef.current!);

    const [isOpen, setIsOpen] = useState(false);

    const handleSelectChange = (value: string | number) => {
      const newSelection = selectedOptions.includes(value)
        ? selectedOptions.filter((item) => item !== value)
        : [...selectedOptions, value];
      onSelectionChange(newSelection.map(Number)); // ✅ always store numbers
    };

    const getDisplayText = () => {
      if (selectedOptions.length === 0) return placeholder;

      const selectedLabels = options
        .filter((opt) => selectedOptions.includes(opt.value))
        .map((opt) => opt.label);

      return selectedLabels.join(", ");
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          innerRef.current &&
          !innerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="relative w-full" ref={innerRef}>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-between h-10"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate text-left">{getDisplayText()}</span>
          <ChevronDown
            className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>

        {isOpen && (
          <div
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
            style={{
              minHeight: "40px",
              maxHeight: "240px",
              overflowY: "auto",
            }}
          >
            <div className="py-1">
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No options available</div>
              ) : (
                options.map((option, index) => {
                  const isSelected = selectedOptions.includes(option.value);
                  return (
                    <div
                      key={`${option.value}-${index}`}
                      className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer min-h-[32px]"
                      onClick={() => handleSelectChange(option.value)}
                    >
                      <div className="flex items-center justify-center w-4 h-4 mr-2 border border-gray-300 rounded bg-white">
                        {isSelected && (
                          <Check className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                      <span className="text-sm text-gray-900 flex-1">{option.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedOptions.map((val, index) => {
              const option = options.find((opt) => String(opt.value) === String(val));
              return (
                <span
                  key={index}
                  className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded"
                >
                  {option?.label ?? val}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

MultiSelectCheckbox.displayName = "MultiSelectCheckbox";
export default MultiSelectCheckbox;
