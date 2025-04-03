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
      {/* Desktop View - Show 3 suggestions */}
      {/* Desktop View */}
      <Card className="hidden lg:block border bg-background">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="text-base font-semibold mb-4">Suggested for you</h3>
            {typedUsers.slice(0, 3).map((user) => (
              <div key={user.id as string} className="flex gap-2 items-center justify-between">
                <div className="flex items-center gap-1">
                  <Link href={`/profile/${user.username}`}>
                    <Avatar className="h-8 w-8">
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
                  </div>
                </div>
                <FollowButton userId={user.id as string} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
 {/* Mobile View - Instagram Style */}
 <div className="lg:hidden relative">
        {/* Glassmorphism Blur Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 
                        dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 backdrop-blur-xl rounded-xl"></div>

        {/* Content Container */}
        <Card className="relative z-10 overflow-hidden shadow-lg bg-white/30 dark:bg-black/30 
                         backdrop-blur-md rounded-xl border border-white/20 dark:border-black/20">
          <CardContent className="py-2 px-4">
            <div className="grid grid-cols-4 gap-3 w-full">
              {typedUsers.slice(0, 4).map((user) => (
                <div key={user.id} className="flex flex-col items-center justify-center">
                  <div className="relative flex justify-center">
                    <Link href={`/profile/${user.username}`}>
                      <Avatar className="h-[45px] w-[45px] border-[1.5px] border-background">
                        <AvatarImage src={user.image ?? "/avatar.png"} className="object-cover" />
                        <AvatarFallback className="text-sm">
                          {user.name?.[0] || user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <FollowButton 
                      userId={user.id} 
                      variant="overlay"
                      size="icon"
                      className="!absolute !bottom-0 !right-0 transform translate-x-0.5 translate-y-0.5 
                                 scale-[0.7] !h-5 !w-5"
                    />
                  </div>
                  <div className="w-full text-center mt-1">
                    <Link href={`/profile/${user.username}`} 
                          className="text-[10px] font-medium block truncate leading-tight px-1">
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

