import { AdminPanel } from "@/components/admin-panel";
import { defaultMenu } from "@/lib/menu";
import { readMenu } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export default async function YonetimPage() {
  let menu = defaultMenu;
  try {
    menu = await readMenu();
  } catch {
    menu = structuredClone(defaultMenu);
  }
  return <AdminPanel initialMenu={menu} />;
}
