import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom"; // Para pegar o id da URL

const EditEvent = () => {
  const { id } = useParams(); // Pega o id da URL
  const [eventName, setEventName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
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
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    // Buscar dados do evento para preenchimento
    const fetchEventData = async () => {
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
        setEventName(data.eventName);
        setLocationName(data.location);
        setDescription(data.eventDescription);
        setImageUrl(data.eventImg);
        setStartAt(data.startAt);
        setEndAt(data.endAt);
        setAddress({
          postalCode: data.address.split(",")[0],
          street: data.address.split(",")[1],
          neighborhood: data.address.split(",")[2],
          city: data.address.split(",")[3],
          state: data.address.split(",")[4],
          lat: data.lat,
          lng: data.lng,
        });
        // Aqui você pode preencher as categorias caso existam
      } catch (error) {
        console.error("Erro ao buscar detalhes do evento:", error);
      }
    };

    fetchEventData();
  }, [id]);

  const uploadImageToAzure = async () => {
    if (!imageFile) return null;
    setUploading(true);
    const sasToken =
      "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-11-01T00:55:33Z&st=2024-09-30T16:55:33Z&spr=https,http&sig=b00rR9CRQgzbl2JM%2FCCF0QBIMM%2B7bzjl3CekUT3abpw%3D";
    const blobServiceClient = new BlobServiceClient(
      `https://scuppmedi4.blob.core.windows.net?${sasToken}`
    );
    const containerClient = blobServiceClient.getContainerClient("scupp-media");

    const blobName = `${uuidv4()}-event-img.png`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
      const uploadBlobResponse = await blockBlobClient.uploadBrowserData(imageFile);
      console.log(`Imagem carregada com sucesso. ID da transação: ${uploadBlobResponse.requestId}`);
      return `https://scuppmedi4.blob.core.windows.net/scupp-media/${blobName}`;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();

    let uploadedImageUrl = imageUrl;
    if (imageFile) {
      uploadedImageUrl = await uploadImageToAzure();
      if (!uploadedImageUrl) {
        alert("Erro ao fazer upload da imagem.");
        return;
      }
    }

    const eventData = {
      name: eventName,
      locationName: locationName,
      description: description,
      imageUrl: uploadedImageUrl,
      address: {
        postalCode: address.postalCode,
        street: address.street,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
      },
      coord: {
        lat: address.lat,
        lng: address.lng,
      },
      duration: {
        startAt: startAt,
        endAt: endAt,
      },
      categories: selectedCategories.map((id) => ({ id })),
    };

    try {
      const response = await fetch(`http://localhost:8080/scupp/api/v1/admin/events/${id}`, {
        method: "PUT", // Aqui o método é PUT para atualizar
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        alert("Evento atualizado com sucesso!");
      } else {
        console.log("Erro ao atualizar evento.");
      }
    } catch (error) {
      console.log("Erro ao submeter evento:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Editar Evento</h2>
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
          <label>Nome do local do evento</label>
          <input
            type="text"
            className="form-control"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            required
          />
        </div>

        {/* Campos para Data e Hora */}
        <div className="form-group mt-3">
          <label>Data e Hora de Início</label>
          <input
            type="datetime-local"
            className="form-control"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            required
          />
        </div>

        <div className="form-group mt-3">
          <label>Data e Hora de Término</label>
          <input
            type="datetime-local"
            className="form-control"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            required
          />
        </div>

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
          <label>Upload da Imagem</label>
          {imageFile && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Imagem do Evento"
                style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
              />
              <button
                type="button"
                className="btn btn-danger position-absolute"
                onClick={() => setImageFile(null)}
              >
                Remover Imagem
              </button>
            </div>
          )}
          {!imageFile && (
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          )}
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button type="submit" className="btn btn-success" disabled={uploading}>
            Atualizar Evento
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
