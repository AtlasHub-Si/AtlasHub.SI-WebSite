import { permanentRedirect } from "next/navigation";

export default function LegacyAcademyPage() {
  permanentRedirect("/pt/programs-and-communities");
}
