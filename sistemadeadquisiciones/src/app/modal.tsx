import React, { useState,useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

interface ModalProps {
  onClose: () => void;
  onFaceAuthenticated: (descriptor: Float32Array) => void;
}

const Modal: React.FC<ModalProps> = ({ onClose, onFaceAuthenticated }) => {
  const webcamRef = React.useRef<Webcam>(null);
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para el indicador de carga


  // Cargar los modelos de face-api.js
  const loadModels = async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  };

  useEffect(() => {
    loadModels(); // Cargar los modelos cuando se monta el modal
  }, []);

  // Función para capturar imagen y obtener descriptor facial
  const capture = async () => {
    setIsLoading(true);
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Crear un objeto de imagen para la detección facial
        const img = await faceapi.fetchImage(imageSrc);

        // Detectar un solo rostro en la imagen
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        
        if (detections && detections.descriptor) {
          // Enviar el descriptor facial al componente principal
          onFaceAuthenticated(detections.descriptor);
        } else {
          alert('No se detectó un rostro.');
        }
        setIsLoading(false); // Ocultar cargando
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Reconocimiento Facial</h2>
        
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="rounded-lg mb-4"
          width={340}
        />
        
        <div className="flex justify-between mt-4">
          <button onClick={capture} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Capturar Imagen
          </button>
          <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Cerrar
          </button>
          {isLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="flex flex-col items-center">
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
                <p className="mt-2 text-white">Cargando...</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Modal;
