import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - HE Next App',
  description: 'Learn more about our mission and values',
}

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About HE Next
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're passionate about creating exceptional web experiences using the latest technologies.
          </p>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                To empower developers with modern, efficient, and scalable web applications 
                that deliver exceptional user experiences.
              </p>
              <p className="text-gray-600">
                We believe in the power of technology to solve real-world problems and 
                make the web a better place for everyone.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Quality first in everything we build</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Continuous learning and improvement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Open source and community-driven</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Accessibility and inclusivity</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-2">Next.js</div>
                <div className="text-sm text-gray-600">React Framework</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-2">TypeScript</div>
                <div className="text-sm text-gray-600">Type Safety</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-2">Tailwind</div>
                <div className="text-sm text-gray-600">CSS Framework</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-2">Vercel</div>
                <div className="text-sm text-gray-600">Deployment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
