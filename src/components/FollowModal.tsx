"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import FollowButton from "./FollowButton";
import { useUser } from "@clerk/nextjs";

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: User[];
}

export default function FollowModal({
  isOpen,
  onClose,
  title,
  users,
}: FollowModalProps) {
  const { user: clerkUser } = useUser();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
          <div className="flex flex-col gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={onClose}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || "/avatar.png"} />
                    <AvatarFallback>
                      {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username}
                    </p>
                  </div>
                </Link>
                {user.id !== clerkUser?.id && (
                  <FollowButton userId={user.id as string} />
                )}
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No {title.toLowerCase()} yet
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 