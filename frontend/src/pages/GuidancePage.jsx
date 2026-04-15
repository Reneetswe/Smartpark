import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import axios from '../api/axios'
import { Navigation, MapPin, Calendar, Clock, ArrowLeft, Car } from 'lucide-react'

const GuidancePage = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [guidanceData, setGuidanceData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGuidanceData()
  }, [bookingId])

  const fetchGuidanceData = async () => {
    try {
      const response = await axios.get(`/api/guidance/${bookingId}`)
      setGuidanceData(response.data)
    } catch (error) {
      console.error('Error fetching guidance data:', error)
      // Generate demo parking lot map
      const demoData = {
        bay_code: 'A-ST-015',
        site_name: 'Site A - Main Campus',
        booking_date: new Date().toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '17:00',
        booked_space_pos: { x: 650, y: 350 },
        nodes: [
          // Entrance
          { id: 1, node_code: 'ENTRANCE', node_type: 'entrance', pos_x: 100, pos_y: 50 },
          // Path nodes
          { id: 2, node_code: 'P1', node_type: 'path', pos_x: 200, pos_y: 50 },
          { id: 3, node_code: 'P2', node_type: 'path', pos_x: 300, pos_y: 50 },
          { id: 4, node_code: 'P3', node_type: 'path', pos_x: 400, pos_y: 50 },
          { id: 5, node_code: 'P4', node_type: 'path', pos_x: 500, pos_y: 50 },
          { id: 6, node_code: 'P5', node_type: 'path', pos_x: 600, pos_y: 50 },
          { id: 7, node_code: 'P6', node_type: 'path', pos_x: 600, pos_y: 150 },
          { id: 8, node_code: 'P7', node_type: 'path', pos_x: 600, pos_y: 250 },
          { id: 9, node_code: 'P8', node_type: 'path', pos_x: 650, pos_y: 300 },
          // Parking spaces
          { id: 10, node_code: 'A-ST-015', node_type: 'parking', pos_x: 650, pos_y: 350 },
        ],
        edges: [
          { from_node_id: 1, to_node_id: 2 },
          { from_node_id: 2, to_node_id: 3 },
          { from_node_id: 3, to_node_id: 4 },
          { from_node_id: 4, to_node_id: 5 },
          { from_node_id: 5, to_node_id: 6 },
          { from_node_id: 6, to_node_id: 7 },
          { from_node_id: 7, to_node_id: 8 },
          { from_node_id: 8, to_node_id: 9 },
          { from_node_id: 9, to_node_id: 10 },
        ],
        route_path: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      }
      setGuidanceData(demoData)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!guidanceData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">Guidance data not available</p>
        </div>
      </div>
    )
  }

  const getNodeById = (nodeId) => {
    return guidanceData.nodes.find(n => n.id === nodeId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div>
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Navigation className="h-5 w-5 mr-2 text-blue-600" />
                Booking Details
              </h2>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Your Parking Bay</p>
                  <p className="text-2xl font-bold text-blue-600">{guidanceData.bay_code}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Site</p>
                      <p className="font-medium text-gray-900">{guidanceData.site_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium text-gray-900">{guidanceData.booking_date}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium text-gray-900">
                        {guidanceData.start_time} - {guidanceData.end_time}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Route Legend</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                      <span className="text-gray-700">Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                      <span className="text-gray-700">Occupied</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                      <span className="text-gray-700">Reserved</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                      <span className="text-gray-700">Your Bay</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
                      <span className="text-gray-700">Blocked</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1 h-4 bg-purple-600 mr-3"></div>
                      <span className="text-gray-700">Your Route</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Site Layout & Navigation</h2>
              
              <div className="bg-gray-100 rounded-lg p-8 min-h-[600px] relative overflow-auto">
                <svg width="100%" height="600" viewBox="0 0 800 600" className="border-2 border-gray-300 bg-white rounded">
                  {/* Entrance marker */}
                  <text x="20" y="30" className="text-sm font-bold fill-gray-700">🚗 Entrance</text>
                  
                  {/* Parking lot rows */}
                  <g>
                    {/* Row 1 - Left side */}
                    {[...Array(5)].map((_, i) => (
                      <rect
                        key={`left-${i}`}
                        x={150 + i * 60}
                        y={150}
                        width={50}
                        height={80}
                        fill={i === 2 ? '#3B82F6' : '#10B981'}
                        stroke="#1F2937"
                        strokeWidth="2"
                        rx="4"
                      />
                    ))}
                    
                    {/* Row 2 - Right side */}
                    {[...Array(5)].map((_, i) => (
                      <rect
                        key={`right-${i}`}
                        x={150 + i * 60}
                        y={300}
                        width={50}
                        height={80}
                        fill={i === 1 ? '#EF4444' : i === 3 ? '#EAB308' : '#10B981'}
                        stroke="#1F2937"
                        strokeWidth="2"
                        rx="4"
                      />
                    ))}
                    
                    {/* Row 3 - Bottom left */}
                    {[...Array(4)].map((_, i) => (
                      <rect
                        key={`bottom-left-${i}`}
                        x={150 + i * 60}
                        y={450}
                        width={50}
                        height={80}
                        fill={i === 0 ? '#EF4444' : '#10B981'}
                        stroke="#1F2937"
                        strokeWidth="2"
                        rx="4"
                      />
                    ))}
                    
                    {/* Row 4 - Bottom right */}
                    {[...Array(4)].map((_, i) => (
                      <rect
                        key={`bottom-right-${i}`}
                        x={450 + i * 60}
                        y={450}
                        width={50}
                        height={80}
                        fill="#10B981"
                        stroke="#1F2937"
                        strokeWidth="2"
                        rx="4"
                      />
                    ))}
                    
                    {/* Parking space labels */}
                    <text x={175} y={195} className="text-xs fill-white font-bold" textAnchor="middle">A-01</text>
                    <text x={235} y={195} className="text-xs fill-white font-bold" textAnchor="middle">A-02</text>
                    <text x={295} y={195} className="text-xs fill-white font-bold" textAnchor="middle">A-15</text>
                    <text x={355} y={195} className="text-xs fill-white font-bold" textAnchor="middle">A-04</text>
                    <text x={415} y={195} className="text-xs fill-white font-bold" textAnchor="middle">A-05</text>
                  </g>
                  
                  {guidanceData.nodes.map((node, index) => {
                    const isOnRoute = guidanceData.route_path.includes(node.id)
                    const isEntrance = node.node_type === 'entrance'
                    const isParking = node.node_type === 'parking'
                    
                    return (
                      <g key={node.id}>
                        <circle
                          cx={node.pos_x}
                          cy={node.pos_y}
                          r={isEntrance ? 15 : isParking ? 12 : 8}
                          fill={isEntrance ? '#10B981' : isOnRoute ? '#8B5CF6' : '#D1D5DB'}
                          stroke={isOnRoute ? '#6D28D9' : '#9CA3AF'}
                          strokeWidth={isOnRoute ? 3 : 1}
                        />
                        <text
                          x={node.pos_x}
                          y={node.pos_y - 20}
                          className="text-xs fill-gray-700 font-medium"
                          textAnchor="middle"
                        >
                          {node.node_code}
                        </text>
                      </g>
                    )
                  })}

                  {guidanceData.edges.map((edge, index) => {
                    const fromNode = getNodeById(edge.from_node_id)
                    const toNode = getNodeById(edge.to_node_id)
                    
                    if (!fromNode || !toNode) return null

                    const isRouteEdge = guidanceData.route_path.includes(edge.from_node_id) && 
                                       guidanceData.route_path.includes(edge.to_node_id)

                    return (
                      <line
                        key={index}
                        x1={fromNode.pos_x}
                        y1={fromNode.pos_y}
                        x2={toNode.pos_x}
                        y2={toNode.pos_y}
                        stroke={isRouteEdge ? '#8B5CF6' : '#D1D5DB'}
                        strokeWidth={isRouteEdge ? 4 : 2}
                        strokeDasharray={isRouteEdge ? '0' : '5,5'}
                      />
                    )
                  })}

                  {guidanceData.booked_space_pos && (
                    <g>
                      <rect
                        x={guidanceData.booked_space_pos.x - 25}
                        y={guidanceData.booked_space_pos.y - 15}
                        width="50"
                        height="30"
                        fill="#3B82F6"
                        stroke="#1E40AF"
                        strokeWidth="2"
                        rx="4"
                      />
                      <text
                        x={guidanceData.booked_space_pos.x}
                        y={guidanceData.booked_space_pos.y + 5}
                        className="text-xs fill-white font-bold"
                        textAnchor="middle"
                      >
                        {guidanceData.bay_code}
                      </text>
                      <Car
                        x={guidanceData.booked_space_pos.x - 8}
                        y={guidanceData.booked_space_pos.y - 35}
                        className="h-4 w-4 text-blue-600"
                      />
                    </g>
                  )}
                </svg>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-900 mb-2 flex items-center">
                    <Navigation className="h-5 w-5 mr-2" />
                    Navigation Instructions
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>Enter through the main entrance (green marker)</li>
                    <li>Follow the purple route path shown on the map</li>
                    <li>Your destination bay <strong>{guidanceData.bay_code}</strong> is highlighted in blue</li>
                    <li>Park your vehicle in the designated bay</li>
                  </ol>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuidancePage
