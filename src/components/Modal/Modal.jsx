/**
 * Modal.jsx
 * 
 * A reusable overlay dialog component.
 * 
 * Features:
 *   - Fades in with a semi-transparent backdrop
 *   - Scales up from 95% for a polished entrance
 *   - Closes when clicking the backdrop (outside the modal)
 *   - Closes when pressing the Escape key
 *   - Renders nothing when isOpen is false
 * 
 * Usage:
 *   <Modal title="Add Member" isOpen={showModal} onClose={() => setShowModal(false)}>
 *     <input ... />
 *     <button>Save</button>
 *   </Modal>
 */

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export default function Modal({ title, isOpen, onClose, children }) {
  const overlayRef = useRef(null);

  // Listen for the Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Only add the listener when the modal is open
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup: remove the listener when the modal closes or unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Don't render anything if the modal isn't open
  if (!isOpen) {
    return null;
  }

  // Close when clicking the dark backdrop (but not the modal itself)
  const handleBackdropClick = (event) => {
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleBackdropClick}
    >
      <div className="modal">
        {/* ── Header ── */}
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ── Body (whatever content is passed as children) ── */}
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>
  );
}
