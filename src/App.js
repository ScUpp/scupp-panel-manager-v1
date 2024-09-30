import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import NavBar from "./components/NavBar";
import Header from "./components/Header"; // Importando o componente de Header
import CreateEvent from "./components/CreateEvent"; // Importando o componente de Criar Evento

function App() {
  const location = useLocation(); // Hook para obter a localização atual

  return (
    <>
      {/* Renderizar Header e NavBar em todas as rotas, exceto '/login' */}
      {location.pathname !== "/" && <Header />}
      {location.pathname !== "/" && <NavBar />}
      
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/criar-evento" element={<CreateEvent />} /> {/* Usando o componente de Criar Evento */}
          <Route path="/procurar-evento" element={<h1>Procurar Evento Específico</h1>} />
          <Route path="/gerenciar-categorias" element={<h1>Gerenciar Categorias</h1>} />
          <Route path="/meu-perfil" element={<h1>Meu Perfil</h1>} />
        </Routes>
      </div>
    </>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
