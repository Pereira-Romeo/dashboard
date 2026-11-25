import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/ui/Header";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import { useSession } from "../context/SessionContext";
import { getErrorMessage } from "../api/client";

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isFormValid = email.trim() !== "" && password !== "";

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header
        buttons={[
          { label: "Connection", variant: "primary", to: "/login" },
          { label: "Sign Up", variant: "secondary", to: "/signup" },
        ]}
      />

      <div className="page">
        <div className="card">
          <h1>Connection</h1>
          <InputField
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email address"
            placeholder="Email address..."
          />
          <InputField
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            placeholder="Password..."
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button
            className="button-group"
            variant="primary"
            label="Connection"
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
          />
          <Button className="button-group" variant="secondary" label="Back" to="/" />
        </div>
      </div>
    </>
  );
}
