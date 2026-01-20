"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { useState } from "react";

export function CommentsPanel({ startupId }: { startupId: string }) {
  const [text, setText] = useState("");
  const [list, setList] = useState<Array<{ id: string; text: string }>>([]);

  async function addComment() {
    if (!text.trim()) return;
    // stub: push locally
    const c = { id: String(Date.now()), text };
    setList(s => [c, ...s]);
    setText("");
    // TODO: wire to server action/comments persistence
  }

  return (
    <aside>
      <h4>Commentaires</h4>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={3} />
      <div style={{ marginTop: 8 }}>
        <Button nativeButtonProps={{ type: "button" }} onClick={addComment}>
          Ajouter
        </Button>
      </div>
      <ul style={{ marginTop: 12 }}>
        {list.map(c => (
          <li key={c.id}>{c.text}</li>
        ))}
      </ul>
    </aside>
  );
}
