import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/useAppContext";

export function useTokenHandler() {
  const navigate = useNavigate();
  const { setLetterLabData } = useAppContext();

  const handleApiResponse = useCallback(async (response: Response) => {
    if (response.status === 401) {
      const error = await response.json();
      if (error.error === "Token has been invalidated." || error.error === "Access denied. Token required.") {
        // Clear local storage and redirect to token entry page
        localStorage.removeItem("letterLabData");
        setLetterLabData(null);
        navigate("/enter");
        return null;
      }
    }
    return response;
  }, [navigate, setLetterLabData]);

  return { handleApiResponse };
}