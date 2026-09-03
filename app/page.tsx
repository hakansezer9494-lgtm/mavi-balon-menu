import { MenuView } from "@/components/menu-view";
import { defaultMenu } from "@/lib/menu";
import { readMenu } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let menu = defaultMenu;
  try {
    menu = await readMenu();
  } catch {
    menu = structuredClone(defaultMenu);
  }
  return <MenuView initialMenu={menu} />;
}
