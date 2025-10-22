import React from 'react';

interface UserActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isActivating: boolean;
  userName: string;
}

const UserActivationModal: React.FC<UserActivationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isActivating, 
  userName 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Are you sure to {isActivating ? 'activate' : 'deactivate'}?
          </h3>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivationModal; 