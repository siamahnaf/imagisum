import { permanentRedirect } from "next/navigation";

// Every request is caught by the catch-all redirect in next.config.ts, so this
// page is only a fallback in case that config is ever bypassed.
export default function Page() {
  permanentRedirect("https://imagisum.netlify.app");
}
