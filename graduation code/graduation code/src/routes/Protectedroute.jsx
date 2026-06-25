import { Navigate } from "react-router";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export default function Protectedroute({ children, allowedRoles }) {
  const token = localStorage.getItem("userToken");

  if (!token) return <Navigate to="/welcome" replace />;

  const payload = decodeJwt(token);

  if (!payload) {
    localStorage.removeItem("userToken");
    return <Navigate to="/login" replace />;
  }

  // Check token expiry
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    localStorage.removeItem("userToken");
    return <Navigate to="/login" replace />;
  }

  // Check role if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = payload.role || payload.type;
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate portal based on actual role
      if (userRole === "super_admin" || userRole === "admin") return <Navigate to="/Admin" replace />;
      if (userRole === "school") return <Navigate to="/SchoolDashpord" replace />;
      return <Navigate to="/TeacherPortal" replace />;
    }
  }

  return children;
}
