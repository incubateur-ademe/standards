"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

const modal = createModal({ id: `snapshot-startup`, isOpenedByDefault: false });

export function SnapshotModal({ startupId }: { startupId: string }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: prefer native `formAction` Server Action when persisting.
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = data.get("name");
    console.log("create snapshot", { name, startupId });
    modal.close();
    form.reset();
  }

  return (
    <div>
      <Button nativeButtonProps={modal.buttonProps}>Créer snapshot</Button>

      <modal.Component title="Créer snapshot" size="small">
        <form onSubmit={handleSubmit} className={cx(fr.cx("fr-text--sm"), "flex flex-col gap-4")}>
          <label htmlFor={`snapshot-name-${startupId}`} className={fr.cx("fr-label")}>
            Nom (optionnel)
          </label>
          <input id={`snapshot-name-${startupId}`} name="name" />

          <div className={"flex gap-2"}>
            <Button nativeButtonProps={{ type: "submit" }}>Créer</Button>
            <Button nativeButtonProps={{ type: "button" }} priority="tertiary no outline" onClick={() => modal.close()}>
              Annuler
            </Button>
          </div>
        </form>
      </modal.Component>
    </div>
  );
}
