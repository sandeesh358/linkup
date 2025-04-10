import React from 'react';

const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-blue max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing and using LinkUp, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="text-gray-600 mb-4">
            LinkUp is a platform designed to connect students, faculty, and alumni of Sipna College of Engineering and Technology. The service includes features for communication, content sharing, and academic collaboration.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Provide accurate and complete information during registration</li>
            <li>Maintain the security of your account credentials</li>
            <li>Use the service in compliance with all applicable laws</li>
            <li>Respect the rights and dignity of other users</li>
            <li>Not engage in any activity that disrupts or interferes with the service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Content Guidelines</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium">4.1 Prohibited Content</h3>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Content that is illegal, harmful, or threatening</li>
              <li>Content that infringes on intellectual property rights</li>
              <li>Content that is defamatory or libelous</li>
              <li>Content that contains viruses or malicious code</li>
              <li>Content that promotes discrimination or harassment</li>
            </ul>

            <h3 className="text-xl font-medium">4.2 Content Ownership</h3>
            <p className="text-gray-600">
              Users retain ownership of their content but grant LinkUp a license to use, modify, and distribute the content within the platform.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Account Termination</h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to terminate or suspend your account at any time, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p className="text-gray-600 mb-4">
            LinkUp shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new Terms of Service on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
          <p className="text-gray-600">
            For any questions regarding these Terms of Service, please contact us at:
            <br />
            Email: connectwithlinkup@gmail.com
            <br />
            Address: Sipna College of Engineering and Technology, Amravati, Maharashtra, India - 444602
          </p>
          <p className="text-gray-600 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage; 