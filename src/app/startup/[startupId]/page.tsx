import { Container } from "@/dsfr/layout/Container";
import { Grid, GridCol } from "@/dsfr/layout/Grid";

import { CommentsPanel } from "../components/CommentsPanel";
import { SnapshotModal } from "../components/SnapshotModal";
import { StandardsList } from "../components/StandardsList";
import { StartupHeader } from "../components/StartupHeader";

interface Props {
  params: Promise<{ startupId: string }>;
}

export default async function StartupPage({ params }: Props) {
  const { startupId } = await params;
  // Server Action stub: will be passed to client components as a Server Action prop
  async function onToggleAction(nextStatus: string, actionId: string) {
    "use server";
    // Dummy implementation: log on server for now. Later: persist with Prisma + AuditLog.
    console.log("[stub] onToggleAction", { actionId, nextStatus, startupId });
    return Promise.resolve();
  }

  return (
    <Container fluid px="4w" py="4w">
      <header>
        <h1>Startup — {startupId}</h1>
        <StartupHeader startupId={startupId} />
      </header>
      <main>
        <Grid haveGutters>
          <GridCol base={12} md={8}>
            <StandardsList startupId={startupId} onToggleAction={onToggleAction} />
          </GridCol>
          <GridCol base={12} md={4}>
            <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <CommentsPanel startupId={startupId} />
              <SnapshotModal startupId={startupId} />
            </aside>
          </GridCol>
        </Grid>
      </main>
    </Container>
  );
}
