/** Formats a count with grouping separators, e.g. 1213400 -> "1,213,400". */
export function formatNumber(count: number): string {
  return count.toLocaleString("en-US");
}

/** Formats a large count compactly, e.g. 1200000 -> "1.2M", 12300 -> "12.3K". */
export function formatCount(count: number): string {
  if (count < 1_000) {
    return count.toString();
  }
  if (count < 1_000_000) {
    return `${trimTrailingZero(count / 1_000)}K`;
  }
  return `${trimTrailingZero(count / 1_000_000)}M`;
}

function trimTrailingZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}
