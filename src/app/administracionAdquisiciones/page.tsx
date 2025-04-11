'use client';
import { useState, useEffect } from 'react';
import Menu from '../menu';
import Pie from '../pie';
import AltaTipoAdjudicacion from './formularios/alta';
import TablaAdjudicaciones from './tableAdquisiciones';
import { fetchAdjudicaciones } from '../peticiones_api/peticionCatalogoAdjudicaciones';

const TiposAdjudicacionPage = () => {
  const [adjudicaciones, setAdjudicaciones] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdjudicaciones();
      setAdjudicaciones(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Menu />
      <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
        <h1 className="text-2xl text-center font-bold mb-4">Tipos de Adjudicación</h1>

        <button onClick={openModal} className="bg-green-600 text-white p-2 rounded">
          Dar de alta nuevo tipo
        </button>

        {loading && <p>Cargando datos...</p>}
        {error && <p>Error: {error}</p>}

        <TablaAdjudicaciones datos={adjudicaciones} onActualizar={fetchData} />

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <AltaTipoAdjudicacion onClose={closeModal} onGuardado={fetchData} />
            </div>
          </div>
        )}
      </div>
      <Pie />
    </div>
  );
};

export default TiposAdjudicacionPage;
