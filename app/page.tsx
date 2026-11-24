import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/v2/types";

export default async function RootPage() {
  const cookieStore = await cookies();
  const saved = cookieStore.get("atlas_locale")?.value;
  const target: Locale =
    saved && (LOCALES as readonly string[]).includes(saved)
      ? (saved as Locale)
      : DEFAULT_LOCALE;
  redirect(`/${target}`);
}
