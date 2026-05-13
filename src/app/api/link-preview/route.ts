import { NextResponse, type NextRequest } from "next/server";
import { fetchLinkPreview } from "@/lib/link-preview";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .single();

  if (profile?.status !== "approved") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = request.nextUrl.searchParams.get("url")?.trim();
  if (!url) {
    return NextResponse.json({ error: "missing_url" }, { status: 400 });
  }

  try {
    const preview = await fetchLinkPreview(url);
    return NextResponse.json(preview, {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "preview_unavailable" }, { status: 422 });
  }
}
