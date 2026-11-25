import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

export async function verifyMailerConfig(): Promise<void> {
  await transporter.verify();
  console.log("\x1b[36m[APP]\x1b[0m SMTP connection verified");
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.BACKEND_URL}/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Verify your email",
    html: `
      <p>Welcome! Please confirm your email address to activate your account.</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

