import { getRandomUsers } from "@/actions/user.action";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import FollowButton from "./FollowButton";
import { User } from "@/lib/types";

async function WhoToFollow() {
  const users = await getRandomUsers();

  if (users.length === 0) return null;
  
  // Cast to the proper User type
  const typedUsers = users as unknown as User[];

  return (
    <>
      {/* Desktop View */}
      <Card className="hidden lg:block border bg-background">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-base font-semibold mb-4">Suggested for you</h3>
            {typedUsers.map((user) => (
              <div key={user.id as string} className="flex gap-2 items-center justify-between">
                <div className="flex items-center gap-1">
                  <Link href={`/profile/${user.username}`}>
                    <Avatar>
                      <AvatarImage src={user.image ?? "/avatar.png"} />
                      <AvatarFallback>
                        {user.name?.[0] || user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="text-xs">
                    <Link href={`/profile/${user.username}`} className="font-medium cursor-pointer">
                      {user.name}
                    </Link>
                    <p className="text-muted-foreground">@{user.username}</p>
                    <p className="text-muted-foreground">{user._count?.followers} followers</p>
                  </div>
                </div>
                <FollowButton userId={user.id as string} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile View - PostCard Style */}
      <div className="lg:hidden">
        <Card className="overflow-hidden">
          <CardContent className="py-2 px-4">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {typedUsers.map((user) => (
                <div key={user.id as string} className="flex flex-col items-center justify-center min-w-[40px] max-w-[40px]">
                  <div className="relative flex justify-center">
                    <Link href={`/profile/${user.username}`}>
                      <Avatar className="h-[40px] w-[40px] border-[1.5px] border-background">
                        <AvatarImage src={user.image ?? "/avatar.png"} className="object-cover" />
                        <AvatarFallback className="text-sm">
                          {user.name?.[0] || user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <FollowButton 
                      userId={user.id as string} 
                      variant="overlay"
                      size="icon"
                      className="!absolute !bottom-0 !right-0 transform translate-x-0.5 translate-y-0.5 scale-[0.7] !h-5 !w-5"
                    />
                  </div>
                  <div className="w-full text-center flex justify-center mt-1">
                    <Link 
                      href={`/profile/${user.username}`} 
                      className="text-[10px] font-medium block truncate leading-tight"
                    >
                      {user.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default WhoToFollow;
