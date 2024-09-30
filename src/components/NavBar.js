import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/NavBar.css"; // Criar um arquivo de estilo separado se necessário

const NavBar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/home">
        Home
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/criar-evento">
                Criar Evento
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/procurar-evento">
                Procurar Evento Específico
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/gerenciar-categorias">
                Gerenciar Categorias
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/meu-perfil">
                Meu Perfil
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
