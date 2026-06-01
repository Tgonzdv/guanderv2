import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import jwt from "jsonwebtoken";

interface AdminSession {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();

  // Primary: check the JWT token cookie used by the main auth system
  const token = cookieStore.get("token")?.value;
  if (token) {
    try {
      const payload = verifyToken(token);
      if (payload && payload.role === "admin") {
        return {
          id: payload.id,
          name: payload.email ?? "Administrador",
          email: payload.email ?? "",
          role: "admin",
        };
      }
    } catch {
      // invalid token, fall through
    }
  }

  // Fallback: legacy admin_session cookie (JWT-signed)
  const session = cookieStore.get("admin_session");
  if (!session) return null;
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    return jwt.verify(session.value, secret) as AdminSession;
  } catch {
    return null;
  }
}

export async function verifyAdmin(
  email: string,
  password: string,
): Promise<AdminSession | null> {
  try {
    const { queryD1 } = await import("./cloudflare-d1");
    const results = await queryD1<{
      id: number;
      name: string;
      email: string;
      role: string;
    }>(
      "SELECT id, name, email, role FROM admin_users WHERE email = ? AND password = ?",
      [email, password],
      { revalidate: false },
    );
    if (results.length > 0) return results[0];
  } catch {
    // Table might not exist yet
  }

  return null;
}
