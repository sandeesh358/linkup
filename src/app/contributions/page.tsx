import React from 'react';
import Link from 'next/link';

const ContributionsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Contributions</h1>
      
      <div className="prose prose-blue max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome Contributors!</h2>
          <p className="text-gray-600 mb-4">
            We're excited that you're interested in contributing to LinkUp! This project is open source and we welcome contributions from the community. Whether you're fixing bugs, improving documentation, or adding new features, your help is greatly appreciated.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium">1. Fork the Repository</h3>
            <p className="text-gray-600">
              Start by forking the <Link href="https://github.com/sandeesh358/linkup.git" className="text-blue-600 hover:underline" target="_blank">LinkUp repository</Link> on GitHub.
            </p>

            <h3 className="text-xl font-medium">2. Clone Your Fork</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <code className="text-sm">git clone https://github.com/your-username/linkup.git</code>
            </div>

            <h3 className="text-xl font-medium">3. Install Dependencies</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <code className="text-sm">npm install</code>
            </div>

            <h3 className="text-xl font-medium">4. Create a New Branch</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <code className="text-sm">git checkout -b feature/your-feature-name</code>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Making Changes</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Follow the existing code style and conventions</li>
            <li>Write clear commit messages</li>
            <li>Add tests for new features</li>
            <li>Update documentation as needed</li>
            <li>Ensure all tests pass before submitting a pull request</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Submitting a Pull Request</h2>
          <ol className="list-decimal pl-6 text-gray-600 space-y-2">
            <li>Push your changes to your fork</li>
            <li>Create a pull request to the main repository</li>
            <li>Describe your changes in detail</li>
            <li>Reference any related issues</li>
            <li>Wait for review and feedback</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Project Structure</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm">
              <code>
{`src/
├── app/           # Next.js app directory
├── components/    # Reusable components
├── actions/       # Server actions
├── lib/          # Utility functions
└── context/      # React context providers`}
              </code>
            </pre>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
          <p className="text-gray-600">
            If you have any questions or need help getting started, feel free to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mt-2">
            <li>Open an issue on GitHub</li>
            <li>Join our community discussions</li>
            <li>Contact us at <a href="mailto:connectwithlinkup@gmail.com" className="text-blue-600 hover:underline">connectwithlinkup@gmail.com</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Code of Conduct</h2>
          <p className="text-gray-600">
            Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ContributionsPage; 