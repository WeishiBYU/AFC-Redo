import React, { useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import schedulingConfig from '../config/scheduling.json';
import 'react-calendar/dist/Calendar.css';

// Placeholder slot fetcher; replace with Google Sheets integration.
function mockFetchSlots(date) {
  // Return fewer slots on weekends as a simple demo.
  const isWeekend = [0, 6].includes(date.getDay());
  if (isWeekend) {
    return [
      { id: '10', label: '10:00 AM - 12:00 PM' },
      { id: '13', label: '1:00 PM - 3:00 PM' },
    ];
  }
  return [
    { id: '9', label: '9:00 AM - 11:00 AM' },
    { id: '12', label: '12:00 PM - 2:00 PM' },
    { id: '15', label: '3:00 PM - 5:00 PM' },
  ];
}

function Scheduling({ onSelectSlot, selectedSlot, onValidityChange, showErrors = false }) {
  const { title, description, fallbackText, blackoutDates, leadDays } = schedulingConfig;
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + leadDays);
    return d;
  });
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestedCallback, setRequestedCallback] = useState(false);

  const blackoutSet = useMemo(() => new Set(blackoutDates || []), [blackoutDates]);

  const isDateDisabled = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    if (blackoutSet.has(key)) return true;
    if (leadDays > 0) {
      const now = new Date();
      const min = new Date(now);
      min.setDate(now.getDate() + leadDays);
      if (date < min) return true;
    }
    return false;
  };

  useEffect(() => {
    setLoading(true);
    // TODO: Replace with Google Sheets fetch; expect an array of slots for the date.
    const timer = setTimeout(() => {
      const nextSlots = mockFetchSlots(selectedDate);
      setSlots(nextSlots);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(Boolean(selectedSlot) || requestedCallback);
    }
  }, [onValidityChange, selectedSlot, requestedCallback]);

  const isInvalid = showErrors && !selectedSlot && !requestedCallback;

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSlotSelect = (slot) => {
    setRequestedCallback(false);
    if (onSelectSlot) onSelectSlot({ date: selectedDate, slot });
  };

  const selectionSummary = () => {
    if (selectedSlot) {
      const dateLabel = formatDate(new Date(selectedSlot.date));
      return `Selected: ${dateLabel} — ${selectedSlot.slot.label}`;
    }
    if (requestedCallback) {
      const dateLabel = formatDate(selectedDate);
      return `Callback requested for ${dateLabel}`;
    }
    return 'No time selected yet.';
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h4 mb-2">{title}</h2>
        {description ? <p className="text-muted mb-4">{description}</p> : null}
        <div className="row g-4">
          <div className="col-lg-6">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileDisabled={({ date }) => isDateDisabled(date)}
            />
          </div>
          <div className="col-lg-6">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h3 className="h6 mb-0">Available slots</h3>
              {loading ? <span className="text-muted small">Loading…</span> : null}
            </div>
            {isInvalid ? <div className="text-danger small mb-2">Select a slot or request a callback.</div> : null}
            {slots.length === 0 && !loading ? (
                  <div className="alert alert-warning py-2 px-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>No slots available for this date.</div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setRequestedCallback(true)}
                      >
                        Request callback
                      </button>
                </div>
                <div className="small text-muted mt-2">{fallbackText}</div>
              </div>
            ) : (
              <div className="list-group">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedSlot?.slot?.id === slot.id ? 'active' : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <span>{slot.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 p-3 bg-success bg-opacity-10 border border-success rounded">
          <div className="fw-semibold mb-1 text-success">Your selection</div>
          <div className="small mb-0 text-success">{selectionSummary()}</div>
        </div>
      </div>
    </div>
  );
}

export default Scheduling;
