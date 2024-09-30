import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const CreateEvent = () => {
  const [eventName, setEventName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [address, setAddress] = useState({
    postalCode: "",
    street: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    lat: 0,
    lng: 0,
  });
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const accessToken = localStorage.getItem("accessToken");

  // Função para buscar a lista de localidades com base no nome do local
  const searchLocations = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/scupp/api/v1/admin/events?locationName=${locationName}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.log("Erro ao buscar locais:", error);
    }
  };

  // Função para selecionar uma localização e preencher os campos de endereço
  const handleSelectLocation = (index) => {
    const location = locations[index];
    if (location) {
      setSelectedLocation(location);
      setAddress({
        postalCode: location.postalCode || "",
        street: location.street || "",
        complement: location.complement || "",
        neighborhood: location.neighborhood || "",
        city: location.city || "",
        state: location.state || "",
        lat: location.lat || 0,
        lng: location.lng || 0,
      });
    } else {
      setSelectedLocation(null);
    }
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();

    const eventData = {
      name: eventName,
      locationName: selectedLocation ? selectedLocation.name : locationName,
      description: description,
      imageUrl: imageUrl,
      address: {
        postalCode: address.postalCode,
        street: address.street,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
      },
      coord: {
        lat: address.lat,
        lng: address.lng,
      },
      duration: {
        startAt: "2024-09-29T23:54:12.837Z",
        endAt: "2024-09-29T23:54:12.837Z",
      },
      categories: [{ id: 1 }],
      company: {
        id: null,
        name: "Company Name",
        email: "company@example.com",
        cellNumber: "123456789",
      },
    };

    try {
      const response = await fetch("http://localhost:8080/scupp/api/v1/admin/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        console.log("Evento criado com sucesso!");
      } else {
        console.log("Erro ao criar evento.");
      }
    } catch (error) {
      console.log("Erro ao submeter evento:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Criar Evento</h2>
      <form onSubmit={handleSubmitEvent}>
        <div className="form-group">
          <label>Nome do Evento</label>
          <input
            type="text"
            className="form-control"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </div>

        <div className="form-group mt-3">
          <label>Nome da Localização</label>
          <input
            type="text"
            className="form-control"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            required
          />
          <button type="button" className="btn btn-primary mt-2" onClick={searchLocations}>
            Buscar Localização
          </button>
        </div>

        {locations.length > 0 && (
          <div className="form-group mt-3">
            <label>Selecione a Localização</label>
            <select
              className="form-control"
              onChange={(e) => handleSelectLocation(e.target.selectedIndex - 1)} // Ajustando o índice corretamente
            >
              <option value="">Selecione uma localização</option>
              {locations.map((location, index) => (
                <option key={index} value={location.name}>
                  {location.name} - {location.city}, {location.state}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedLocation && (
          <div className="mt-3">
            <h5>Endereço Selecionado</h5>
            <p>
              {selectedLocation.street}, {selectedLocation.city}, {selectedLocation.state}
            </p>
          </div>
        )}

        <div className="form-group mt-3">
          <label>Descrição</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="form-group mt-3">
          <label>URL da Imagem</label>
          <input
            type="text"
            className="form-control"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-success mt-4">
          Criar Evento
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
