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

    const body = await request.json();
    const { company_id, connector_id, batch_id, data } = body;

    if (connector_id !== connectorDoc.id || company_id !== connector.companyId) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }

    const batch = db.batch();
    
    // Max 500 writes per batch in Firestore. For MVP we assume data sets are < 500 items,
    // or we can slice them. We will just add them.
    let count = 0;

    if (data.parties) {
      for (const p of data.parties) {
        if (count >= 490) break;
        const ref = db.collection("parties").doc(`${company_id}_${p.externalId}`);
        batch.set(ref, { companyId: company_id, ...p, updatedAt: fieldValue.serverTimestamp() }, { merge: true });
        count++;
      }
    }

    if (data.sales) {
      for (const s of data.sales) {
        if (count >= 490) break;
        const ref = db.collection("salesInvoices").doc(`${company_id}_${s.externalId}`);
        batch.set(ref, { companyId: company_id, ...s, updatedAt: fieldValue.serverTimestamp() }, { merge: true });
        count++;
      }
    }

    if (data.inventory) {
      for (const i of data.inventory) {
        if (count >= 490) break;
        const ref = db.collection("inventoryItems").doc(`${company_id}_${i.externalId}`);
        batch.set(ref, { companyId: company_id, ...i, updatedAt: fieldValue.serverTimestamp() }, { merge: true });
        count++;
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    return NextResponse.json({ message: "Batch pushed successfully" });
  } catch (error: any) {
    console.error("Push data error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
