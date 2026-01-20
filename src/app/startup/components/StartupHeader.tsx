"use client";

import Button from "@codegouvfr/react-dsfr/Button";

import { SnapshotModal } from "./SnapshotModal";

export function StartupHeader({ startupId }: { startupId: string }) {
  return (
    <header>
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
        <div>
          <h2>Startup {startupId}</h2>
          <p style={{ margin: 0 }}>Résumé rapide et snapshot actions</p>
        </div>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <Button type="button" priority="tertiary no outline">
            Exporter
          </Button>
          <SnapshotModal startupId={startupId} />
        </div>
      </div>
    </header>
  );
}
