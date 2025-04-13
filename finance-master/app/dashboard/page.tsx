export default function DashboardPage() {
  return (
    <main className=" min-h-screen flex flex-col items-center justify-center gap-4 bg-bg text-text transition-all">
      <h1 className="text-3xl font-bold text-primary">Finance Master</h1>

      <div className="p-6 border rounded-lg shadow">
        <p className="text-muted">Couleurs dynamiques en fonction du thème</p>
      </div>

      <button className="px-4 py-2 rounded bg-(--color-primary) hover:bg-(--color-secondary) text-(--color-text) cursor-pointer">
        Connectez vous
      </button>
    </main>
  );
}