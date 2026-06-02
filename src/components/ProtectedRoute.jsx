import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1C1917"
      }}>
        <div style={{ color: "#C87533", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Chargement…
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}
