import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BlobServiceClient } from "@azure/storage-blob"; // Importar o BlobServiceClient
import { v4 as uuidv4 } from "uuid"; // Importar UUID

const CreateEvent = () => {
  const [eventName, setEventName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null); // Armazena o arquivo da imagem
  const [uploading, setUploading] = useState(false); // Estado para controlar o upload
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

  // Função para realizar upload da imagem para o Azure Storage
  const handleImageUpload = async () => {
    if (!imageFile) return;

    setUploading(true); // Definindo o estado de upload

    const sasToken = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-11-01T00:55:33Z&st=2024-09-30T16:55:33Z&spr=https,http&sig=b00rR9CRQgzbl2JM%2FCCF0QBIMM%2B7bzjl3CekUT3abpw%3D";
    const blobServiceClient = new BlobServiceClient(
      `https://scuppmedi4.blob.core.windows.net?${sasToken}`
    );
    const containerClient = blobServiceClient.getContainerClient("scupp-media");

    const blobName = `${uuidv4()}-event-img.png`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
      const uploadBlobResponse = await blockBlobClient.uploadBrowserData(imageFile);
      console.log(`Imagem carregada com sucesso. ID da transação: ${uploadBlobResponse.requestId}`);

      // Definir a URL pública da imagem no Azure Blob Storage
      setImageUrl(`https://scuppmedi4.blob.core.windows.net/scupp-media/${blobName}`);
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
    } finally {
      setUploading(false); // Upload concluído
    }
  };

  // Função para remover a imagem carregada
  const handleRemoveImage = () => {
    setImageUrl("");
    setImageFile(null);
  };

  // Função para submeter o evento
  const handleSubmitEvent = async (e) => {
    e.preventDefault();

    if (!imageUrl) {
      alert("Por favor, envie uma imagem primeiro.");
      return;
    }

    const eventData = {
      name: eventName,
      locationName: selectedLocation ? selectedLocation.name : locationName,
      description: description,
      imageUrl: imageUrl, // A URL da imagem é incluída aqui
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

        {/* Campo de Upload de Imagem */}
        <div className="form-group mt-3">
          <label>Upload da Imagem</label>
          {imageUrl ? (
            <div className="mt-2">
              <div className="position-relative">
                <img
                  src={imageUrl}
                  alt="Imagem do Evento"
                  style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
                />
                <button
                  type="button"
                  className="btn btn-danger position-absolute top-0 end-0"
                  onClick={handleRemoveImage}
                  style={{ fontSize: "1.2rem", lineHeight: "1rem" }}
                >
                  &times;
                </button>
              </div>
            </div>
          ) : (
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          )}
        </div>

        <div className="d-flex justify-content-start mt-4">
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={handleImageUpload}
            disabled={!imageFile || uploading}
          >
            {uploading ? "Enviando..." : "Enviar Imagem"}
          </button>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button type="submit" className="btn btn-success" disabled={uploading || !imageUrl}>
            Criar Evento
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
