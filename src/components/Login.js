import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./../styles/Login.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/scupp/api/v1/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          isMgmtLogin: true, // sempre true
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Armazenar o accessToken no localStorage
        localStorage.setItem("accessToken", data.accessToken);

        // Decodificar o token JWT
        const decodedToken = jwtDecode(data.accessToken);
        console.log("Decoded Token:", decodedToken);
        localStorage.setItem("profileImg",decodedToken.profileImgLink)
        localStorage.setItem("nickname",decodedToken.nickname)
        

        // Redirecionar para a página Home
        navigate("/home");
      } else {
        const data = await response.json();
        setError(data.message || "Erro ao fazer login.");
      }
    } catch (error) {
      console.log("Ocorreu um erro:", error);
      setError("Erro ao se conectar ao servidor.");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <input
            placeholder="Informe seu email..."
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <input
            placeholder="Informe sua senha..."
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="login-button-container">
          <button type="submit" className="btn btn-primary">
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
