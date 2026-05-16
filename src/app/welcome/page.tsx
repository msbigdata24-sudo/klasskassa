import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/** Старый URL после регистрации из Апельсина — ведём в классы. */
export default async function WelcomePage() {
  const user = await getCurrentUser();
  redirect(user ? "/classes/new" : "/register");
}
