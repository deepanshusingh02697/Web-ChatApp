import { useState } from "react";
import styles from "./signinSignup.module.css";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";
import { LOG_IN_MUTATION, SIGN_UP_MUTATION } from "../graphql/Mutation";
import { GET_AUTHENTIC_USER_QUERY} from "../graphql/Query";
import { useNavigate } from "react-router-dom";

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(false);
  const [loginInput, setLoginInput] = useState({
    password: "",
    email: "",
  });
  const [signupInput, setSignUpInput] = useState({
    username: "",
    password: "",
    email: "",
  });
  const navigate = useNavigate();
  interface signUpInterface {
    signUp: {
      alert: string;
      success: boolean;
      user: {
        email: string;
        isOnline: boolean;
        lastSeen: string;
        username: string;
      };
    };
  }
  const [singUpUserMutation] = useMutation<signUpInterface>(SIGN_UP_MUTATION, {
    refetchQueries: [{ query: GET_AUTHENTIC_USER_QUERY }],
  });

  /* Signup */
  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpInput((prev) => ({ ...prev, [name]: value }));
  };
  const handleSignUpSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(signupInput);
    try {
      const response = await singUpUserMutation({
        variables: {
          username: signupInput.username,
          email: signupInput.email,
          password: signupInput.password,
        },
      });
      if (!response) {
        toast("Invalid credentials! ", {
          position: "top-right",
          type: "warning",
        });
        return;
      }

      console.log("response for signup data : ", response);

      if (response?.data?.signUp) {
        toast(response?.data?.signUp?.alert, {
          position: "top-right",
          type: "success",
        });
        setSignUpInput({
          username: "",
          password: "",
          email: "",
        });
        setIsLogin(false);
      }
    } catch (error) {
      console.log("error in signupSubmit : ", error);
    }
  };

  /* LogIn */
  interface logInuserInterface {
    logIn: {
      alert: string;
      success: boolean;
      user: {
        email: string;
        username: string;
        isOnline: boolean;
      };
    };
  }
  const [logInuserMutation] = useMutation<logInuserInterface>(LOG_IN_MUTATION);

  const handleLogInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogInSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await logInuserMutation({
        variables: {
          email: loginInput.email,
          password: loginInput.password,
        },
      });
      console.log("response from login : ", response);
      if (!response) {
        toast("Invalid credentials! ", {
          position: "top-right",
          type: "warning",
        });
        return;
      }
      console.log("response is : ",response);
      
      if (response?.data?.logIn) {
        toast("Login successfully",{
          position: "top-right",
          type: "success",
        });
        navigate("/");
        setLoginInput({
          password: "",
          email: "",
        });
      }
    } catch (error) {
      console.log("error in logInSubmit : ", error);
    }
  };

  return (
    <>
      <div className={styles.bodyCon}>
        <div className={styles.container}>
          <div className={styles.signupCon}>
            <div className={styles.userBtn}>
              <button
                onClick={() => setIsLogin(false)}
                className={isLogin ? "" : styles.btncolor}
              >
                SignIn
              </button>
              <button
                onClick={() => setIsLogin(true)}
                className={isLogin ? styles.btncolor : ""}
              >
                SignUp
              </button>
            </div>
            <br />
            {isLogin ? (
              <form onSubmit={handleSignUpSubmit}>
                <div>
                  <label htmlFor="username">User Name</label>
                  <input
                    type="text"
                    name="username"
                    value={signupInput.username}
                    onChange={handleSignUpChange}
                  />
                </div>
                <div>
                  <label htmlFor="email">Enter email</label>
                  <input
                    type="text"
                    name="email"
                    value={signupInput.email}
                    onChange={handleSignUpChange}
                  />
                </div>
                <div>
                  <label htmlFor="password">Password</label>
                  <input
                    type="text"
                    name="password"
                    value={signupInput.password}
                    onChange={handleSignUpChange}
                  />
                </div>
                <button type="submit" className={styles.submitbtn}>
                  Submit
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogInSubmit}>
                <div>
                  <label htmlFor="email">Enter email</label>
                  <input
                    type="text"
                    name="email"
                    value={loginInput.email}
                    onChange={handleLogInChange}
                  />
                </div>
                <div>
                  <label htmlFor="password">Password</label>
                  <input
                    type="text"
                    name="password"
                    value={loginInput.password}
                    onChange={handleLogInChange}
                  />
                </div>
                <button type="submit" className={styles.submitbtn}>
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
