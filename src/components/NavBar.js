import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/NavBar.css";

const NavBar = () => {
  return (
    <nav className="navbar-vertical bg-light">
      <div className="container-fluid">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/home">
              <i className="fas fa-home"></i> Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/criar-evento">
              <i className="fas fa-calendar-plus"></i> Criar Evento
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/procurar-evento">
              <i className="fas fa-search"></i> Procurar Evento
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/gerenciar-categorias">
              <i className="fas fa-tasks"></i> Gerenciar Categorias
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/meu-perfil">
              <i className="fas fa-user"></i> Meu Perfil
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
