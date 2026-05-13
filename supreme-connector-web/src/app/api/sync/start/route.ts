import { NextResponse } from "next/server";
import { db, fieldValue } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const connectorsSnapshot = await db.collection("connectors").where("apiKey", "==", apiKey).limit(1).get();
    if (connectorsSnapshot.empty) {
      return NextResponse.json({ error: "Invalid connector" }, { status: 401 });
    }

    const connectorDoc = connectorsSnapshot.docs[0];
    const connector = connectorDoc.data();

    if (connector.status !== "active") {
      return NextResponse.json({ error: "Inactive connector" }, { status: 401 });
    }

    const body = await request.json();
    const { connector_id } = body;

    if (connector_id !== connectorDoc.id) {
      return NextResponse.json({ error: "Connector ID mismatch" }, { status: 400 });
    }

    const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await db.collection("sync_logs").add({
      connectorId: connectorDoc.id,
      companyId: connector.companyId,
      batchId: batchId,
      status: "started",
      createdAt: fieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      message: "Sync started",
      batch_id: batchId,
    });
  } catch (error: any) {
    console.error("Start sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
