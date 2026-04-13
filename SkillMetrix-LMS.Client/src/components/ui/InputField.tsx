import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface InputFieldProps {
  label: string;
  type?: "text" | "email" | "password";
  registration: UseFormRegisterReturn;
  error?: FieldError;
  placeholder?: string;
}

export default function InputField({
  label,
  type = "text",
  registration,
  error,
  placeholder,
}: InputFieldProps) {
  return (
    <div>
      <label className="block mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border rounded px-3 py-2 mb-1"
        {...registration}
      />
      {error && <p className="text-red-500 text-sm mb-3">{error.message}</p>}
    </div>
  );
}
