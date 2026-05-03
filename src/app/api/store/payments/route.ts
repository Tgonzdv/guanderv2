import { NextResponse } from "next/server";
import { queryD1 } from "@/lib/cloudflare-d1";
import { getStoreOwnerContext } from "@/lib/store-owner-context";

export async function GET() {
  try {
    const authContext = await getStoreOwnerContext();
    if (!authContext.ok) {
      return authContext.response;
    }
    const { storeSubId } = authContext.context;

    if (!storeSubId) {
      return NextResponse.json({ payments: [] });
    }

    const payments = await queryD1<{
      id_sub_payout: number;
      date: string;
      amount: number;
      description: string | null;
      status: string;
      proof_url: string | null;
    }>(
      `SELECT id_sub_payout, date, amount, description, status, proof_url
       FROM sub_payout
       WHERE fk_store_sub = ?
       ORDER BY date DESC
       LIMIT 50`,
      [storeSubId],
      { revalidate: false },
    );

    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Error interno" }, { status: 500 });
  }
}
