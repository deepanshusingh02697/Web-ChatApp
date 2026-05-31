import { useQuery } from "@apollo/client/react";
import { GET_CURRENT_USER_QUERY } from "../component/graphql/Query";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, loading } = useQuery(GET_CURRENT_USER_QUERY);
  console.log("data for routes : ", data);

  if (loading) {
    return <p>Loading...</p>;
  }
  if (!data) {
    return <Navigate to="/register" replace />;
  }
  return <>{children}</>;
}
