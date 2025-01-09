import { useState } from "react";
import { Search, X, Users, Hash, MessageSquare, Filter } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SearchResult = {
  id: string;
  type: "user" | "channel" | "message";
  title: string;
  subtitle?: string;
  channelName?: string;
  timestamp?: string;
};

type SearchFilter = {
  type?: ("user" | "channel" | "message")[];
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  channel?: string;
};

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilter>({});
  const [results, setResults] = useState<SearchResult[]>([]);

  const mockResults: SearchResult[] = [
    {
      id: "1",
      type: "user",
      title: "John Doe",
      subtitle: "@johndoe",
    },
    {
      id: "2",
      type: "channel",
      title: "general",
      subtitle: "General discussions",
    },
    {
      id: "3",
      type: "message",
      title: "Meeting notes from yesterday",
      subtitle: "We discussed the new project timeline...",
      channelName: "project-updates",
      timestamp: "Yesterday at 2:30 PM",
    },
  ];

  const handleSearch = (value: string) => {
    setQuery(value);
    // TODO: Implement actual search logic
    setResults(mockResults.filter(result => 
      result.title.toLowerCase().includes(value.toLowerCase()) ||
      result.subtitle?.toLowerCase().includes(value.toLowerCase())
    ));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="h-4 w-4" />;
      case "channel":
        return <Hash className="h-4 w-4" />;
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            placeholder="Search messages, channels, and users..."
            value={query}
            onValueChange={handleSearch}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium">Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Messages", "Channels", "Users"].map((type) => (
                      <Badge
                        key={type}
                        variant={filters.type?.includes(type.toLowerCase() as any) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          // Toggle filter
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                {/* Add more filter options here */}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {["Users", "Channels", "Messages"].map((group) => (
            <CommandGroup key={group} heading={group}>
              {results
                .filter((result) => result.type === group.toLowerCase().slice(0, -1))
                .map((result) => (
                  <CommandItem
                    key={result.id}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    {getIcon(result.type)}
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-sm text-muted-foreground">
                          {result.subtitle}
                        </span>
                      )}
                      {result.type === "message" && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          {result.channelName} • {result.timestamp}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
