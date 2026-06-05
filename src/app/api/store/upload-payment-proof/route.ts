import { NextResponse } from "next/server";
import { queryD1 } from "@/lib/cloudflare-d1";
import { getStoreOwnerContext } from "@/lib/store-owner-context";
import { ensureSubPayoutTable, ensureStoreSubPayoutColumn, ensureSubPayoutColumns } from "@/lib/sub-payouts";

export async function POST(request: Request) {
  try {
    const authContext = await getStoreOwnerContext();
    if (!authContext.ok) {
      return authContext.response;
    }
    const { storeSubId, userId } = authContext.context;
    
    let base64File = "";
    let paymentAmount = 0;
    let paymentDate = new Date().toISOString().slice(0, 10);
    let paymentDescription = "Suscripción - Carga Manual";
    let requestedSubscriptionId: number | null = null;

    // Accept JSON body with Cloudinary URL (preferred) or legacy base64 FormData
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json() as {
        proofUrl?: string;
        paymentProof?: string;
        amount?: number;
        date?: string;
        planId?: string | number | null;
        planName?: string | null;
      };
      base64File = body.proofUrl ?? body.paymentProof ?? "";
      if (body.amount != null) paymentAmount = body.amount;
      if (body.date) paymentDate = body.date;
      if (body.planName) paymentDescription = body.planName;
      else if (body.planId) paymentDescription = `Plan ID:${body.planId}`;
      if (body.planId != null && body.planId !== "") {
        const n = Number(body.planId);
        if (Number.isInteger(n) && n > 0) requestedSubscriptionId = n;
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64File = `data:${file.type};base64,${buffer.toString("base64")}`;
      }
      const amountStr = formData.get("amount") as string | null;
      if (amountStr) paymentAmount = parseFloat(amountStr) || 0;
      const dateStr = formData.get("date") as string | null;
      if (dateStr) paymentDate = dateStr;
      const planId = formData.get("planId") as string | null;
      if (planId) paymentDescription = `Plan ID:${planId}`;
      if (planId) {
        const n = Number(planId);
        if (Number.isInteger(n) && n > 0) requestedSubscriptionId = n;
      }
    }

    if (!base64File) {
      return NextResponse.json(
        { error: "No se proporcionó un archivo válido." },
        { status: 400 }
      );
    }

    

    if (!storeSubId) {
        return NextResponse.json({ error: "No hay una suscripción activa." }, { status: 400 });
    }

    await ensureSubPayoutTable();
    await ensureSubPayoutColumns();
    await ensureStoreSubPayoutColumn();

    // Insert into sub_payout to queue approval process for admin
    await queryD1(
      `INSERT INTO sub_payout (date, amount, description, proof_url, status, fk_store_sub, fk_user, fk_subscription_id)
       VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [paymentDate, paymentAmount, paymentDescription, base64File, storeSubId, userId, requestedSubscriptionId]
    );

    // Save proof URL — state_payout stays as-is until admin approves
    await queryD1(
      `UPDATE store_sub 
       SET payment_proof = ?
       WHERE id_store_sub = ?`,
      [base64File, storeSubId]
    );

    return NextResponse.json({ success: true, message: "Comprobante subido correctamente." });
  } catch (error: any) {
    console.error("Error al subir comprobante:", error);
    return NextResponse.json(
      { error: error?.message ?? "Error interno del servidor" },
      { status: 500 }
    );
  }
}
