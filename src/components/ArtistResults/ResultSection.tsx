import type { ReactNode } from "react";

interface ResultSectionProps {
  heading: string;
  emptyText: string;
  children: ReactNode;
}

/** A titled section that shows its children, or a fallback message when empty. */
export function ResultSection({ heading, emptyText, children }: ResultSectionProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">{heading}</h2>
      {children ? children : <p className="text-sm text-white/50">{emptyText}</p>}
    </div>
  );
}
