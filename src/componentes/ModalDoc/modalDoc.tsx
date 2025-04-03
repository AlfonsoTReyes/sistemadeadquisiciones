interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
const ModalDoc: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    // Overlay oscuro
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">

      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fade-in-down"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold z-50"
          aria-label="Cerrar modal"
        >
          ×
        </button>

        {children}

      </div>
       {/*<div className="fixed inset-0 z-30" onClick={onClose}></div>*/}
    </div>
  );
};

 export default ModalDoc