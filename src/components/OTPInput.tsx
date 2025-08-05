import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function OTPInput({ value, onChange }: OTPInputProps) {
  return (
    <div className="flex flex-col space-y-4">
      <label className="text-sm text-gray-600" htmlFor="otp">Enter OTP</label>
      <InputOTP maxLength={5} className="w-full" value={value} onChange={onChange}>
        <InputOTPGroup className="flex space-x-2 justify-center">
          {[0, 1, 2, 3, 4].map((index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}