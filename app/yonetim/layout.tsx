import { OrderAlertWatcher } from "@/components/order-alert-watcher";

export default function YonetimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OrderAlertWatcher />
      {children}
    </>
  );
}
