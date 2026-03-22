import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopBar() {
  return (
    <header className="flex items-center gap-4 border-b border-border px-4 h-14 shrink-0">
      <span className="text-base font-semibold tracking-tight">DevStash</span>

      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search..."
            className="pl-8 h-8 bg-muted border-none text-sm"
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New Collection
        </Button>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New Item
        </Button>
      </div>
    </header>
  );
}
