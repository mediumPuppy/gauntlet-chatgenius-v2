import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface CreateChannelDialogProps {
  trigger?: React.ReactNode;
}

export function CreateChannelDialog({ trigger }: CreateChannelDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="w-6 h-6">
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a channel</DialogTitle>
          <DialogDescription>
            Channels are where conversations happen around a topic. They're most
            effective when organized around a project, topic, or team.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Channel name</Label>
            <Input
              id="name"
              placeholder="e.g. marketing"
              className="col-span-3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this channel about?"
              className="col-span-3"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="private" />
            <div className="grid gap-1.5">
              <Label htmlFor="private" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Make private
              </Label>
              <p className="text-sm text-muted-foreground">
                Only invited members can view or join this channel
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create channel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
