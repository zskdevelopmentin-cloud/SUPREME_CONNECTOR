import { NextResponse } from "next/server";
import { db, fieldValue } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const connectorsSnapshot = await db.collection("connectors").where("apiKey", "==", apiKey).limit(1).get();
    if (connectorsSnapshot.empty) return NextResponse.json({ error: "Invalid connector" }, { status: 401 });

    const connectorDoc = connectorsSnapshot.docs[0];
    const body = await request.json();
    const { batch_id, records_processed } = body;

    const logsSnapshot = await db.collection("sync_logs")
      .where("batchId", "==", batch_id)
      .where("connectorId", "==", connectorDoc.id)
      .limit(1)
      .get();

    if (!logsSnapshot.empty) {
      await logsSnapshot.docs[0].ref.update({
        status: "success",
        recordsProcessed: records_processed,
      });
    }

    await connectorDoc.ref.update({
      lastSyncedAt: fieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: "Sync finished successfully" });
  } catch (error: any) {
    console.error("Finish sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
