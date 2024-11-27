import React from 'react';

type CustomDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
};

const CustomDialog: React.FC<CustomDialogProps> = ({ open, onClose, title, description, children }) => {
  if (!open) return null;

  // Close the dialog only if clicking on the overlay
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white p-4 rounded shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
        {children}
      </div>
    </div>
  );
};

export default CustomDialog;
