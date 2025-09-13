// app/(dashboard)/apresentacao/components/DemoGuard.tsx
export default function DemoGuard() {
  return (
    <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
      Esta é uma <b>demonstração</b>. O chat nesta página permite <b>até 5 mensagens</b>.
      Para uso completo, acesse o ambiente principal em <span className="underline">/chat</span>.
    </div>
  );
}
