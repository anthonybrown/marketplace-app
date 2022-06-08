import { Navigate, Outlet } from "react-router-dom"
import { useAuthStatus } from "../hooks/useAuthStatus"

const PrivateRoute = () => {
  const { loggedIn, checkingStatus } = useAuthStatus()

  if (checkingStatus) return <h3>Loading...</h3>

  return loggedIn ? <Outlet /> : <Navigate to='/sign-in' />
}

// https://stackoverflow.com/questions/65505665/protected-route-with-firebase

// https://stackoverflow.com/questions/59780268/cleanup-memory-leaks-on-unmounted-component-in-react-hooks

export default PrivateRoute
