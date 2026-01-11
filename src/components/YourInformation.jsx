import React, { useEffect, useMemo, useState } from 'react';
import config from '../config/yourInfo.json';

function YourInformation({ value, onChange, onValidityChange, showErrors = false }) {
  const { title, description, fields } = config;
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
          onChange={(e) => handleChange(f.id, e.target.value)}
        />
        {isInvalid ? <div className="invalid-feedback">This field is required.</div> : null}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h4 mb-2">{title}</h2>
        {description ? <p className="text-muted mb-4">{description}</p> : null}
        <div className="row g-3">
          {visibleFields.map(renderField)}
        </div>
      </div>
    </div>
  );
}

export default YourInformation;
