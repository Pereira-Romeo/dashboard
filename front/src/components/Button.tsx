import { useNavigate, type To } from "react-router-dom";
import "./Button.css"

export type ButtonProps = {
  className?: string;
  variant?: null | "primary" | "secondary" | "danger";
  onClick?: () => void;
  to?: To;
  label?: string;
  icon?: string;
  disabled?: boolean;
};

export function Button({ className, label, variant, disabled, icon, onClick, to }: ButtonProps) {
  const navigate = useNavigate();
  const isIconOnly = icon && !label;

  function handleClick() {
    if (to) {
      navigate(to);
    } else if (onClick) {
      onClick();
    }
  }

  return (
    <button onClick={handleClick} disabled={disabled} className={`button ${isIconOnly ? "avatar-button" : `button-${variant}`} ${className ?? ""}`}>
      {icon && <img src={icon} alt="avatar" className="avatar-image" />}
      {label && <span>{label}</span>}
    </button>
  );
}
