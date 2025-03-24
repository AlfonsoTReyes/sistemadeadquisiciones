"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPlus, faBell, faTimes } from "@fortawesome/free-solid-svg-icons";
import Menu from "../menu";
import ModalDocumentos from "./formularios/agregar_documento";
import VerEvidencia from "./formularios/verEvidencia";
import ModalAdjudicar from "./formularios/adjudicar";

export default function RequisicionPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubirDocOpen, setItSubirDocOpen] = useState(false);
  const [isModalDocumentosOpen, setIsModalDocumentosOpen] = useState(false);
  const [isModalAdjudicar, setIsModalAdjudicar] = useState(false);
  const [selectedFolio, setSelectedFolio] = useState<number | null>(null);

  // Lista de documentos con ID
  const documentos = [
    { id_doc: 101, nombre: "Oficio Solicitud", fecha: "10/02/2025", estatus: "Aprobado" },
    { id_doc: 102, nombre: "Justificación", fecha: "11/02/2025", estatus: "Pendiente" },
    { id_doc: 103, nombre: "Techo Presupuestal", fecha: "12/02/2025", estatus: "Pendiente" },
  ];

  // Funciones para abrir y cerrar modales con id_doc
  const openSubirDocsModal = (idDoc: number) => {
    setSelectedFolio(idDoc);
    setItSubirDocOpen(true);
  };

  const closeSubirDocsModal = () => {
    setItSubirDocOpen(false);
    setSelectedFolio(null);
  };

  const openModalDocumentos = (idDoc: number) => {
    setSelectedFolio(idDoc);
    setIsModalDocumentosOpen(true);
  };

  const closeModalDocumentos = () => {
    setSelectedFolio(null);
    setIsModalDocumentosOpen(false);
  };


  const openModalAdjudicar = (idDoc: number) => {
    setSelectedFolio(idDoc);
    setIsModalAdjudicar(true);
  };

  const closeModalAdjudicar = () => {
    setSelectedFolio(null);
    setIsModalAdjudicar(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Menú */}
      <Menu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Contenido principal */}
      <div className={`flex-1 bg-cream p-8 pt-20 transition-all duration-300 ${isMenuOpen ? "ml-64" : "ml-0"}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Solicitud Requisición</h1>
          <div className="relative">
            <FontAwesomeIcon icon={faBell} className="text-blue-500 text-2xl" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              1
            </span>
          </div>
        </div>

        {/* Botón agregar detalles */}
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition">
          Adjudicar
        </button>

        {/* Tabla */}
        <div className="mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-white" style={{ backgroundColor: "#faa21b" }}>
                <th className="p-3">Documento</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Estatus</th>
                <th className="p-3">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((documento) => (
                <tr key={documento.id_doc} className="border-b">
                  <td className="p-3 flex items-center gap-2">
                    <button
                      onClick={() => openModalDocumentos(documento.id_doc)}
                      className="text-blue-500 hover:underline"
                    >
                      {documento.nombre}
                    </button>
                    <FontAwesomeIcon icon={faEye} className="text-blue-600 cursor-pointer" />
                  </td>
                  <td className="p-3 text-center">{documento.fecha}</td>
                  <td className="p-3 text-center">{documento.estatus}</td>
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => openSubirDocsModal(documento.id_doc)}
                        className="text-green-600 flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        Agregar
                      </button>
                      <button onClick={() => openModalDocumentos(documento.id_doc)} className="text-blue-600 flex items-center gap-1">
                        <FontAwesomeIcon icon={faEye} />
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {isSubirDocOpen && (
        <ModalDocumentos idFolio={selectedFolio} onClose={closeSubirDocsModal} />
      )}

      {isModalDocumentosOpen && selectedFolio !== null && (
        <VerEvidencia idFolio={selectedFolio} onClose={closeModalDocumentos} />
      )}

      {isModalAdjudicar && selectedFolio !== null && (
        <ModalAdjudicar idFolio={selectedFolio} onClose={closeModalAdjudicar}/>
      )}
    </div>
  );
}
