import { queryD1 } from "@/lib/cloudflare-d1";

export async function ensureTypeServiceNoDuplicates(): Promise<void> {
  const all = await queryD1<{ id_type_service: number; name: string }>(
    "SELECT id_type_service, name FROM type_service",
    [],
    { revalidate: false },
  );

  const groups = new Map<string, number[]>();
  for (const row of all) {
    const key = (row.name ?? "").trim().toLowerCase();
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(row.id_type_service);
    groups.set(key, list);
  }

  for (const ids of groups.values()) {
    if (ids.length <= 1) continue;
    ids.sort((a, b) => a - b);
    const keepId = ids[0];
    const dupIds = ids.slice(1);

    for (const dupId of dupIds) {
      const refs = await queryD1<{ c: number }>(
        "SELECT COUNT(*) as c FROM professionals WHERE fk_type_service = ?",
        [dupId],
        { revalidate: false },
      );
      if ((refs[0]?.c ?? 0) > 0) {
        await queryD1(
          "UPDATE professionals SET fk_type_service = ? WHERE fk_type_service = ?",
          [keepId, dupId],
          { revalidate: false },
        );
      }
      await queryD1(
        "DELETE FROM type_service WHERE id_type_service = ?",
        [dupId],
        { revalidate: false },
      );
    }
  }
}
