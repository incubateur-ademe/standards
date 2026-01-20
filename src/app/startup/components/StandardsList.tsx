"use client";

import { Grid, GridCol } from "@/dsfr/layout/Grid";

import { StandardCard } from "./StandardCard";

export function StandardsList({
  onToggleAction,
  startupId,
}: {
  onToggleAction?: (nextStatus: string, actionId: string) => Promise<void>;
  startupId: string;
}) {
  // TODO: fetch server data via props / server component
  const dummy = [
    { id: "std-1", phase: "phase-1", title: "Standard 1" },
    { id: "std-2", phase: "phase-1", title: "Standard 2" },
    { id: "std-3", phase: "phase-2", title: "Standard 3" },
    { id: "std-4", phase: "phase-2", title: "Standard 4" },
  ];

  return (
    <section>
      <h3>Standards</h3>
      <Grid haveGutters>
        {dummy.map(s => (
          <GridCol key={s.id} base={12} md={6}>
            <StandardCard standard={s} startupId={startupId} onToggleAction={onToggleAction} />
          </GridCol>
        ))}
      </Grid>
    </section>
  );
}
