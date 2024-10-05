import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/Home.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FaSyncAlt } from "react-icons/fa"; // Ícone de refresh
import { useNavigate } from "react-router-dom"; // Use useNavigate em vez de useHistory

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Home = () => {
  const [statCards, setStatCards] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const accessToken = localStorage.getItem("accessToken");
  const navigate = useNavigate(); // Use useNavigate

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:8080/scupp/api/v1/admin/events/home", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setStatCards(data.statCards);
      setGraphData(data.graphData);
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    }
  };

  const handleShowEvents = (status) => {
    if (status === "CREATED") return; // Não faz nada para o status "CREATED"

    // Navega para a página de eventos com o status selecionado
    navigate(`/events/status/${status}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = {
    labels: graphData ? graphData.dataPoints.map((point) => point.date) : [],
    datasets: [
      {
        label: graphData ? graphData.title : "",
        data: graphData ? graphData.dataPoints.map((point) => point.value) : [],
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };

  return (
    <div className="container mt-5">
      {/* Botão de refresh */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard de Eventos</h2>
        <button className="btn btn-light" onClick={fetchData}>
          <FaSyncAlt /> Atualizar
        </button>
      </div>

      {/* Estatísticas */}
      <div className="row">
        {statCards.map((card, index) => (
          <div key={index} className={`col-md-3 mb-4 stat-card-${index}`}>
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">{card.value}</h5>
                <p className="card-text">{card.title}</p>
                {card.status !== "CREATED" && (
                  <button
                    className="btn btn-light"
                    onClick={() => handleShowEvents(card.status)}
                  >
                    {card.buttonLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="card mt-5">
        <div className="card-body">
          {graphData ? <Line data={chartData} /> : <p>Carregando gráfico...</p>}
        </div>
      </div>
    </div>
  );
};

export default Home;
