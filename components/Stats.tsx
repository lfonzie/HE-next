import { Users, Zap, Globe, Heart } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '10K+',
    label: 'Active Users',
    description: 'Growing community of developers'
  },
  {
    icon: Zap,
    value: '99.9%',
    label: 'Uptime',
    description: 'Reliable and fast performance'
  },
  {
    icon: Globe,
    value: '50+',
    label: 'Countries',
    description: 'Serving users worldwide'
  },
  {
    icon: Heart,
    value: '24/7',
    label: 'Support',
    description: 'Always here to help'
  }
]

export function Stats() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <stat.icon className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
