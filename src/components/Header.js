import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/Header.css";
const nickname = localStorage.getItem("nickname");
const Header = () => {
  return (
    <header className="header bg-light">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Logo e Menu Hamburguer */}
        <div className="header-left d-flex align-items-center">
          <Link to="/home">
          <img src={require('../img/logo.png')} alt="Logo" className="header-logo" />
          </Link>
          <button className="btn btn-light header-menu-button">
            <i className="fas fa-bars"></i>
          </button>
        </div>

          <div className="dropdown">
            <button
              className="btn btn-light dropdown-toggle"
              type="button"
              id="userDropdown"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="fas fa-user-circle"></i> {nickname}
            </button>
            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
              <Link className="dropdown-item" to="/meu-perfil">
                Meu Perfil
              </Link>
              <Link className="dropdown-item" to="/logout">
                Logout
              </Link>
            </div>
          </div>
        </div>
    </header>
  );
};

export default Header;
