import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";

const CreateEvent = () => {
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
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showCepInput, setShowCepInput] = useState(false);
  const [cep, setCep] = useState("");
  const [confirmAddress, setConfirmAddress] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    setLocations([]);
    setSelectedLocation(null);
    setShowCepInput(false);
    setConfirmAddress(false);
    setAddressConfirmed(false);
  }, [locationName]);

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
      if (data.length === 0) {
        setShowCepInput(true);
        setLocations([]);
      } else {
        setLocations(data);
        setShowCepInput(false);
      }
    } catch (error) {
      console.log("Erro ao buscar locais:", error);
    }
  };

  const searchAddressByCep = async () => {
    if (!cep) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json`);
      const data = await response.json();

      if (data && !data.erro) {
        setAddress({
          postalCode: data.cep || "",
          street: data.logradouro || "",
          complement: data.complemento || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
          lat: address.lat,
          lng: address.lng,
        });
        setConfirmAddress(true);
      } else {
        alert("CEP não encontrado.");
      }
    } catch (error) {
      console.log("Erro ao buscar endereço:", error);
    }
  };

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

  const handleRemoveImage = () => {
    setImageUrl("");
    setImageFile(null);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/scupp/api/v1/admin/events/categories", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setCategories(data);
      setShowCategoryModal(true);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const handleCategorySelect = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
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
      locationName: selectedLocation ? selectedLocation.name : locationName,
      description: description,
      imageUrl: uploadedImageUrl,
      address: {
        id: address.id,
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
        startAt: startAt, // Novo campo preenchido pelo usuário
        endAt: endAt, // Novo campo preenchido pelo usuário
      },
      categories: selectedCategories.map((id) => ({ id })),
      company: {
        id: null,
        name: "SCUPP",
        email: "scuppoficial@gmail.com",
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
        const responseData = await response.json();
        setSuccessMessage(`Evento criado com sucesso! ID: ${responseData}`);
      } else {
        console.log("Erro ao criar evento.");
      }
    } catch (error) {
      console.log("Erro ao submeter evento:", error);
    }
  };

  const handleSelectLocation = (index) => {
    if (index < 0) {
      setSelectedLocation(null);
      return;
    }
    const location = locations[index];
    if (location) {
      setSelectedLocation(location);
      setLocationName(location.name); 
      setAddress({
        id: location.id || "",
        postalCode: location.postalCode || "",
        street: location.street || "",
        complement: location.complement || "",
        neighborhood: location.neighborhood || "",
        city: location.city || "",
        state: location.state || "",
        lat: location.lat || 0,
        lng: location.lng || 0,
      });
      setAddressConfirmed(true); 
    } else {
      setSelectedLocation(null);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Criar Evento</h2>
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}
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
          <button type="button" className="btn btn-primary mt-2" onClick={searchLocations}>
            Buscar Local do Evento
          </button>
        </div>


        
        {locations.length > 0 && !addressConfirmed && (
          <div className="form-group mt-3">
            <label>Selecione o Endereço</label>
            <select
              className="form-control"
              onChange={(e) => handleSelectLocation(e.target.selectedIndex - 1)}
            >
              <option value="">
                Selecione o endereço adequado para o local do evento mencionado:
              </option>
              {locations.map((location, index) => (
                <option key={index} value={location.name}>
                  {location.name} - {location.street}, {location.neighborhood}, {location.city} - {location.state}
                </option>
              ))}
            </select>
          </div>
        )}


        {/* Novo campo para StartAt */}
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

        {/* Novo campo para EndAt */}
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
          <button type="button" className="btn btn-secondary" onClick={fetchCategories}>
            Selecionar Categorias
          </button>
        </div>

        {showCategoryModal && (
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Selecione as Categorias</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCategoryModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <input
                        type="checkbox"
                        value={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategorySelect(category.id)}
                      />{" "}
                      {category.name}
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowCategoryModal(false)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCepInput && !confirmAddress && (
          <div className="form-group mt-3">
            <label>Informe o CEP</label>
            <input
              type="text"
              className="form-control"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
            />
            <button type="button" className="btn btn-secondary mt-2" onClick={searchAddressByCep}>
              Buscar Endereço pelo CEP
            </button>
          </div>
        )}

        {confirmAddress && (
          <div className="mt-3">
            <h5>Endereço encontrado</h5>
            <p>
              {address.street}, {address.neighborhood}, {address.city} - {address.state}
            </p>
            <div className="d-flex">
              <button
                type="button"
                className="btn btn-success me-2"
                onClick={() => {
                  setConfirmAddress(false);
                  setAddressConfirmed(true);
                }}
              >
                Confirmar Endereço
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setConfirmAddress(false);
                  setCep("");
                }}
              >
                Voltar para CEP
              </button>
            </div>
          </div>
        )}

        {addressConfirmed && (
          <div className="mt-3">
            <h5>Endereço Confirmado</h5>
            <p>
              {address.street}, {address.neighborhood}, {address.city} - {address.state}
            </p>
          </div>
        )}

        {showCepInput && (
          <>
            <div className="form-group mt-3">
              <label>Latitude</label>
              <input
                type="number"
                className="form-control"
                value={address.lat}
                onChange={(e) => setAddress({ ...address, lat: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Longitude</label>
              <input
                type="number"
                className="form-control"
                value={address.lng}
                onChange={(e) => setAddress({ ...address, lng: parseFloat(e.target.value) })}
                required
              />
            </div>
          </>
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
          <label>Upload da Imagem</label>
          {imageFile && (
            <div className="mt-2">
              <div className="position-relative">
                <img
                  src={URL.createObjectURL(imageFile)}
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
            Criar Evento
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
