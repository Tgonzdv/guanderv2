import { NextRequest, NextResponse } from "next/server";
import { queryD1 } from "@/lib/cloudflare-d1";
import { getStoreOwnerContext } from "@/lib/store-owner-context";

type ServiceInput = {
  idProfessional?: number;
  description?: string;
  address?: string;
  location?: string;
  acceptPoint?: boolean;
  typeServiceId?: number;
  scheduleId?: number;
};

function toSafeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function GET() {
  const auth = await getStoreOwnerContext();
  if (!auth.ok) return auth.response;

  const { context } = auth;

  const [services, serviceTypes, schedules] = await Promise.all([
    queryD1<{
      id_professional: number;
      description: string;
      address: string;
      location: string;
      accept_point: number;
      stars: number;
      fk_type_service: number;
      fk_schedule: number;
      service_name: string;
      schedule_week: string;
      schedule_weekend: string;
      schedule_sunday: string;
    }>(
      `SELECT
        p.id_professional,
        p.description,
        p.address,
        p.location,
        p.accept_point,
        p.stars,
        p.fk_type_service,
        p.fk_schedule,
        ts.name AS service_name,
        sc.week AS schedule_week,
        sc.weekend AS schedule_weekend,
        sc.sunday AS schedule_sunday
      FROM professionals p
      INNER JOIN type_service ts ON ts.id_type_service = p.fk_type_service
      INNER JOIN schedule sc ON sc.id_schedule = p.fk_schedule
      WHERE p.fk_store_sub_id = ?
      ORDER BY p.id_professional DESC`,
      [context.storeSubId],
      { revalidate: false },
    ),
    queryD1<{ id_type_service: number; name: string }>(
      "SELECT id_type_service, name FROM type_service ORDER BY name ASC",
      [],
      { revalidate: false },
    ),
    queryD1<{ id_schedule: number; week: string; weekend: string; sunday: string }>(
      "SELECT id_schedule, week, weekend, sunday FROM schedule ORDER BY id_schedule ASC",
      [],
      { revalidate: false },
    ),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      services,
      serviceTypes,
      schedules,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await getStoreOwnerContext();
  if (!auth.ok) return auth.response;

  const { context } = auth;

  let body: ServiceInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON invalido" }, { status: 400 });
  }

  const description = toSafeText(body.description, 400);
  const address = toSafeText(body.address, 200);
  const location = toSafeText(body.location, 120);
  const typeServiceId = toPositiveInt(body.typeServiceId);
  const scheduleId = toPositiveInt(body.scheduleId);
  const acceptPoint = body.acceptPoint ? 1 : 0;

  if (!description || !typeServiceId || !scheduleId) {
    return NextResponse.json(
      { error: "description, typeServiceId y scheduleId son obligatorios" },
      { status: 400 },
    );
  }

  await queryD1(
    `INSERT INTO professionals (
      description,
      address,
      accept_point,
      location,
      stars,
      fk_schedule,
      fk_type_service,
      fk_user_id,
      fk_store_sub_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      description,
      address || context.storeName,
      acceptPoint,
      location || "0,0",
      0,
      scheduleId,
      typeServiceId,
      context.userId,
      context.storeSubId,
    ],
    { revalidate: false },
  );

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const auth = await getStoreOwnerContext();
  if (!auth.ok) return auth.response;

  const { context } = auth;

  let body: ServiceInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON invalido" }, { status: 400 });
  }

  const idProfessional = toPositiveInt(body.idProfessional);
  const description = toSafeText(body.description, 400);
  const address = toSafeText(body.address, 200);
  const location = toSafeText(body.location, 120);
  const typeServiceId = toPositiveInt(body.typeServiceId);
  const scheduleId = toPositiveInt(body.scheduleId);
  const acceptPoint = body.acceptPoint ? 1 : 0;

  if (!idProfessional || !description || !typeServiceId || !scheduleId) {
    return NextResponse.json(
      { error: "idProfessional, description, typeServiceId y scheduleId son obligatorios" },
      { status: 400 },
    );
  }

  const existing = await queryD1<{ id_professional: number }>(
    `SELECT id_professional
     FROM professionals
     WHERE id_professional = ?
       AND fk_store_sub_id = ?
     LIMIT 1`,
    [idProfessional, context.storeSubId],
    { revalidate: false },
  );

  if (existing.length === 0) {
    return NextResponse.json(
      { error: "Servicio no encontrado o no pertenece a tu local" },
      { status: 404 },
    );
  }

  await queryD1(
    `UPDATE professionals
     SET description = ?,
         address = ?,
         location = ?,
         accept_point = ?,
         fk_type_service = ?,
         fk_schedule = ?
     WHERE id_professional = ?
       AND fk_store_sub_id = ?`,
    [
      description,
      address || context.storeName,
      location || "0,0",
      acceptPoint,
      typeServiceId,
      scheduleId,
      idProfessional,
      context.storeSubId,
    ],
    { revalidate: false },
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await getStoreOwnerContext();
  if (!auth.ok) return auth.response;

  const { context } = auth;

  const { searchParams } = new URL(request.url);
  const idProfessional = toPositiveInt(searchParams.get("idProfessional"));

  if (!idProfessional) {
    return NextResponse.json({ error: "idProfessional es obligatorio" }, { status: 400 });
  }

  const existing = await queryD1<{ id_professional: number }>(
    `SELECT id_professional
     FROM professionals
     WHERE id_professional = ?
       AND fk_store_sub_id = ?
     LIMIT 1`,
    [idProfessional, context.storeSubId],
    { revalidate: false },
  );

  if (existing.length === 0) {
    return NextResponse.json(
      { error: "Servicio no encontrado o no pertenece a tu local" },
      { status: 404 },
    );
  }

  await queryD1(
    `DELETE FROM professionals
     WHERE id_professional = ?
       AND fk_store_sub_id = ?`,
    [idProfessional, context.storeSubId],
    { revalidate: false },
  );

  return NextResponse.json({ success: true });
}
