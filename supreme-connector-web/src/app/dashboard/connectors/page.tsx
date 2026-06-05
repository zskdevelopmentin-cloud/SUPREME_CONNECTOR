import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { redirect } from "next/navigation";
import ConnectorsClient from "@/components/ConnectorsClient";

export const dynamic = "force-dynamic";

export default async function ConnectorsPage() {
  const token = cookies().get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;

  if (!payload) {
    redirect("/login");
  }

  return <ConnectorsClient />;
}
