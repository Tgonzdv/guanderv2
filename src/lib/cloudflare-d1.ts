const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export class CloudflareD1Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudflareD1Error";
  }
}

export async function queryD1<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = []
): Promise<T[]> {
  if (!ACCOUNT_ID || !DATABASE_ID || !API_TOKEN) {
    throw new CloudflareD1Error(
      "No se pudo conectar a Cloudflare D1. Revisa que CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID y CLOUDFLARE_API_TOKEN esten bien configuradas en .env.local."
    );
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new CloudflareD1Error(`Error HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();

  if (!json.success) {
    const msg = json.errors?.map((e: { message: string }) => e.message).join(", ") ?? "Error desconocido";
    throw new CloudflareD1Error(`D1 error: ${msg}`);
  }

  return json.result[0].results as T[];
}
