import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid token", valid: false },
        { status: 401 },
      );
    }

    return NextResponse.json({ valid: true, decoded });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid token", valid: false },
      { status: 401 },
    );
  }
}
