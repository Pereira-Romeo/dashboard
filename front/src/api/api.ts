import { API_URL, request } from "./client";

export const MIN_NAME_LENGTH = 3;

export const RESEND_COOLDOWN_SECONDS = 60;

export type LoginResponse = {
  token: string;
  name?: string;
  user?: { name?: string };
};

export type Profile = {
  name: string;
  email?: string;
  avatar?: string | null;
};

export function getAvatarUrl(avatar?: string | null): string | undefined {
  return avatar ? `${API_URL}${avatar}?t=${Date.now()}` : undefined;
}

export function signupRequest(email: string, password: string) {
  return request<{ message: string }>("/sign_up", {
    method: "POST",
    body: { email, password },
    auth: false,
    errors: {
      400: "Invalid email or password",
      409: "An account already exists with this email",
    },
    fallback: "Sign up failed",
  });
}

export function resendVerificationRequest(email: string) {
  return request<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: { email },
    auth: false,
    errors: {
      400: "Invalid email address",
      429: "Please wait a moment before requesting another verification email",
    },
    fallback: "Unable to send the verification email",
  });
}

export function loginRequest(email: string, password: string) {
  return request<LoginResponse>("/login", {
    method: "POST",
    body: { email, password },
    auth: false,
    errors: {
      401: "Incorrect email or password",
      403: "Please verify your email before logging in",
    },
    fallback: "Login failed",
  });
}

export function profileRequest() {
  return request<Profile>("/profile", {
    fallback: "Unable to retrieve profile",
  });
}

export function updateProfileRequest(name?: string, avatar?: File) {
  const formData = new FormData();
  if (name) formData.append("name", name);
  if (avatar) formData.append("avatar", avatar);

  return request<unknown>("/profile", {
    method: "PATCH",
    body: formData,
    errors: {
      413: "Image is too large",
      422: "Invalid name or image",
    },
    fallback: "Profile update failed",
  });
}

export function deleteAccount() {
  return request<void>("/destroy", {
    method: "DELETE",
    fallback: "Unable to delete account",
  });
}
