import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useTokenHandler() {
  const navigate = useNavigate();

  const handleApiResponse = useCallback(async (response: Response, setLetterLabData?: (data: any) => void) => {
    if (response.status === 401) {
      const error = await response.json();
      if (error.error === "Token has been invalidated." || error.error === "Access denied. Token required.") {
        // Clear local storage and redirect to token entry page
        localStorage.removeItem("letterLabData");
        if (setLetterLabData) {
          setLetterLabData(null);
        }
        navigate("/enter");
        return null;
      }
    }
    return response;
  }, [navigate]);

  return { handleApiResponse };
}