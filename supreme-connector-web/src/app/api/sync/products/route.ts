import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json({ error: "API Key required" }, { status: 401 });
    }

    const connector = await prisma.connector.findUnique({
      where: { apiKey },
      include: { company: true }
    });

    if (!connector) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 403 });
    }

    const { data } = await request.json();
    
    // Tally XML parsed JSON often has nested structures
    // For this demonstration, we assume a list of stock items
    const stockItems = data?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDESC?.STATICVARIABLES?.STOCKITEM || [];
    const items = Array.isArray(stockItems) ? stockItems : [stockItems];

    let count = 0;
    for (const item of items) {
      if (!item.NAME) continue;

      await prisma.inventoryItem.upsert({
        where: {
          companyId_externalId: {
            companyId: connector.companyId,
            externalId: item.NAME // Use Name as externalId for Tally
          }
        },
        update: {
          name: item.NAME,
          unit: item.BASEUNITS,
          stock: parseFloat(item.CLOSINGBALANCE) || 0,
        },
        create: {
          companyId: connector.companyId,
          externalId: item.NAME,
          name: item.NAME,
          unit: item.BASEUNITS,
          stock: parseFloat(item.CLOSINGBALANCE) || 0,
        }
      });
      count++;
    }

    await prisma.connector.update({
      where: { id: connector.id },
      data: { lastSyncedAt: new Date() }
    });

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error("Product Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
