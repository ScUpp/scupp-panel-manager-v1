import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Importando useNavigate para navegação
import "bootstrap/dist/css/bootstrap.min.css";

const EventsByStatusPage = () => {
  const { status } = useParams(); // Pega o status da URL
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const accessToken = localStorage.getItem("accessToken");
  const navigate = useNavigate(); // Hook para navegar

  const fetchEvents = async (pageNumber) => {
    try {
      const response = await fetch(
        `http://localhost:8080/scupp/api/v1/admin/events/status/${status}?page=${pageNumber}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setEvents(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    }
  };

  useEffect(() => {
    fetchEvents(page);
  }, [page, status]);

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`); // Redireciona para a página de detalhes do evento
  };

  return (
    <div className="main-content">
    <div className="container mt-5">
      <h2>Eventos - Status: {status}</h2>

      <div className="row">
        {events.map((event) => (
          <div key={event.id} className="col-md-4 mb-4">
            <div className="card">
              <img src={event.imgUrl} className="card-img-top" alt={event.name} />
              <div className="card-body">
                <p className="card-title">ID: {event.id}</p>
                <h5 className="card-title">{event.name}</h5>
                <p className="card-text">{event.address}</p>
                <p className="card-text">
                  De: {event.startAt} <br /> Até: {event.endAt}
                </p>
                {/* Botão para ver evento */}
                <button
                  className="btn btn-primary"
                  onClick={() => handleViewEvent(event.id)}
                >
                  Ver Evento
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button
          className="btn btn-secondary"
          onClick={handlePreviousPage}
          disabled={page === 0}
        >
          Página Anterior
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleNextPage}
          disabled={page >= totalPages - 1}
        >
          Próxima Página
        </button>
      </div>
    </div>
    </div>
  );
};

export default EventsByStatusPage;
