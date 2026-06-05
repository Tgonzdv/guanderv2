import { NextResponse } from "next/server";
import { queryD1 } from "@/lib/cloudflare-d1";
import { ensureSubscriptionBenefitsColumn } from "@/lib/subscription-benefits";

export async function GET() {
  try {
    await ensureSubscriptionBenefitsColumn();
    const plans = await queryD1(
      "SELECT id_subscription, name, description, plan_benefits, state, amount FROM subscription WHERE state = 'activo' ORDER BY amount ASC",
      [],
      { revalidate: false },
    );
    return NextResponse.json({ success: true, data: plans });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar los planes" }, { status: 500 });
  }
}
