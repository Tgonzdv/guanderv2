import { NextResponse } from "next/server";
import { queryD1 } from "@/lib/cloudflare-d1";

interface CategoryRow {
  id_category: number;
  name: string;
  description: string;
}

export async function GET() {
  try {
    const categories = await queryD1<CategoryRow>(
      "SELECT id_category, name, description FROM category ORDER BY name ASC",
      [],
      { revalidate: false },
    );
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET /api/store/categories error:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}
