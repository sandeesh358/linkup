'use client';

import React from 'react';
import { useTheme } from 'next-themes';

const HelpPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the 'Sign Up' button on the homepage and follow the registration process. You'll need to provide your email address and create a password."
    },
    {
      question: "How can I reset my password?",
      answer: "If you've forgotten your password, click on the 'Forgot Password' link on the login page. You'll receive an email with instructions to reset your password."
    },
    {
      question: "How do I update my profile information?",
      answer: "You can update your profile information by going to the 'Profile' section in your account settings. Click on the edit button next to the information you want to change."
    },
    {
      question: "How do I report inappropriate content?",
      answer: "If you come across inappropriate content, click on the three dots (...) next to the post and select 'Report'. Our moderation team will review the report and take appropriate action."
    },
    {
      question: "How can I contact support?",
      answer: "You can contact our support team through the 'Contact Us' page. We typically respond within 24-48 hours during business days."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Help and Support</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className={`p-6 rounded-lg shadow-md ${
                  isDark 
                    ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <h3 className="text-lg font-medium mb-2 text-foreground">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="/contact" className={`block p-4 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-blue-900/20 hover:bg-blue-900/30 border border-blue-800/30' 
                  : 'bg-blue-50 hover:bg-blue-100 border border-blue-100'
              }`}>
                <h3 className="font-medium text-primary">Contact Support</h3>
                <p className="text-sm text-muted-foreground">Get in touch with our support team</p>
              </a>
              <a href="/settings" className={`block p-4 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-blue-900/20 hover:bg-blue-900/30 border border-blue-800/30' 
                  : 'bg-blue-50 hover:bg-blue-100 border border-blue-100'
              }`}>
                <h3 className="font-medium text-primary">Account Settings</h3>
                <p className="text-sm text-muted-foreground">Manage your account preferences</p>
              </a>
              <a href="/privacy" className={`block p-4 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-blue-900/20 hover:bg-blue-900/30 border border-blue-800/30' 
                  : 'bg-blue-50 hover:bg-blue-100 border border-blue-100'
              }`}>
                <h3 className="font-medium text-primary">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">Learn about our privacy practices</p>
              </a>
              <a href="/terms" className={`block p-4 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-blue-900/20 hover:bg-blue-900/30 border border-blue-800/30' 
                  : 'bg-blue-50 hover:bg-blue-100 border border-blue-100'
              }`}>
                <h3 className="font-medium text-primary">Terms of Service</h3>
                <p className="text-sm text-muted-foreground">Read our terms and conditions</p>
              </a>
              <a href="/contributions" className={`block p-4 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-blue-900/20 hover:bg-blue-900/30 border border-blue-800/30' 
                  : 'bg-blue-50 hover:bg-blue-100 border border-blue-100'
              }`}>
                <h3 className="font-medium text-primary">Contributions</h3>
                <p className="text-sm text-muted-foreground">Learn how to contribute to our project</p>
              </a>
              <a href="https://github.com/sandeesh358/linkup.git" target="_blank" rel="noopener noreferrer" className={`block p-4 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-blue-900/20 hover:bg-blue-900/30 border border-blue-800/30' 
                  : 'bg-blue-50 hover:bg-blue-100 border border-blue-100'
              }`}>
                <h3 className="font-medium text-primary">GitHub Repository</h3>
                <p className="text-sm text-muted-foreground">View our source code on GitHub</p>
              </a>
            </div>
          </section>
        </div>

        <div className={`p-6 rounded-lg shadow-md h-fit ${
          isDark 
            ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50' 
            : 'bg-white border border-gray-200'
        }`}>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Need More Help?</h2>
          <p className="text-muted-foreground mb-4">
            If you can't find what you're looking for, our support team is here to help.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground">Support Hours</h3>
              <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Email Support</h3>
              <p className="text-muted-foreground">connectwithlinkup@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage; 