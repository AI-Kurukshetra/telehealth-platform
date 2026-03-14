import { NextResponse } from "next/server";

import { markConversationAsRead } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { otherUserId?: string };

    if (!payload.otherUserId) {
      return NextResponse.json(
        { error: "Conversation participant is required." },
        { status: 400 }
      );
    }

    await markConversationAsRead(payload.otherUserId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to mark messages as read." },
      { status: 500 }
    );
  }
}
