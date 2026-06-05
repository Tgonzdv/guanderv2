import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { queryD1 } from "@/lib/cloudflare-d1";
import { ensureSubPayoutTable, ensureSubPayoutColumns, ensureStoreSubPayoutColumn } from "@/lib/sub-payouts";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await ensureSubPayoutTable();
    await ensureSubPayoutColumns();
    await ensureStoreSubPayoutColumn();
    const payouts = await queryD1(
      `SELECT
         sp.id_sub_payout,
         sp.date,
         sp.amount,
         sp.description,
         sp.proof_url,
         sp.status,
         sp.fk_store_sub,
         sp.fk_user,
         u.username,
         COALESCE(st.name, pr_ts.name, 'Sin nombre') as store_name,
         sub.name as subscription_name
       FROM sub_payout sp
       LEFT JOIN users u ON sp.fk_user = u.id_user
       LEFT JOIN store_sub ssub ON sp.fk_store_sub = ssub.id_store_sub
       LEFT JOIN stores st ON st.fk_store_sub_id = ssub.id_store_sub
       LEFT JOIN professionals pr ON pr.fk_store_sub_id = ssub.id_store_sub
       LEFT JOIN type_service pr_ts ON pr_ts.id_type_service = pr.fk_type_service
       LEFT JOIN subscription sub ON ssub.fk_subscription_id = sub.id_subscription
       GROUP BY sp.id_sub_payout
       ORDER BY sp.id_sub_payout DESC`,
      [],
      { revalidate: false }
    );
    return NextResponse.json({ payouts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await ensureSubPayoutTable();
    await ensureSubPayoutColumns();
    await ensureStoreSubPayoutColumn();
    const { action, id_sub_payout, id_store_sub } = await request.json();

    if (action === "approve") {
      await queryD1(
        "UPDATE sub_payout SET status = 'approved' WHERE id_sub_payout = ?",
        [id_sub_payout]
      );
      // Unlock the store/professional by setting state_payout to 'activo'
      await queryD1(
        "UPDATE store_sub SET state_payout = 'activo' WHERE id_store_sub = ?",
        [id_store_sub]
      );
      revalidatePath("/dashboard/admin/suscripciones");
      revalidatePath("/dashboard/store");
      return NextResponse.json({ success: true, message: "Pago aprobado" });
    } else if (action === "reject") {
      await queryD1(
        "UPDATE sub_payout SET status = 'rejected' WHERE id_sub_payout = ?",
        [id_sub_payout]
      );
      // Allow the store to resubmit by resetting to previous state
      await queryD1(
        "UPDATE store_sub SET state_payout = 'inactivo' WHERE id_store_sub = ?",
        [id_store_sub]
      );
      revalidatePath("/dashboard/admin/suscripciones");
      revalidatePath("/dashboard/store");
      return NextResponse.json({ success: true, message: "Pago rechazado" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
