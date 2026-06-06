import { NextRequest, NextResponse } from "next/server";
import { queryD1 } from "@/lib/cloudflare-d1";
import { getStoreOwnerContext } from "@/lib/store-owner-context";

function toSafeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  const auth = await getStoreOwnerContext();
  if (!auth.ok) return auth.response;

  const { context } = auth;
  const isProf = context.role === "professional" && !!context.professionalId;
  const ownerId = isProf ? context.professionalId : context.storeId;

  let body: { codeCoupon?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON invalido" }, { status: 400 });
  }

  const codeCoupon = toSafeText(body.codeCoupon, 80);
  if (!codeCoupon) {
    return NextResponse.json(
      { error: "codeCoupon es obligatorio" },
      { status: 400 },
    );
  }

  if (!ownerId) {
    return NextResponse.json(
      { error: "No se encontro un local o profesional asociado al usuario" },
      { status: 404 },
    );
  }

  try {
    // coupon_store tiene columna `state` (1 = activo).
    // coupon_prof no la tiene — usamos el join con coupon_state.
    const rows = isProf
      ? await queryD1<{
          id_coupon: number;
          name: string;
          description: string;
          amount: number;
          code_coupon: string;
          expiration_date: string;
        }>(
          `SELECT cp.id_coupon, cp.name, cp.description, cp.amount,
                  cp.code_coupon, cp.expiration_date
           FROM coupon_prof cp
           INNER JOIN coupon_state cst ON cst.id_coupon_state = cp.fk_coupon_state
           WHERE cp.code_coupon = ?
             AND cp.fk_professional_id = ?
             AND LOWER(cst.name) IN ('activo', 'active')
             AND DATE(cp.expiration_date) >= DATE('now')
           LIMIT 1`,
          [codeCoupon, ownerId],
          { revalidate: false },
        )
      : await queryD1<{
          id_coupon: number;
          name: string;
          description: string;
          amount: number;
          code_coupon: string;
          expiration_date: string;
        }>(
          `SELECT cs.id_coupon, cs.name, cs.description, cs.amount,
                  cs.code_coupon, cs.expiration_date
           FROM coupon_store cs
           WHERE cs.code_coupon = ?
             AND cs.fk_store = ?
             AND cs.state = 1
             AND DATE(cs.expiration_date) >= DATE('now')
           LIMIT 1`,
          [codeCoupon, ownerId],
          { revalidate: false },
        );

    const coupon = rows[0];
    if (!coupon) {
      return NextResponse.json(
        { error: "Codigo de cupon invalido o expirado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id_coupon: coupon.id_coupon,
        name: coupon.name,
        description: coupon.description,
        amount: coupon.amount,
        code_coupon: coupon.code_coupon,
        expiration_date: coupon.expiration_date,
      },
    });
  } catch (error) {
    console.error("POST /api/store/coupons/validate error:", error);
    return NextResponse.json(
      { error: "No se pudo validar el cupon" },
      { status: 500 },
    );
  }
}
