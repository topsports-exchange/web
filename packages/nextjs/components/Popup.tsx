interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
const Popup = ({ isOpen, onClose, children }: PopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-gradient-radial at-center from-gray-800 via-gray-600 to-gray-400 rounded-lg p-6 relative">
        <button className="absolute top-2 right-2 text-white" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};
export default Popup;
