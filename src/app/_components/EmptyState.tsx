/** First-visit prompt shown until the user runs a search. */
export function EmptyState() {
  return (
    <div className="empty">
      <div className="glyph" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3 12h2l2-6 3 12 3-15 3 15 2-6h3" />
        </svg>
      </div>
      <p>Search a band to begin</p>
      <small>Try Opeth, Tool or Pink Floyd</small>
    </div>
  );
}
