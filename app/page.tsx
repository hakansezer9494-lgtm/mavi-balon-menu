import { MenuView } from "@/components/menu-view";
import { readMenu } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const menu = await readMenu();
  return <MenuView initialMenu={menu} />;
}
