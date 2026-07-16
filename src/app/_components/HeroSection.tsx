import { SearchBar } from "@/components/SearchBar";
import { PageHeader } from "./PageHeader";

interface HeroSectionProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
}

/** The hero band: headline copy above the search pill. */
export function HeroSection({ value, onChange, onSearch, isLoading }: HeroSectionProps) {
  return (
    <section className="hero">
      <div className="wrap">
        <PageHeader />
        <SearchBar value={value} onChange={onChange} onSearch={onSearch} isLoading={isLoading} />
      </div>
    </section>
  );
}
