import React from 'react';
import { X, Download } from 'lucide-react';

interface GSTCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData?: {
    gstin: string;
    legalName: string;
    tradeName: string;
    address: string;
  };
}

const GSTCertificateModal: React.FC<GSTCertificateModalProps> = ({ 
  isOpen, 
  onClose, 
  certificateData = {
    gstin: 'XXAAAX1234AX120',
    legalName: 'XXXXXXXXXXXXX',
    tradeName: 'XXXXXXXXX XXXXX',
    address: 'XXXXXXXXMXXXXXXX\nXXXXXXXXMXXXXXXXX\nXXXXXXXX'
  }
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    // Handle download logic here
    console.log('Downloading GST Certificate');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">GST Certificate PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Certificate Content */}
        <div className="p-6">
          <div className="border-2 border-gray-800 rounded-lg p-8 bg-white">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">GST CERTIFICATE</h1>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-1/3">
                  <span className="text-lg font-semibold text-gray-900">1. GSTIN</span>
                </div>
                <div className="w-2/3 text-right">
                  <span className="text-lg font-bold text-gray-900">{certificateData.gstin}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-start">
                <div className="w-1/3">
                  <span className="text-lg font-semibold text-gray-900">2. Legal Name</span>
                </div>
                <div className="w-2/3 text-right">
                  <span className="text-lg font-bold text-gray-900">{certificateData.legalName}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-start">
                <div className="w-1/3">
                  <span className="text-lg font-semibold text-gray-900">3. Trade Name</span>
                </div>
                <div className="w-2/3 text-right">
                  <span className="text-lg font-bold text-gray-900">{certificateData.tradeName}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-start">
                <div className="w-1/3">
                  <span className="text-lg font-semibold text-gray-900">4. Address</span>
                </div>
                <div className="w-2/3 text-right">
                  <div className="text-lg font-bold text-gray-900 whitespace-pre-line">
                    {certificateData.address}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GSTCertificateModal; 