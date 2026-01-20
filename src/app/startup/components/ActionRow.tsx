"use client";

import { useState } from "react";

export function ActionRow({
  _startupId,
  action,
  onToggleAction,
}: {
  _startupId?: string;
  action: { id: string; title?: string };
  onToggleAction?: (nextStatus: string, actionId: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<string>("todo");
  const [loading, setLoading] = useState(false);

  async function toggleDone() {
    setLoading(true);
    const next = status === "done" ? "todo" : "done";
    try {
      if (onToggleAction) {
        await onToggleAction(next, action.id);
      } else {
        // fallback: local-only toggle (no external API calls)
        // the app should provide a server action or handler to persist
        console.warn("No onToggle handler provided; not persisting status.");
      }
      setStatus(next);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
      <span>{action.title}</span>
      <button type="button" onClick={toggleDone} disabled={loading}>
        {status === "done" ? "✔️ Done" : "Mark done"}
      </button>
    </div>
  );
}
