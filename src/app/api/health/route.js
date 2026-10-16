import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "OK",
    framework: "Next.js App Router (Full-Stack)",
    timestamp: new Date().toISOString(),
    message: "Vegnar ERP & CRM Next.js API endpoint active"
  });
}
