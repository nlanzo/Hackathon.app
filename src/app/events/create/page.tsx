import { Navigation } from "@/components/layout/Navigation";
import { EventCreationClient } from "./EventCreationClient";

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showAuthButtons={false} />
      <EventCreationClient />
    </div>
  );
} 