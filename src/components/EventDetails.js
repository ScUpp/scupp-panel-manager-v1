import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Importando useNavigate para navegação
import { FaEdit } from "react-icons/fa"; // Ícone de editar
import "bootstrap/dist/css/bootstrap.min.css";

const EventDetails = () => {
  const { id } = useParams(); // Pega o id da URL
  const [event, setEvent] = useState(null);
  const accessToken = localStorage.getItem("accessToken");
  const navigate = useNavigate(); // Para navegação

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/scupp/api/v1/admin/events/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error("Erro ao buscar detalhes do evento:", error);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  if (!event) {
    return <div>Carregando...</div>;
  }

  const handleEditEvent = () => {
    navigate(`/edit-event/${id}`); // Redireciona para a página de edição
  };

  return (
    <div className="container mt-5">
      <h2>Detalhes do Evento</h2>
      <div className="card">
        <img src={event.eventImg} className="card-img-top" alt={event.eventName} />
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <h5 className="card-title">{event.eventName}</h5>
            <FaEdit className="edit-icon" onClick={handleEditEvent} style={{ cursor: "pointer" }} />
          </div>
          <p className="card-text">Endereço: {event.address}</p>
          <p className="card-text">Local: {event.location}</p>
          <p className="card-text">
            De: {new Date(event.startAt).toLocaleString()} <br />
            Até: {new Date(event.endAt).toLocaleString()}
          </p>
          <p className="card-text">Descrição: {event.eventDescription}</p>
          <p className="card-text">
            Inscritos: {event.totalSubscribers} <br />
            {event.live ? "Este evento está ao vivo!" : "Este evento não está ao vivo."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
