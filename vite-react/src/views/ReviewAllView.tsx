import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

export function ReviewAllView() {
  const navigate = useNavigate();
  const { letterLabData } = useAppContext();

  useEffect(() => {
    if (!letterLabData) {
      navigate("/");
    }
  }, [letterLabData, navigate]);

  if (!letterLabData) return null;

  return (
    <Card className="w-full max-w-4xl p-6 bg-white shadow-lg">
      <h2 className="text-2xl font-bold mb-4">
        Your Personalized Cover Letter Review
      </h2>
      <p className="text-gray-700 whitespace-pre-line">
        {letterLabData.review_all_view_intro}
      </p>
    </Card>
  );
}
