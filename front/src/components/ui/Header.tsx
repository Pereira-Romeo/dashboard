import { Button, type ButtonProps } from "../Button";
import { useSession} from "../../context/SessionContext";
import "./Header.css"

type HeaderProps = {
  buttons?: ButtonProps[];
};

export function Header({buttons }: HeaderProps) {
  const siteName = import.meta.env.VITE_SITE_NAME ?? "MonSite";
  const { logout } = useSession();

  return (
    <header className="header">
      <Button className="header-logo" label={siteName} onClick={logout}/>
      <div className="header-buttons">
        {buttons?.map((btn, index) => (
          <Button key={index} {...btn} />
        ))}
      </div>
    </header>
  );
}
