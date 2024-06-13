import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { balance } = await req.json();

  if (balance >= 1) {
    const response = NextResponse.json({ success: true });
    cookies().set({
      name: "token",
      value: "test-token",
      path: "/",
    });

    return response;
  } else {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
