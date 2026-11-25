import { useId } from "react";
import "./InputField.css"

export type InputFieldProps = {
    label?: string;
    className?: string;
    type: string;
    placeholder?: string;
    value?: string;
    accept?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    helperText?: string;  
    preview?: string;
};

export function InputField({ label, type, placeholder, value, accept, onChange, onBlur, helperText, preview }: InputFieldProps) {
  const id = useId();

  if (type === "file" && preview) {
    return (
      <div className="avatar-wrapper">
        <label htmlFor={id} className="avatar-clickable">
          <img src={preview} alt={label ?? "Photo"} className="avatar-image" />
          <span className="avatar-edit-badge">✏️</span>
        </label>
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={onChange}
          className="avatar-input"
        />
      </div>
    );
  }

  return (
    <div className="input-field">
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        accept={accept}
        onChange={onChange}
        onBlur={onBlur}
        value={type !== "file" ? value : undefined}
      />
      {helperText && <p className="helperText">{helperText}</p>}
    </div>
  );
}
