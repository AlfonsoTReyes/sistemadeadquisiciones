"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPlus, faBell } from "@fortawesome/free-solid-svg-icons";
import Menu from "../menu";
import ModalDocumentos from "./formularios/agregar_documento";
import VerEvidencia from "./formularios/verEvidencia";

export default function SolicitudesPage() {
  const [isSubirDocOpen, setItSubirDocOpen] = useState(false);
  const [isModalDocumentosOpen, setIsModalDocumentosOpen] = useState(false);
  const [selectedFolio, setSelectedFolio] = useState<number | null>(null);

  const solicitudes = [
    {
      folio: 1,
      comentario: "Solicitud para contratación de la nube",
      fecha: "10/02/2025",
      estatus: "Aprobado",
    },
  ];

  //Estados de la ventana modal para subir archivos
  const openSubirDocsModal = (folio: number) => {
    setSelectedFolio(folio);
    setItSubirDocOpen(true);
  };

  const closeSubirDocsModal = () => {
    setItSubirDocOpen(false);
    setSelectedFolio(null);
  };

  //Estados de la ventana modal para visualizar las facturas relacionadas a determinada orden de refacción
  const openModalDocumentos = (folio: number) => {
    setSelectedFolio(folio);
    setIsModalDocumentosOpen(true);
  };

  const closeModalDocumentos = () => {
    setSelectedFolio(null);
    setIsModalDocumentosOpen(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Menú con control de apertura */}
      <Menu/>

      {/* Contenido que se mueve dependiendo del menú */}
      <div
        className={`flex-1 bg-cream p-8 pt-20 transition-all duration-300 ${
          isMenuOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Solicitudes</h1>
          <div className="relative">
            <FontAwesomeIcon icon={faBell} className="text-blue-500 text-2xl" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              1
            </span>
          </div>
        </div>

        <button className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition">
          <FontAwesomeIcon icon={faPlus} />
          Nueva Solicitud
        </button>

        <div className="mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-white" style={{ backgroundColor: "#faa21b" }}>
                <th className="p-3">Folio</th>
                <th className="p-3">Comentario</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Estatus</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.folio} className="border-b">
                  <td className="p-3 text-center">
                  <button
                      onClick={() => openModalDocumentos(solicitud.folio)}
                      className="text-blue-500 hover:underline"
                    >{solicitud.folio}
                    </button>
                    <FontAwesomeIcon icon={faEye} className="text-blue-600 cursor-pointer" />
                  </td>
                  <td className="p-3">{solicitud.comentario}</td>
                  <td className="p-3 text-center">{solicitud.fecha}</td>
                  <td className="p-3 text-center">{solicitud.estatus}</td>
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => openSubirDocsModal(solicitud.folio)}
                        className="text-green-600 flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        Agregar documentos
                      </button>
                      <button className="text-blue-600 flex items-center gap-1">
                        <FontAwesomeIcon icon={faEye} />
                        Ver documentos
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manejador de ventana modal para ver información de las facturas de una orden de refacción */}
      {isSubirDocOpen &&  (
          <ModalDocumentos
            idFolio={selectedFolio}
            onClose={closeSubirDocsModal}
          />
        )}

        {/* Manejador de ventana modal para ver información de las facturas de una orden de refacción */}
        {isModalDocumentosOpen && selectedFolio !== null && (
          <VerEvidencia
            idFolio={selectedFolio}
            onClose={closeModalDocumentos}
          />
        )}

      {/* Modal para agregar documentos */}
      {/*isSubirDocOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-bold">Agregar documentos - Folio {selectedFolio}</h2>
              <button onClick={closeSubirDocsModal} className="text-gray-500 hover:text-gray-700">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="mt-4">
              <input type="file" className="w-full border p-2 rounded-md" />
              <button className="w-full bg-blue-600 text-white p-2 rounded-md mt-4 hover:bg-blue-700">
                Subir Documento
              </button>
            </div>
          </div>
        </div>
      )*/}
    </div>
  );
}
