import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import NavBar from "./components/NavBar";
import Header from "./components/Header";
import CreateEvent from "./components/CreateEvent";
import EventsByStatusPage from "./components/EventsByStatusPage";
import EventDetails from "./components/EventDetails";
import EditEvent from "./components/EditEvent"; // Importando o componente de edição

function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/" && <Header />}
      {location.pathname !== "/" && <NavBar />}

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/criar-evento" element={<CreateEvent />} />
          <Route path="/procurar-evento" element={<h1>Procurar Evento Específico</h1>} />
          <Route path="/gerenciar-categorias" element={<h1>Gerenciar Categorias</h1>} />
          <Route path="/meu-perfil" element={<h1>Meu Perfil</h1>} />
          <Route path="/events/status/:status" element={<EventsByStatusPage />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/edit-event/:id" element={<EditEvent />} /> {/* Rota para edição */}
        </Routes>
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
