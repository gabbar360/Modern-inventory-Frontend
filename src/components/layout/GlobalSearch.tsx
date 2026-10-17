"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { dashboardService } from "@/services/dashboardService";

export interface SearchResultItem {
  id: string;
  type: "Lead" | "Customer" | "Product" | "Quotation" | "Sales Order" | "Invoice" | string;
  title: string;
  subtitle?: string;
}

interface GlobalSearchProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function GlobalSearch({ open, setOpen }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsFetching(true);
      try {
        const res: any = await dashboardService.globalSearch(query.trim());
        setResults(res?.results || res || []);
      } catch (err) {
        console.warn("Search failed:", err);
      } finally {
        setIsFetching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResultItem) => {
    setOpen(false);
    const routeMap: Record<string, string> = {
      Lead: "/leads",
      Customer: `/customers/${item.id}`,
      Product: "/products",
      Quotation: `/quotations/${item.id}`,
      "Sales Order": "/sales-orders",
      Invoice: `/invoices/${item.id}`,
    };
    router.push(routeMap[item.type] || "/dashboard");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search leads, customers, invoices, products…"
        value={query}
        onValueChange={setQuery}
        data-testid="global-search-input"
      />
      <CommandList>
        <CommandEmpty>
          {query.length < 2
            ? "Type at least 2 characters to search..."
            : isFetching
            ? "Searching workspace..."
            : "No matching records found"}
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((result: SearchResultItem, idx: number) => (
              <CommandItem
                key={`${result.type}-${result.id}-${idx}`}
                onSelect={() => handleSelect(result)}
                data-testid={`search-result-${idx}`}
                className="cursor-pointer"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-20">
                  {result.type}
                </span>
                <span className="flex-1 font-medium">{result.title}</span>
                <span className="text-xs text-muted-foreground">{result.subtitle}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
