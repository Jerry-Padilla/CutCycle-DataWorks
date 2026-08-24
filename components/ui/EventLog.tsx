"use client";

import { useFactoryStore } from "@/store/useFactoryStore";

export function EventLog({ limit }: { limit?: number }) {
  const events = useFactoryStore((state) => state.events);
  return (
    <div className="event-list" aria-label="Production event log">
      {events.slice(0, limit).map((event) => (
        <div className="event-item" key={event.id}>
          <time className="event-time" dateTime={new Date(event.timestamp).toISOString()}>{new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}</time>
          <span className={`event-dot ${event.severity}`} />
          <span className="event-message">{event.message}</span>
        </div>
      ))}
    </div>
  );
}
