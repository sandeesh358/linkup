'use client';

import React from 'react';
import { useTheme } from 'next-themes';

const ContactPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Get in Touch</h2>
          <p className="text-muted-foreground">
            Have questions or feedback? We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible.
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">Email</h3>
              <p className="text-muted-foreground">connectwithlinkup@gmail.com</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Address</h3>
              <p className="text-muted-foreground">
                Sipna College of Engineering and Technology<br />
                Amravati, Maharashtra<br />
                India - 444602
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${
          isDark 
            ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50' 
            : 'bg-white border border-gray-200'
        }`}>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary ${
                  isDark
                    ? 'bg-gray-900/50 border-gray-700 text-foreground placeholder:text-gray-500'
                    : 'bg-white border-gray-300 text-foreground placeholder:text-gray-400'
                }`}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary ${
                  isDark
                    ? 'bg-gray-900/50 border-gray-700 text-foreground placeholder:text-gray-500'
                    : 'bg-white border-gray-300 text-foreground placeholder:text-gray-400'
                }`}
                required
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary ${
                  isDark
                    ? 'bg-gray-900/50 border-gray-700 text-foreground placeholder:text-gray-500'
                    : 'bg-white border-gray-300 text-foreground placeholder:text-gray-400'
                }`}
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary ${
                  isDark
                    ? 'bg-gray-900/50 border-gray-700 text-foreground placeholder:text-gray-500'
                    : 'bg-white border-gray-300 text-foreground placeholder:text-gray-400'
                }`}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 