import { DisplayScreen } from "@/features/display/DisplayScreen";
import { emptyDisplayEvents } from "@/lib/google-calendar.server";

export default function DisplayPage() {
  return <DisplayScreen initialEvents={emptyDisplayEvents()} />;
}
