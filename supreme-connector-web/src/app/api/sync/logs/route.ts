import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json({ error: "API Key required" }, { status: 401 });
    }

    const connector = await prisma.connector.findUnique({
      where: { apiKey }
    });

    if (!connector) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 403 });
    }

    const { status, recordsProcessed, errorMessage } = await request.json();

    const log = await prisma.syncLog.create({
      data: {
        connectorId: connector.id,
        batchId: uuidv4().substring(0, 8).toUpperCase(),
        status,
        recordsProcessed: recordsProcessed || 0,
        errorMessage: errorMessage || null
      }
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error: any) {
    console.error("Sync Log Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
