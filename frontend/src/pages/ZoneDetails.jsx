import { useParams } from "react-router-dom";

export default function ZoneDetails() {
  const { id } = useParams();
  return <h2>Zone Details: {id}</h2>;
}
