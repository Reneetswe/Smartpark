const ProtectedRoute = ({ children }) => {
  // Authentication disabled - allow direct access to all dashboards
  return children
}

export default ProtectedRoute
