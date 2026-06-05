import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ConnectorsClient from "@/components/ConnectorsClient";

export const dynamic = "force-dynamic";

export default async function ConnectorsPage() {
  const token = cookies().get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;

  if (!payload) {
    redirect("/login");
  }

  let companyId = "";

  if (db && payload) {
    try {
      const orgsSnap = await db.collection("organizations").where("userId", "==", payload.userId).limit(1).get();
      if (!orgsSnap.empty) {
        const orgDoc = orgsSnap.docs[0];
        const companiesSnap = await db.collection("companies").where("organizationId", "==", orgDoc.id).limit(1).get();
        if (!companiesSnap.empty) {
          companyId = companiesSnap.docs[0].id;
        }
      }
    } catch (e) {
      console.error("Error fetching company info on server:", e);
    }
  }

  return <ConnectorsClient serverCompanyId={companyId} />;
}
