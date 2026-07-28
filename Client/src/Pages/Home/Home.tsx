import { useMutation } from "@apollo/client/react";
import { LogOut_MUTATION } from "../../component/graphql/Mutation";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Home() {
  const navigate = useNavigate();
  const [logoutUser] = useMutation(LogOut_MUTATION);
  const handleLogout = async () => {
    await logoutUser();
    navigate("/register");
    toast("logout successfylly", {
      position: "top-right",
      type: "success",
    });
  };
  return (
    <>
      <div>Home</div>
      <br />
      <button
        onClick={handleLogout}
        style={{ padding: "10px 20px", fontSize: "18px" }}
      >
        Logout
      </button>
    </>
  );
}
