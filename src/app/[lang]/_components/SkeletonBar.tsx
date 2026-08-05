import type { CSSProperties } from "react";

interface SkeletonBarProps {
  width: string;
  height: string;
  radius?: string;
}

/** A single shimmering placeholder block used to build loading skeletons. */
export function SkeletonBar({ width, height, radius = "8px" }: SkeletonBarProps) {
  const style: CSSProperties = { width, height, borderRadius: radius };
  return <div className="sk" style={style} aria-hidden="true" />;
}
