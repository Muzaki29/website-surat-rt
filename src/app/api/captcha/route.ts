import { NextResponse } from "next/server";
import { createMathCaptcha } from "@/lib/captcha";

export async function GET() {
  const captcha = createMathCaptcha();
  return NextResponse.json(captcha);
}
