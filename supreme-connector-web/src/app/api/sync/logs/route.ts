import { NextResponse } from "next/server";
import { db, fieldValue } from "@/lib/db";
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json({ error: "API Key required" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const connectorSnap = await db.collection("connectors").where("apiKey", "==", apiKey).limit(1).get();

    if (connectorSnap.empty) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 403 });
    }

    const connectorDoc = connectorSnap.docs[0];
    const connector = connectorDoc.data();

    const { status, recordsProcessed, errorMessage } = await request.json();
    const batchId = crypto.randomUUID().substring(0, 8).toUpperCase();

    const logRef = db.collection("sync_logs").doc();
    await logRef.set({
      connectorId: connectorDoc.id,
      companyId: connector.companyId,
      batchId,
      status,
      recordsProcessed: recordsProcessed || 0,
      errorMessage: errorMessage || null,
      createdAt: fieldValue.serverTimestamp()
    });

    return NextResponse.json({ success: true, logId: logRef.id });
  } catch (error: any) {
    console.error("Sync Log Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
