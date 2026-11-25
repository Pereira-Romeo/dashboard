import { useEffect, useState } from "react";
import { Header } from "../components/ui/Header";
import { InputField } from "../components/InputField";
import { Button } from "../components/Button";
import { RESEND_COOLDOWN_SECONDS, resendVerificationRequest, signupRequest } from "../api/api";
import { getErrorMessage } from "../api/client";

const MIN_PASSWORD_LENGTH = 8;

function VerifyEmailNotice({ email }: { email: string }) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [sending, setSending] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function handleResend() {
    setInfo(null);
    setError(null);
    setSending(true);
    try {
      await resendVerificationRequest(email);
      setInfo("A new verification email has been sent.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to send the verification email"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card">
      <h1>Check your email</h1>
      <p className="form-info">
        Your account has been created. We sent a verification link to{" "}
        <strong>{email}</strong>. Click it to activate your account, then log in.
      </p>

      {info && (
        <p className="form-info" role="status">
          {info}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <Button
        className="button-group"
        variant="secondary"
        label={cooldown > 0 ? `Resend email (${cooldown}s)` : "Resend email"}
        onClick={handleResend}
        disabled={cooldown > 0 || sending}
      />
      <Button className="button-group" variant="primary" label="Go to login" to="/login" />
    </div>
  );
}

export function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifPassword, setVerifPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);

  let validationError: string | null = null;
  if (password !== "" && password.length < MIN_PASSWORD_LENGTH) {
    validationError = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
  } else if (verifPassword !== "" && verifPassword !== password) {
    validationError = "Passwords do not match";
  }

  const isFormValid =
    email.trim() !== "" &&
    password.length >= MIN_PASSWORD_LENGTH &&
    verifPassword === password;

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      await signupRequest(cleanEmail, password);
      setCreatedEmail(cleanEmail);
    } catch (err) {
      setError(getErrorMessage(err, "Sign up failed"));
    } finally {
      setLoading(false);
    }
  }

  const message = validationError ?? error;

  return (
    <>
      <Header buttons={[
        { label: "Connection", variant: "secondary", to: "/login" },
        { label: "Sign Up", variant: "primary", to: "/signup" }
        ]}
      />

      <div className="page">
        {createdEmail ? (
          <VerifyEmailNotice email={createdEmail} />
        ) : (
          <div className="card">
            <h1>Sign Up</h1>
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
              helperText="Need at least 8 characters"
            />
            <InputField
              type="password"
              value={verifPassword}
              onChange={(e) => setVerifPassword(e.target.value)}
              label="Password verification"
              placeholder="Password verification..."
            />
            {message && (
              <p className="form-error" role="alert">
                {message}
              </p>
            )}
            <Button
              className="button-group"
              variant="primary"
              label="Sign Up"
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
            />
            <Button className="button-group" variant="secondary" label="Back" to="/" />
          </div>
        )}
      </div>
    </>
  );
}
