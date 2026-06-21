export function AdminPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600">{description}</p>
      <p className="mt-6 inline-block rounded-full bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-800">
        Modul ini akan dibangun pada fase berikutnya
      </p>
    </div>
  );
}
