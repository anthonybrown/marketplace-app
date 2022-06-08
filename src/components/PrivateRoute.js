import { Navigate, Outlet } from "react-router-dom"
import { useAuthStatus } from "../hooks/useAuthStatus"

const PrivateRoute = () => {
  const { loggedIn, checkingStatus } = useAuthStatus()

  if (checkingStatus) return <h3>Loading...</h3>

  return loggedIn ? <Outlet /> : <Navigate to='/sign-in' />
}

// Protected Routes in V6 React-Router-DOM
// https://stackoverflow.com/questions/65505665/protected-route-with-firebase

// Fix memory leak warning
// https://stackoverflow.com/questions/59780268/cleanup-memory-leaks-on-unmounted-component-in-react-hooks

export default PrivateRoute
