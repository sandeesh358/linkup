import Link from "next/link";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/actions/user.action";

async function Navbar() {
  const user = await currentUser();
  if (user) await syncUser(); // POST

  return (
    <nav className="sticky top-0 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 z-50">
      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="group flex items-center space-x-2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-lg"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300 relative">
                  <span className="text-lg font-bold text-white">L</span>
                </div>
              </div>
              <div className="relative">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent animate-shimmer">
                  LinkUp
                </span>
                <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
          </div>

          <DesktopNavbar />
          <MobileNavbar />
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
