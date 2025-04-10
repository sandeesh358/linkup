import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-blue max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-gray-600 mb-4">
            At LinkUp, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium">2.1 Personal Information</h3>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Name and contact information</li>
              <li>Email address</li>
              <li>Profile information</li>
              <li>Academic details</li>
              <li>Usage data and preferences</li>
            </ul>

            <h3 className="text-xl font-medium">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Device information</li>
              <li>Log data</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>To provide and maintain our services</li>
            <li>To notify you about changes to our services</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve our services</li>
            <li>To monitor the usage of our services</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="text-gray-600 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Request restriction of processing</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            Email: connectwithlinkup@gmail.com
            <br />
            Address: Sipna College of Engineering and Technology, Amravati, Maharashtra, India - 444602
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Changes to This Privacy Policy</h2>
          <p className="text-gray-600">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          <p className="text-gray-600 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage; 