import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  leftLabel?: string;
  rightLabel?: string;
  middleLabel?: string;
}

export function LikertScale({
  value,
  onChange,
  disabled = false,
  leftLabel = "This does not sound like me",
  rightLabel = "This sounds like me",
  middleLabel = "Neutral",
}: LikertScaleProps) {
  const handleChange = (newValue: string) => {
    onChange(parseInt(newValue));
  };

  return (
    <div className="w-full space-y-3">
      <RadioGroup
        value={value?.toString() || ""}
        onValueChange={handleChange}
        disabled={disabled}
        className="flex justify-between items-center"
      >
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <div key={num} className="flex flex-col items-center min-w-[40px]">
            <RadioGroupItem
              value={num.toString()}
              id={`likert-${num}`}
              className="h-4 w-4"
            />
            <Label
              htmlFor={`likert-${num}`}
              className="text-xs text-gray-600 mt-1 cursor-pointer"
            >
              {num}
            </Label>
            <div className="min-h-[3rem]">
              {(num === 1 || num === 4 || num === 7) && (
                <Label
                  htmlFor={`likert-${num}`}
                  className="text-[10px] text-gray-600 text-center cursor-pointer block max-w-[60px] leading-tight"
                >
                  {num === 1 ? leftLabel : num === 4 ? middleLabel : rightLabel}
                </Label>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
