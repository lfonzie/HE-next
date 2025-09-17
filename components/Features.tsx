import { Code, Shield, Smartphone, Rocket } from 'lucide-react'

const features = [
  {
    icon: Code,
    title: 'TypeScript Ready',
    description: 'Built with TypeScript for type safety and better developer experience. Catch errors early and build with confidence.',
    color: 'bg-blue-500'
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'Security-first approach with built-in protection against common vulnerabilities and best practices.',
    color: 'bg-green-500'
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Fully responsive design that works perfectly on all devices, from mobile phones to desktop computers.',
    color: 'bg-purple-500'
  },
  {
    icon: Rocket,
    title: 'Performance Optimized',
    description: 'Optimized for speed with Next.js features like automatic code splitting and image optimization.',
    color: 'bg-orange-500'
  }
]

export function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose HE Next?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built with modern technologies and best practices to deliver exceptional user experiences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} rounded-lg mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
