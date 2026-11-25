import type { ErrorRequestHandler } from "express";

export class HttpError extends Error {
    constructor(public status: number, message: string) {
    super(message);
    }
}

//used to overwrite basic throws with clean errors that don't pollute the logs
//and not send the full stack trace to the browser
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Errors raised by Express/body-parser itself (malformed JSON, body too large...) carry a 4xx status
  const status = typeof err?.status === "number" ? err.status : undefined;
  if (status && status >= 400 && status < 500) {
    return res.status(status).json({ error: "Invalid request." });
  }

  console.error(err);
  res.status(500).json({ error: "internal server error" });
};
