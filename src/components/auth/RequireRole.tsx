import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface RequireRoleProps {
  role: "admin" | "moderator";
  children: ReactNode;
}

const RequireRole = ({ role, children }: RequireRoleProps) => {
  const { user, role: userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (userRole !== null && userRole !== role && !(role === "moderator" && userRole === "admin")) {
      navigate("/home", { replace: true });
    }
  }, [user, userRole, loading, role, navigate]);

  // Block rendering until auth + role are fully resolved AND user is authorized
  if (loading || !user || userRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== role && !(role === "moderator" && userRole === "admin")) {
    return null;
  }

  return <>{children}</>;
};

export default RequireRole;
