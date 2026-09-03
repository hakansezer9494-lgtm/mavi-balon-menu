import { AdminPanel } from "@/components/admin-panel";
import { readMenu } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export default async function YonetimPage() {
  const menu = await readMenu();
  return <AdminPanel initialMenu={menu} />;
}
