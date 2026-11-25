import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/ui/Header";
import { InputField } from "../components/InputField";
import { Button } from "../components/Button";
import { useSession } from "../context/SessionContext";
import { MIN_NAME_LENGTH, updateProfileRequest } from "../api/api";
import { getErrorMessage } from "../api/client";
import defaultAvatar from "../assets/defaultPP.jpg";

export function Account() {
  const navigate = useNavigate();
  const { user, login } = useSession();

  const [username, setUsername] = useState("");
  const [picture, setPicture] = useState<File | undefined>(undefined);
  const [preview, setPreview] = useState<string>(defaultAvatar);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isFormValid = username.length >= MIN_NAME_LENGTH;

  function handlePictureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicture(file);
    setPreview(URL.createObjectURL(file));
  }

  async function finishSignUp() {
    setError(null);
    setLoading(true);
    try {
      await updateProfileRequest(username, picture);
      if (user) login({ ...user, name: username });
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to complete sign up"));
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
          <h1>Sign Up</h1>
          <InputField
            type="file"
            accept="image/*"
            onChange={handlePictureChange}
            preview={preview}
          />
          <InputField
            type="text"
            label="Username"
            placeholder="Username..."
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            helperText={`Need at least ${MIN_NAME_LENGTH} characters`}
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button
            className="button-group"
            variant="primary"
            label="Validate"
            onClick={finishSignUp}
            disabled={!isFormValid || loading}
          />
          <Button
            className="button-group"
            variant="secondary"
            label="Back"
            onClick={() => navigate("/signup")}
          />
        </div>
      </div>
    </>
  );
}
