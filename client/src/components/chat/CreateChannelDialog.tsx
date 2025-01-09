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
import { Plus, Lock, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const createChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required"),
  topic: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

type FormData = z.infer<typeof createChannelSchema>;

interface CreateChannelDialogProps {
  trigger?: React.ReactNode;
}

export function CreateChannelDialog({ trigger }: CreateChannelDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      topic: "",
      isPrivate: false,
    },
  });

  const createChannel = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/workspaces/1/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          type: "text",
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces/1/channels"] });
      toast({
        title: "Channel created",
        description: "Your new channel has been created successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating channel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createChannel.mutate(data);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Plus className="mr-2 h-4 w-4" />
            Create a channel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
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
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topic">Description</Label>
              <Textarea
                id="topic"
                placeholder="What's this channel about?"
                className="col-span-3"
                {...form.register("topic")}
              />
              {form.formState.errors.topic && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.topic.message}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={form.watch("isPrivate")}
                onCheckedChange={(checked) => form.setValue("isPrivate", checked)}
              />
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
            <Button 
              type="submit" 
              disabled={createChannel.isPending}
            >
              {createChannel.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create channel"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}