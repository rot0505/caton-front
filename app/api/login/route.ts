import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { address } = await req.json();
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;

  if (address === adminWallet) {
    cookies().set({
      name: "caton-token",
      value: "admin",
    });
  } else {
    cookies().set({
      name: "caton-token",
      value: "user",
    });
  }
  const response = NextResponse.json({
    success: true,
    isAdmin: address === adminWallet,
  });

  return response;
}
