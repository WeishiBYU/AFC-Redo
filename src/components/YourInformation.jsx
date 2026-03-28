import React, { useEffect, useMemo, useRef, useState } from 'react';
import config from '../config/yourInfo.json';
import InfoPopover from './InfoPopover.jsx';

function YourInformation({ value, onChange, onValidityChange, showErrors = false }) {
  const { title, description, fields } = config;
  const formRef = useRef(null);
  const editingFieldRef = useRef(null);
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

  const updateValue = (id, incoming, { allowEmpty = false } = {}) => {
    setValues((prev) => {
      if (!allowEmpty && incoming === '' && prev[id]) return prev;
      if (incoming === prev[id]) return prev;
      const next = { ...prev, [id]: incoming };
      if (onChange) onChange(next);
      return next;
    });
  };

  const syncFromDom = () => {
    const node = formRef.current;
    if (!node) return;
    node.querySelectorAll('[data-field-id]').forEach((el) => {
      const id = el.getAttribute('data-field-id');
      if (!id) return;
      if (editingFieldRef.current === id) return; // don't fight the actively edited field
      updateValue(id, el.value ?? '', { allowEmpty: true });
    });
  };

  // Capture autofill/edits via DOM observers and input/change events.
  useEffect(() => {
    const node = formRef.current;
    if (!node) return undefined;

    const handleInput = (e) => {
      const id = e.target?.dataset?.fieldId;
      if (!id) return;
      const incoming = e.target.value ?? '';
      updateValue(id, incoming, { allowEmpty: true });
    };

    node.addEventListener('input', handleInput, true);
    node.addEventListener('change', handleInput, true);

    // Initial sync to catch immediate autofill, then a short delayed sync.
    syncFromDom();
    const t = setTimeout(syncFromDom, 150);

    return () => {
      node.removeEventListener('input', handleInput, true);
      node.removeEventListener('change', handleInput, true);
      clearTimeout(t);
    };
  }, [onChange]);

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
    updateValue(id, value, { allowEmpty: true });
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
          <label className="form-label mb-1 d-flex align-items-center gap-2">
            <span>{f.label}{requiredMark}</span>
            {f.info ? <InfoPopover content={f.info} label={`More about ${f.label}`} /> : null}
          </label>
          <select
            className={`form-select ${isInvalid ? 'is-invalid' : ''}`}
            required={f.required}
            value={val}
            autoComplete={autoComplete}
            name={f.id}
            data-field-id={f.id}
            onFocus={() => { editingFieldRef.current = f.id; }}
            onBlur={() => { editingFieldRef.current = null; syncFromDom(); }}
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
          <label className="form-label mb-1 d-flex align-items-center gap-2">
            <span>{f.label}{requiredMark}</span>
            {f.info ? <InfoPopover content={f.info} label={`More about ${f.label}`} /> : null}
          </label>
          <textarea
            className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
            rows="3"
            required={f.required}
            value={val}
            placeholder={f.placeholder || ''}
            autoComplete={autoComplete}
            name={f.id}
            data-field-id={f.id}
            onFocus={() => { editingFieldRef.current = f.id; }}
            onBlur={() => { editingFieldRef.current = null; syncFromDom(); }}
            onInput={(e) => handleChange(f.id, e.target.value)}
            onChange={(e) => handleChange(f.id, e.target.value)}
          />
          {isInvalid ? <div className="invalid-feedback">This field is required.</div> : null}
        </div>
      );
    }

    return (
      <div className="col-md-6" key={f.id}>
        <label className="form-label mb-1 d-flex align-items-center gap-2">
          <span>{f.label}{requiredMark}</span>
          {f.info ? <InfoPopover content={f.info} label={`More about ${f.label}`} /> : null}
        </label>
        <input
          type={f.type || 'text'}
          className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
          required={f.required}
          value={val}
          placeholder={f.placeholder || ''}
          autoComplete={autoComplete}
          name={f.id}
          data-field-id={f.id}
          onFocus={() => { editingFieldRef.current = f.id; }}
          onBlur={() => { editingFieldRef.current = null; syncFromDom(); }}
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
