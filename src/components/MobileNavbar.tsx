"use client";

import {
  BellIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  MessageCircleIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  UserIcon,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth, useUser, SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  // Generate dynamic profile link
  const profileUrl = user
    ? `/profile/${user.username ?? user.primaryEmailAddress?.emailAddress.split("@")[0]}`
    : "/profile";

  return (
    <div className="flex md:hidden items-center gap-2">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Mobile Menu */}
      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] p-0">
          {isSignedIn && user && (
            <div className="p-4 border-b dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.imageUrl} />
                  <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.fullName || user.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                </div>
              </div>
            </div>
          )}
          
          <nav className="flex flex-col p-2">
            {/* Home Button */}
            <Button 
              variant="ghost" 
              className="flex items-center gap-3 justify-start h-12 px-4 hover:bg-gray-100 dark:hover:bg-gray-800" 
              asChild
            >
              <Link href="/" onClick={() => setShowMobileMenu(false)}>
                <HomeIcon className="w-5 h-5" />
                Home
              </Link>
            </Button>

            {isSignedIn ? (
              <>
                {/* Search Button */}
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 justify-start h-12 px-4 hover:bg-gray-100 dark:hover:bg-gray-800" 
                  asChild
                >
                  <Link href="/search" onClick={() => setShowMobileMenu(false)}>
                    <SearchIcon className="w-5 h-5" />
                    Search
                  </Link>
                </Button>
                
                {/* Message Button */}
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 justify-start h-12 px-4 hover:bg-gray-100 dark:hover:bg-gray-800" 
                  asChild
                >
                  <Link href="/message" onClick={() => setShowMobileMenu(false)}>
                    <MessageCircleIcon className="w-5 h-5" />
                    Messages
                  </Link>
                </Button>

                {/* Notifications Button */}
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 justify-start h-12 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 relative" 
                  asChild
                >
                  <Link href="/notifications" onClick={() => setShowMobileMenu(false)}>
                    <BellIcon className="w-5 h-5" />
                    Notifications
                    {/* Add condition to show/hide based on unread notifications */}
                    <span className="absolute left-7 top-3 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Link>
                </Button>

                {/* Profile Button */}
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 justify-start h-12 px-4 hover:bg-gray-100 dark:hover:bg-gray-800" 
                  asChild
                >
                  <Link href={profileUrl} onClick={() => setShowMobileMenu(false)}>
                    <UserIcon className="w-5 h-5" />
                    Profile
                  </Link>
                </Button>

                <div className="my-2 border-t dark:border-gray-800"></div>

                {/* Settings Button */}
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 justify-start h-12 px-4 hover:bg-gray-100 dark:hover:bg-gray-800" 
                  asChild
                >
                  <Link href="/settings" onClick={() => setShowMobileMenu(false)}>
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                </Button>

                {/* Help & Support Button */}
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 justify-start h-12 px-4 hover:bg-gray-100 dark:hover:bg-gray-800" 
                  asChild
                >
                  <Link href="/help" onClick={() => setShowMobileMenu(false)}>
                    <HelpCircle className="w-5 h-5" />
                    Help & Support
                  </Link>
                </Button>

                <div className="my-2 border-t dark:border-gray-800"></div>

                {/* Logout Button */}
                <SignOutButton>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-3 justify-start w-full h-12 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-500"
                  >
                    <LogOutIcon className="w-5 h-5" />
                    Logout
                  </Button>
                </SignOutButton>
              </>
            ) : (
              // Sign In Button (if not signed in)
              <SignInButton mode="modal">
                <Button 
                  variant="default" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"  
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign In
                </Button>
              </SignInButton>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;