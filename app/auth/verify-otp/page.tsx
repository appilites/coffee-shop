import { redirect } from "next/navigation"

/** Legacy path — auth is link-only now. */
export default function VerifyOtpRedirectPage() {
  redirect("/login")
}
