export function Header({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
    </div>
  );
}