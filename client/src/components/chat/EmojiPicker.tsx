import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  children?: React.ReactNode;
}

// Simplified emoji categories for initial implementation
const emojis = {
  smileys: [
    { emoji: "😀", name: "grinning face" },
    { emoji: "😄", name: "grinning face with smiling eyes" },
    { emoji: "😅", name: "grinning face with sweat" },
    { emoji: "😂", name: "face with tears of joy" },
    { emoji: "🤣", name: "rolling on the floor laughing" },
    { emoji: "😊", name: "smiling face with smiling eyes" },
    { emoji: "😇", name: "smiling face with halo" },
    { emoji: "🙂", name: "slightly smiling face" },
    { emoji: "🙃", name: "upside-down face" },
    { emoji: "😉", name: "winking face" },
  ],
  reactions: [
    { emoji: "👍", name: "thumbs up" },
    { emoji: "👎", name: "thumbs down" },
    { emoji: "👏", name: "clapping hands" },
    { emoji: "🎉", name: "party popper" },
    { emoji: "🚀", name: "rocket" },
    { emoji: "❤️", name: "red heart" },
    { emoji: "💯", name: "hundred points" },
    { emoji: "✨", name: "sparkles" },
    { emoji: "🔥", name: "fire" },
    { emoji: "💪", name: "flexed biceps" },
  ],
  gestures: [
    { emoji: "👋", name: "waving hand" },
    { emoji: "✌️", name: "victory hand" },
    { emoji: "🤞", name: "crossed fingers" },
    { emoji: "🫡", name: "saluting face" },
    { emoji: "🤝", name: "handshake" },
    { emoji: "🙏", name: "folded hands" },
    { emoji: "👊", name: "oncoming fist" },
    { emoji: "✋", name: "raised hand" },
    { emoji: "👌", name: "OK hand" },
    { emoji: "🤌", name: "pinched fingers" },
  ],
};

export default function EmojiPicker({ onEmojiSelect, children }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="top">
        <Tabs defaultValue="smileys" className="w-full">
          <div className="border-b px-3">
            <TabsList className="h-10">
              <TabsTrigger value="smileys" className="text-lg">
                😊
              </TabsTrigger>
              <TabsTrigger value="reactions" className="text-lg">
                👍
              </TabsTrigger>
              <TabsTrigger value="gestures" className="text-lg">
                👋
              </TabsTrigger>
            </TabsList>
          </div>
          <ScrollArea className="h-[200px] p-4">
            {Object.entries(emojis).map(([category, categoryEmojis]) => (
              <TabsContent key={category} value={category} className="m-0">
                <div className="grid grid-cols-8 gap-2">
                  {categoryEmojis.map((item) => (
                    <Button
                      key={item.emoji}
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onClick={() => handleEmojiSelect(item.emoji)}
                    >
                      <span className="text-lg">{item.emoji}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
