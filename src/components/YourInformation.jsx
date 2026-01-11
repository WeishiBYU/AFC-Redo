import React, { useEffect, useMemo, useRef, useState } from 'react';
import config from '../config/yourInfo.json';

function YourInformation({ value, onChange, onValidityChange, showErrors = false }) {
  const { title, description, fields } = config;
  const formRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const pollTimeoutRef = useRef(null);
  const stopTimeoutRef = useRef(null);
  const pollingEnabledRef = useRef(true);
  const [values, setValues] = useState(() => {
    if (value) return value;
    const seed = {};
    fields.forEach((f) => {
      seed[f.id] = '';
    });
    return seed;
  });

  useEffect(() => {
    if (value) setValues(value);
  }, [value]);

  const syncFromDom = () => {
    if (!pollingEnabledRef.current) return;
    const node = formRef.current;
    if (!node) return;
    const collected = {};
    node.querySelectorAll('[data-field-id]').forEach((el) => {
      const id = el.getAttribute('data-field-id');
      if (!id) return;
      collected[id] = el.value ?? '';
    });
    setValues((prev) => {
      let changed = false;
      const next = { ...prev };
      Object.keys(collected).forEach((k) => {
        const incoming = collected[k];
        // Avoid overwriting a populated field with an empty value during autofill churn.
        if (incoming === '' && prev[k]) return;
        if (incoming !== prev[k]) {
          next[k] = incoming;
          changed = true;
        }
      });
      if (!changed) return prev;
      // After a change, let polling run a short tail then stop to avoid flicker.
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = setTimeout(() => {
        pollingEnabledRef.current = false;
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      }, 450);
      if (onChange) onChange(next);
      return next;
    });
  };

  const stopPolling = () => {
    pollingEnabledRef.current = false;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
  };

  const startPolling = (durationMs = 2000) => {
    stopPolling();
    pollingEnabledRef.current = true;
    syncFromDom();
    pollIntervalRef.current = setInterval(syncFromDom, 120);
    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
    }, durationMs);
  };

  // Initial short poll to capture browser autofill after mount.
  useEffect(() => {
    startPolling(2200);
    return stopPolling;
  }, []);

  const visibleFields = useMemo(() => {
    return fields.filter((f) => {
      if (!f.showIf) return true;
      const { field, equals } = f.showIf;
      return values[field] === equals;
    });
  }, [fields, values]);

  const isValid = useMemo(() => {
    return visibleFields.every((f) => {
      if (!f.required) return true;
      return (values[f.id] ?? '').toString().trim().length > 0;
    });
  }, [visibleFields, values]);

  useEffect(() => {
    if (onValidityChange) onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  useEffect(() => {
    if (onChange) onChange(values);
  }, [values, onChange]);

  const handleChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const renderField = (f) => {
    const val = values[f.id] ?? '';
    const requiredMark = f.required ? <span className="text-danger ms-1">*</span> : null;
    const isInvalid = showErrors && f.required && (val ?? '').toString().trim().length === 0;

    const autoCompleteMap = {
      firstName: 'given-name',
      lastName: 'family-name',
      email: 'email',
      phone: 'tel',
      address1: 'address-line1',
      address2: 'address-line2',
      city: 'address-level2',
      state: 'address-level1',
      zip: 'postal-code',
      attending: 'off',
      payment: 'off',
      special: 'off',
    };
    const autoComplete = autoCompleteMap[f.id] || 'on';

    if (f.type === 'select') {
      return (
        <div className="col-12" key={f.id}>
          <label className="form-label mb-1">{f.label}{requiredMark}</label>
          <select
            className={`form-select ${isInvalid ? 'is-invalid' : ''}`}
            required={f.required}
            value={val}
            autoComplete={autoComplete}
            name={f.id}
            data-field-id={f.id}
            onInput={(e) => handleChange(f.id, e.target.value)}
            onChange={(e) => handleChange(f.id, e.target.value)}
          >
            <option value="">{f.placeholder || 'Select'}</option>
            {(f.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {isInvalid ? <div className="invalid-feedback">This field is required.</div> : null}
        </div>
      );
    }

    if (f.type === 'textarea') {
      return (
        <div className="col-12" key={f.id}>
          <label className="form-label mb-1">{f.label}{requiredMark}</label>
          <textarea
            className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
            rows="3"
            required={f.required}
            value={val}
            placeholder={f.placeholder || ''}
            autoComplete={autoComplete}
            name={f.id}
            data-field-id={f.id}
            onInput={(e) => handleChange(f.id, e.target.value)}
            onChange={(e) => handleChange(f.id, e.target.value)}
          />
          {isInvalid ? <div className="invalid-feedback">This field is required.</div> : null}
        </div>
      );
    }

    return (
      <div className="col-md-6" key={f.id}>
        <label className="form-label mb-1">{f.label}{requiredMark}</label>
        <input
          type={f.type || 'text'}
          className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
          required={f.required}
          value={val}
          placeholder={f.placeholder || ''}
          autoComplete={autoComplete}
          name={f.id}
          data-field-id={f.id}
          onInput={(e) => handleChange(f.id, e.target.value)}
          onChange={(e) => handleChange(f.id, e.target.value)}
        />
        {isInvalid ? <div className="invalid-feedback">This field is required.</div> : null}
      </div>
    );
  };

  return (
    <div className="card">
      <form
        className="card-body"
        ref={formRef}
        autoComplete="on"
        onSubmit={(e) => e.preventDefault()}
        onFocusCapture={() => {
          startPolling(1500);
        }}
      >
        <h2 className="h4 mb-2">{title}</h2>
        {description ? <p className="text-muted mb-4">{description}</p> : null}
        <div className="row g-3">
          {visibleFields.map(renderField)}
        </div>
      </form>
    </div>
  );
}

export default YourInformation;
