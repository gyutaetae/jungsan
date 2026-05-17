import { NextResponse } from "next/server";

import {
  createServerSupabaseClient,
  hasSupabaseServerConfig,
} from "../../../../lib/db/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json({
      configured: false,
      connected: false,
      message:
        "SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY가 필요합니다.",
    });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({
      configured: false,
      connected: false,
      message: "Supabase 클라이언트를 만들 수 없습니다.",
    });
  }

  const { error } = await supabase.from("businesses").select("id").limit(1);

  if (error) {
    return NextResponse.json(
      {
        configured: true,
        connected: false,
        message: error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    configured: true,
    connected: true,
    message: "Supabase 연결이 활성화되었습니다.",
  });
}
