import { Header } from "../components/ui/Header";
import { Button } from "../components/Button";

const SITE_NAME = import.meta.env.VITE_SITE_NAME ?? "MonSite";

export function Home() {
  return (
    <>
      <Header />
      <div className="page">
        <div className="card">
          <h1>{SITE_NAME}</h1>
          <div className="button-group">
            <Button label="Connection" variant="primary" to="/login" />
            <Button label="Sign Up" variant="secondary" to="/signup" />
          </div>
        </div>
      </div>
    </>
  );
}