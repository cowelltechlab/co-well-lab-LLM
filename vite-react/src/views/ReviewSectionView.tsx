import { useParams } from "react-router-dom";

export function ReviewSectionView() {
  const { sectionName } = useParams<{ sectionName: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold">Reviewing: {sectionName}</h1>
      {/* You can now conditionally render based on sectionName */}
    </div>
  );
}
