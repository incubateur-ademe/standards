"use client";

import { RecapCard } from "@/dsfr/base/RecapCard";

import { ActionRow } from "./ActionRow";

interface StandardShape {
  id: string;
  title: string;
  phase?: string;
}

export function StandardCard({
  onToggleAction,
  standard,
  startupId,
}: {
  onToggleAction?: (nextStatus: string, actionId: string) => Promise<void>;
  standard: StandardShape;
  startupId: string;
}) {
  return (
    <RecapCard
      title={standard.title}
      content={
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>Phase: {standard.phase ?? "—"}</div>
          <ActionRow
            action={{ id: `${standard.id}-a1`, title: "Action example" }}
            _startupId={startupId}
            onToggleAction={onToggleAction}
          />
        </div>
      }
    />
  );
}
