import { useId } from "react";
import "./InputField.css";

export type SelectFieldProps = {
  label?: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  helperText?: string;
};

export function SelectField({ label, value, options, onChange, helperText }: SelectFieldProps) {
  const id = useId();

  return (
    <div className="input-field">
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} value={value} onChange={onChange}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText && <p className="helperText">{helperText}</p>}
    </div>
  );
}
