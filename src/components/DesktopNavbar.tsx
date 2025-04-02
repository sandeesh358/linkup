import { BellIcon, HomeIcon, MessageCircleIcon, UserIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import ModeToggle from "./ModeToggle";
import { currentUser } from "@clerk/nextjs/server";

async function DesktopNavbar() {
  const user = await currentUser();

  return (
    <div className="hidden md:flex items-center gap-1 lg:gap-2">
      <Button 
        variant="ghost" 
        size="sm"
        className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800" 
        asChild
      >
        <Link href="/">
          <HomeIcon className="w-5 h-5" />
          <span className="hidden lg:inline font-medium">Home</span>
        </Link>
      </Button>

      {user ? (
        <>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800" 
            asChild
          >
            <Link href="/search">
              <SearchIcon className="w-5 h-5" />
              <span className="hidden lg:inline font-medium">Search</span>
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800" 
            asChild
          >
            <Link href="/message">
              <MessageCircleIcon className="w-5 h-5" />
              <span className="hidden lg:inline font-medium">Messages</span>
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 relative" 
            asChild
          >
            <Link href="/notifications">
              <BellIcon className="w-5 h-5" />
              <span className="hidden lg:inline font-medium">Notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full lg:right-auto lg:left-5 lg:top-1"></span>
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800" 
            asChild
          >
            <Link
              href={`/profile/${
                user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="hidden lg:inline font-medium">Profile</span>
            </Link>
          </Button>

          <div className="ml-2 flex items-center gap-2">
            <ModeToggle />
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full"
                }
              }}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <ModeToggle />
          <SignInButton mode="modal">
            <Button 
              variant="default"
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign In
            </Button>
          </SignInButton>
        </div>
      )}
    </div>
  );
}
export default DesktopNavbar;
