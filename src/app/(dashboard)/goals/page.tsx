import { getGoals } from "@/server/actions/goals";
import { GoalsClient } from "./GoalsClient";

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <div className="relative w-full min-h-screen bg-black overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black pointer-events-none" />

      <div className="relative z-10 p-6 md:p-12 max-w-6xl mx-auto">
        <GoalsClient initialGoals={goals} />
      </div>
    </div>
  );
}
