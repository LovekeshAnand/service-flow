import { useEffect } from "react";

const API_HEALTH_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000") + "/health";

export default function HealthPage() {
  useEffect(() => {
    window.location.href = API_HEALTH_URL;
  }, []);

  return null;
}
