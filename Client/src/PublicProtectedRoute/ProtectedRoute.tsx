import { useQuery } from "@apollo/client/react";
import { GET_AUTHENTIC_USER_QUERY } from "../component/graphql/Query";
import { Navigate } from "react-router-dom";
import type { getAuthenticUserType } from "../component/graphql/client";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, loading } = useQuery<getAuthenticUserType>(GET_AUTHENTIC_USER_QUERY);
  console.log("data for routes : ", data);

  if (loading) {
    return <p>Loading...</p>; 
  }
  const isLoggedIn = data?.currentUser?.user?.id;
  if (!isLoggedIn) {
    return <Navigate to="/register" replace />;
  }
  return <>{children}</>;
}
