import { NextResponse } from "next/server";
import { db, fieldValue } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, name, device_name, machine_id, app_version } = body;

    if (!company_id || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const companyDoc = await db.collection("companies").doc(company_id).get();
    
    // For MVP, if company doesn't exist, we auto-create it to avoid strict setup friction
    if (!companyDoc.exists) {
      await db.collection("companies").doc(company_id).set({
        name: `Company ${company_id}`,
        createdAt: fieldValue.serverTimestamp(),
      });
    }

    const rawApiKey = crypto.randomBytes(32).toString("hex");
    const connectorRef = db.collection("connectors").doc();
    
    await connectorRef.set({
      companyId: company_id,
      name: name,
      apiKey: rawApiKey,
      status: "active",
      createdAt: fieldValue.serverTimestamp(),
      devices: [{
        deviceName: device_name || "Unknown Device",
        machineId: machine_id || "unknown",
        appVersion: app_version || "1.0.0",
        lastSeen: new Date().toISOString()
      }]
    });

    return NextResponse.json({
      message: "Connector registered successfully",
      connector_id: connectorRef.id,
      api_key: rawApiKey,
    });
  } catch (error: any) {
    console.error("Connector registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
