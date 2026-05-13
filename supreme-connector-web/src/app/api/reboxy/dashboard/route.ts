import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AggregateField } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) return NextResponse.json({ error: "companyId is required" }, { status: 400 });

    const salesRef = db.collection("salesInvoices").where("companyId", "==", companyId);
    const salesAgg = await salesRef.aggregate({ totalAmount: AggregateField.sum("amount") }).get();
    
    // Purchases are not added in the mock, but we'll try to query it
    const purchasesRef = db.collection("purchaseInvoices").where("companyId", "==", companyId);
    const purchasesAgg = await purchasesRef.aggregate({ totalAmount: AggregateField.sum("amount") }).get();

    const inventoryRef = db.collection("inventoryItems").where("companyId", "==", companyId);
    const inventoryCount = await inventoryRef.count().get();

    return NextResponse.json({
      totalSales: salesAgg.data().totalAmount || 0,
      totalPurchases: purchasesAgg.data().totalAmount || 0,
      totalItems: inventoryCount.data().count || 0,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
