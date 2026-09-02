// The password reset is a single three-step flow (email -> code -> new
// password). /reset-password?email=... deep-links straight to the code step.
import ForgotPassword from "./ForgotPassword";

export default function ResetPassword() {
  return <ForgotPassword />;
}
