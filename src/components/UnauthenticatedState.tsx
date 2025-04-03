'use client';

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function UnauthenticatedState() {
  const { theme } = useTheme();

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex overflow-y-auto py-2">
      {/* Animated background gradient */}
      <div className={`fixed inset-0 top-16 -z-10 bg-gradient-to-br ${
        theme === 'dark' 
          ? 'from-black via-gray-900 to-black' 
          : 'from-gray-50 via-white to-gray-50'
      }`}>
        <div className={`absolute inset-0 bg-[url('/grid.svg')] ${
          theme === 'dark' ? 'opacity-20' : 'opacity-10'
        }`}></div>
        <div className={`absolute inset-0 bg-gradient-to-br ${
          theme === 'dark'
            ? 'from-blue-500/20 via-transparent to-blue-500/20'
            : 'from-blue-500/10 via-transparent to-blue-500/10'
        } animate-pulse`}></div>
      </div>

      {/* Left section with background */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-2 relative">
        <div className="max-w-md relative">
          {/* Decorative circles */}
          <div className={`absolute -top-10 -left-10 w-32 h-32 ${
            theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'
          } rounded-full blur-xl`}></div>
          <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${
            theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'
          } rounded-full blur-xl`}></div>
          
          <div className={`relative ${
            theme === 'dark'
              ? 'bg-black/40 backdrop-blur-xl border-white/10'
              : 'bg-white/80 backdrop-blur-xl border-gray-200'
          } rounded-2xl p-4 border`}>
            <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} space-y-3`}>
              <div className="flex items-center space-x-4 group">
                <div className="relative">
                  <div className={`absolute inset-0 ${
                    theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'
                  } blur-lg rounded-xl`}></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300 relative">
                    <span className="text-3xl font-bold text-white">L</span>
                  </div>
                </div>
                <div className="relative">
                  <h2 className={`text-3xl font-bold ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-white via-blue-100 to-white'
                      : 'bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900'
                  } bg-clip-text text-transparent animate-shimmer`}>
                    LinkUp
                  </h2>
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
              <h1 className={`text-2xl font-bold leading-tight ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-white via-gray-100 to-gray-300'
                  : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700'
              } bg-clip-text text-transparent`}>
                Connect and share with your community
              </h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm leading-relaxed`}>
                Join LinkUp to connect with friends, share your thoughts, and stay updated with your community in a modern social experience.
              </p>
              
              {/* Feature list */}
              <div className="space-y-2">
                <div className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-sm">Connect with like-minded people</span>
                </div>
                <div className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-sm">Share your thoughts instantly</span>
                </div>
                <div className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-sm">Stay updated with your network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right section with auth */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-2 relative">
        <div className="w-full max-w-[400px] relative">
          <div className={`absolute inset-0 ${
            theme === 'dark'
              ? 'bg-black/40 backdrop-blur-xl'
              : 'bg-white/80 backdrop-blur-xl'
          } rounded-2xl -m-2 p-2`}></div>
          
          <div className="relative">
            <div className="w-full relative">
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent border-0 shadow-none w-full",
                    headerTitle: `${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-lg !mt-0`,
                    headerSubtitle: `${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`,
                    socialButtonsBlockButton: `${theme === 'dark'
                      ? 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20'
                      : 'bg-gray-100/80 backdrop-blur-sm border-gray-200 text-gray-900 hover:bg-gray-200/80'
                    } transition-colors text-sm h-7`,
                    dividerLine: theme === 'dark' ? 'bg-white/20' : 'bg-gray-200',
                    dividerText: `${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`,
                    formFieldLabel: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`,
                    formFieldInput: `${theme === 'dark'
                      ? 'bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-blue-500'
                      : 'bg-gray-100/80 backdrop-blur-sm border-gray-200 text-gray-900 focus:border-blue-500'
                    } transition-colors text-sm h-7`,
                    formButtonPrimary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-[1.02] text-sm h-7",
                    footerActionLink: "text-blue-400 hover:text-blue-300 text-sm",
                    formFieldInputShowPasswordButton: "text-sm",
                    card__main: "!p-0",
                    form: "!px-1 space-y-0.5",
                    formHeader: "!p-1 !pb-0 !pt-1",
                    socialButtons: "!px-1 !py-0 space-y-0.5",
                    dividerRow: "!px-1 !py-0.5",
                    footer: "!px-1 !py-1",
                    formFields: "space-y-0.5",
                    formButtons: "!mt-0.5 !mb-1",
                    main: "!py-1",
                  },
                  layout: {
                    socialButtonsPlacement: "top",
                    showOptionalFields: false,
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 