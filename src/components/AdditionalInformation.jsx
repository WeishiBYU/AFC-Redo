import React, { useEffect, useMemo, useState } from 'react';
import additionalInfoConfig from '../config/additionalInfo.json';

function AdditionalInformation({ context = {}, value, onChange, onValidityChange, showErrors = false }) {
  const { title, description, questions } = additionalInfoConfig;
  const [answers, setAnswers] = useState(() => {
    if (value) return value;
    const seed = {};
    questions.forEach((q) => {
      seed[q.id] = '';
    });
    return seed;
  });

  useEffect(() => {
    if (value) setAnswers(value);
  }, [value]);

  const visibleQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (!q.showIf) return true;
      const { field, equals } = q.showIf;
      return context[field] === equals;
    });
  }, [context, questions]);

  const isValid = useMemo(() => {
    return visibleQuestions.every((q) => {
      if (!q.required) return true;
      return (answers[q.id] ?? '').toString().trim().length > 0;
    });
  }, [visibleQuestions, answers]);

  const handleChange = (id, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      if (onChange) onChange(next);
      return next;
    });
  };

  useEffect(() => {
    if (onValidityChange) onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h4 mb-2">{title}</h2>
        {description ? <p className="text-muted mb-4">{description}</p> : null}
        <div className="row g-3">
          {visibleQuestions.map((q) => {
            const value = answers[q.id] ?? '';
            const requiredMark = q.required ? <span className="text-danger ms-1">*</span> : null;
            const isInvalid = showErrors && q.required && (value ?? '').toString().trim().length === 0;
            if (q.type === 'select') {
              return (
                <div className="col-12" key={q.id}>
                  <label className="form-label mb-1">
                    {q.label}
                    {requiredMark}
                  </label>
                  <select
                    className={`form-select ${isInvalid ? 'is-invalid' : ''}`}
                    required={q.required}
                    value={value}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  >
                    <option value="">{q.placeholder || 'Select an option'}</option>
                    {(q.options || []).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {isInvalid ? <div className="invalid-feedback">This field is required.</div> : null}
                </div>
              );
            }

            if (q.type === 'textarea') {
              return (
                <div className="col-12" key={q.id}>
                  <label className="form-label mb-1">
                    {q.label}
                    {requiredMark}
                  </label>
                  <textarea
                    className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
                    rows="3"
                    required={q.required}
                    value={value}
                    placeholder={q.placeholder || ''}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                  {isInvalid ? <div className="invalid-feedback">This field is required.</div> : null}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
}

export default AdditionalInformation;
