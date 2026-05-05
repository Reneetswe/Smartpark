import { Link } from 'react-router-dom'
import { ParkingSquare, MapPin, Users, Shield, Zap, BarChart3, Clock, CheckCircle } from 'lucide-react'

const LandingPage = () => {
  const sites = [
    { name: 'Site A', spaces: 127, location: 'Main Campus' },
    { name: 'Site B', spaces: 103, location: 'West Wing' },
    { name: 'Site C', spaces: 48, location: 'East Facility' },
  ]

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      title: 'Real-time Visibility',
      description: 'See available parking spaces across all sites in real-time'
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: 'Role-based Management',
      description: 'Different access levels for employees, receptionists, managers, and admins'
    },
    {
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      title: 'Smart Bay Guidance',
      description: 'Visual navigation to guide you directly to your booked parking bay'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive reports and insights on parking utilization'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <ParkingSquare className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">SmartPark</span>
            </div>
            <Link
              to="/login"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Intelligent Multi-Site<br />
                <span className="text-blue-600">Car Park Management</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Streamline parking operations across RoppaCorp Industries with real-time visibility, 
                smart booking, and comprehensive management tools.
              </p>
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  Get Started
                </Link>
                <a
                  href="#features"
                  className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
                >
                  Explore Features
                </a>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=600&fit=crop" 
                alt="Parking lot overview"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Sites</h2>
            <p className="text-gray-600">Managing parking across three strategic locations</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {sites.map((site, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{site.name}</h3>
                  <ParkingSquare className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-gray-600 mb-2">{site.location}</p>
                <p className="text-3xl font-bold text-blue-600">{site.spaces}</p>
                <p className="text-sm text-gray-500">Total Parking Spaces</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Feature Highlights</h2>
            <p className="text-gray-600">Everything you need for efficient parking management</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Seamless Booking Experience
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Quick Search & Book</h4>
                    <p className="text-gray-600">Find and reserve parking spaces in seconds</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Visitor Management</h4>
                    <p className="text-gray-600">Receptionists can easily manage visitor parking</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Priority Booking</h4>
                    <p className="text-gray-600">Management priority access</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Real-time Updates</h4>
                    <p className="text-gray-600">Instant notifications and booking confirmations</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop" 
                alt="Happy customer with car keys"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Parking Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join RoppaCorp Industries in experiencing the future of intelligent parking
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg shadow-xl"
          >
            Login to SmartPark
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ParkingSquare className="h-6 w-6" />
            <span className="text-lg font-bold">SmartPark</span>
          </div>
          <p className="text-gray-400">
            © 2024 RoppaCorp Industries. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
