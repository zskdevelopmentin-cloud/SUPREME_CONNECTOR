import { NextResponse } from "next/server";
import { db, fieldValue } from "@/lib/db";

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

    const { data } = await request.json();
    
    // Tally XML parsed JSON often has nested structures
    // For this demonstration, we assume a list of stock items
    const stockItems = data?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDESC?.STATICVARIABLES?.STOCKITEM || [];
    const items = Array.isArray(stockItems) ? stockItems : [stockItems];

    let count = 0;
    let batch = db.batch();

    for (const item of items) {
      if (!item.NAME) continue;

      const docId = `${connector.companyId}_${item.NAME}`;
      const itemRef = db.collection("inventoryItems").doc(docId);

      batch.set(itemRef, {
        companyId: connector.companyId,
        externalId: item.NAME,
        name: item.NAME,
        unit: item.BASEUNITS || null,
        stock: parseFloat(item.CLOSINGBALANCE) || 0,
        updatedAt: fieldValue.serverTimestamp()
      }, { merge: true });

      count++;
      if (count % 450 === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }

    if (count > 0 && count % 450 !== 0) {
      await batch.commit();
    }

    await connectorDoc.ref.update({
      lastSyncedAt: fieldValue.serverTimestamp()
    });

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error("Product Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
