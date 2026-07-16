interface CardShellProps {
  label: string;
  note: string;
}

/** A feature-card fallback that keeps the label but states data is missing. */
export function CardShell({ label, note }: CardShellProps) {
  return (
    <div className="card">
      <div className="track">
        <p className="label">{label}</p>
        <p className="card-empty">{note}</p>
      </div>
    </div>
  );
}
