import { getAllBankStatuses } from "@/server/actions/nubank";
import { ConnectionsClient } from "./ConnectionsClient";

export default async function ConnectionsPage() {
  const bankData = await getAllBankStatuses();

  return (
    <div className="relative w-full min-h-screen bg-black overflow-y-auto">
      {/* Background Decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />

      <div className="relative z-10 p-6 md:p-12 max-w-6xl mx-auto">
        <ConnectionsClient initialData={bankData} />
      </div>
    </div>
  );
}
