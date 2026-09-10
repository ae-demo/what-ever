import { useEffect } from "react";
import { useNavigate } from "react-router";
import GateLayout from "../layouts/GateLayout";
import { handleCallback } from "../auth";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await handleCallback();
      } finally {
        if (!cancelled) navigate("/", { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return <GateLayout message="Completing sign-in…" />;
}
