import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { verifyAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido" },
      { status: 400 },
    );
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email y contraseña requeridos" },
      { status: 400 },
    );
  }

  const admin = await verifyAdmin(email, password);

  if (!admin) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 },
    );
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return NextResponse.json({ error: "Configuración del servidor inválida" }, { status: 500 });
  }

  const sessionToken = jwt.sign(
    {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    jwtSecret,
    { expiresIn: "24h" },
  );

  const response = NextResponse.json({
    success: true,
    admin: { name: admin.name, role: admin.role },
  });

  response.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
