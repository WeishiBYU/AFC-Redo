import React, { useEffect, useRef, useState } from 'react';

function DisclaimerPopover({ content, label = 'Important disclaimer' }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonId = useRef(`disc-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    const handleClickAway = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickAway);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  if (!content) return null;

  return (
    <span
      className="position-relative d-inline-block align-middle"
      ref={wrapperRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="btn btn-warning btn-sm p-0 d-inline-flex align-items-center justify-content-center border-0"
        style={{ width: '1.2rem', height: '1.2rem', lineHeight: 1 }}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={`${buttonId}-panel`}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span className="fw-bold" style={{ fontSize: '0.75rem' }}>!</span>
      </button>
      {open ? (
        <div
          id={`${buttonId}-panel`}
          role="dialog"
          aria-modal="false"
          className="bg-white border rounded shadow-sm"
          style={{
            position: 'absolute',
            top: '50%',
            left: '100%',
            transform: 'translate(10px, -50%)',
            minWidth: '220px',
            maxWidth: '300px',
            zIndex: 1070,
            padding: '0.75rem',
            fontSize: '0.9rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
          }}
        >
          {typeof content === 'string' ? <span className="text-dark">{content}</span> : content}
        </div>
      ) : null}
    </span>
  );
}

export default DisclaimerPopover;
