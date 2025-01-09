import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, UserX } from "lucide-react";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface MemberManageModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MemberManageModal({
  member,
  isOpen,
  onClose,
}: MemberManageModalProps) {
  const [role, setRole] = useState(member?.role || "Member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleRoleChange = async () => {
    setIsSubmitting(true);
    // TODO: Implement role change API call
    console.log(`Changing role for ${member?.name} to ${role}`);
    setIsSubmitting(false);
    onClose();
  };

  const handleRemoveMember = async () => {
    setShowRemoveConfirm(true);
  };

  const confirmRemoveMember = async () => {
    setIsSubmitting(true);
    // TODO: Implement member removal API call
    console.log(`Removing member ${member?.name}`);
    setIsSubmitting(false);
    setShowRemoveConfirm(false);
    onClose();
  };

  if (!member) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Member: {member.name}</DialogTitle>
            <DialogDescription>{member.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="Member">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Member
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-destructive">Danger Zone</label>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleRemoveMember}
                disabled={isSubmitting}
              >
                <UserX className="mr-2 h-4 w-4" />
                Remove from Workspace
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isSubmitting}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {member.name} from the workspace? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveMember} disabled={isSubmitting}>
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}