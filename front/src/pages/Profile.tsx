import { useEffect, useState } from "react";
import { Header } from "../components/ui/Header";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import { useSession } from "../context/SessionContext";
import { MIN_NAME_LENGTH, deleteAccount, getAvatarUrl, profileRequest, updateProfileRequest } from "../api/api";
import { ApiError, getErrorMessage } from "../api/client";
import { githubConnectUrlRequest, steamConnectUrlRequest } from "../api/services";
import defaultAvatar from "../assets/defaultPP.jpg";
import "./Profile.css";

export function Profile() {
  const { user, login, logout } = useSession();

  const [preview, setPreview] = useState<string>(defaultAvatar);
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleError(err: unknown, fallback: string) {
    if (err instanceof ApiError && err.status === 401) {
      logout();
      return;
    }
    setError(getErrorMessage(err, fallback));
  }

  useEffect(() => {
    let cancelled = false;

    profileRequest()
      .then((profile) => {
        if (cancelled) return;
        setName(profile.name ?? "");
        setSavedName(profile.name ?? "");
        const url = getAvatarUrl(profile.avatar);
        if (url) setPreview(url);
      })
      .catch((err) => {
        if (!cancelled) handleError(err, "Unable to retrieve profile");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    const previousPreview = preview;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setError(null);

    try {
      await updateProfileRequest(undefined, file);
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setPreview(previousPreview);
      handleError(err, "Unable to update picture");
    } finally {
      input.value = "";
    }
  }

  async function saveName() {
    const newName = name.trim();

    if (newName === savedName) {
      setName(savedName);
      return;
    }

    if (newName.length < MIN_NAME_LENGTH) {
      setName(savedName);
      setError(`Name must be at least ${MIN_NAME_LENGTH} characters long`);
      return;
    }

    setError(null);
    try {
      await updateProfileRequest(newName);
      setName(newName);
      setSavedName(newName);
      if (user) login({ ...user, name: newName });
    } catch (err) {
      setName(savedName);
      handleError(err, "Unable to update name");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete your account? This cannot be undone.")) return;

    setError(null);
    try {
      await deleteAccount();
      logout();
    } catch (err) {
      handleError(err, "Unable to delete account");
    }
  }

  async function handleConnect(getUrl: () => Promise<string>) {
    setError(null);
    try {
      window.location.href = await getUrl();
    } catch (err) {
      handleError(err, "Unable to start connection");
    }
  }

  return (
    <>
      <Header buttons={[{ label: "Dashboard", to: "/dashboard" }]} />

      <div className="page">
        <div className="card">
          <h1>My Profile</h1>

          <div className="avatar-wrapper">
            <label htmlFor="photo-upload" className="avatar-clickable">
              <img src={preview} alt="avatar" className="avatar-image" />
              <span className="avatar-edit-badge">✏️</span>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="avatar-input"
            />
          </div>

          <div className="fields">
            <InputField
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              className="input-field"
            />
          </div>

          <div className="section-divider">
            <span>Accounts</span>
          </div>

          <div className="fields">
            <Button
              label="Connect to GitHub"
              variant="secondary"
              onClick={() => handleConnect(githubConnectUrlRequest)}
            />
            <Button
              label="Connect to Steam"
              variant="secondary"
              onClick={() => handleConnect(steamConnectUrlRequest)}
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="button-group">
            <Button variant="secondary" label="Cancel" to="/dashboard" />
            <Button variant="danger" label="Delete profile" onClick={handleDelete} />
          </div>
        </div>
      </div>
    </>
  );
}
