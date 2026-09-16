import { SignUpForm } from "./signup-form";

export default function SignUpPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return <SignUpForm googleEnabled={googleEnabled} />;
}
