import React, { useEffect, useMemo, useState } from 'react';
import additionalInfoConfig from '../config/additionalInfo.json';
import InfoPopover from './InfoPopover.jsx';
import DisclaimerPopover from './DisclaimerPopover.jsx';

function AdditionalInformation({ context = {}, value, onChange, onValidityChange, onDisclaimersChange, showErrors = false }) {
  const { title, description, questions } = additionalInfoConfig;

  const normalizedQuestions = useMemo(() => {
    const normalizeOption = (opt) => {
      if (typeof opt === 'string') return { value: opt, label: opt, disclaimer: null };
      const value = opt.value ?? opt.label ?? '';
      return { value, label: opt.label ?? value, disclaimer: opt.disclaimer || null };
    };
    return questions.map((q) => ({
      ...q,
      options: (q.options || []).map(normalizeOption),
    }));
  }, [questions]);
  const [answers, setAnswers] = useState(() => {
    if (value) return value;
    const seed = {};
    normalizedQuestions.forEach((q) => {
      seed[q.id] = '';
    });
    return seed;
  });

  useEffect(() => {
    if (value) setAnswers(value);
  }, [value]);

  const visibleQuestions = useMemo(() => {
    return normalizedQuestions.filter((q) => {
      if (!q.showIf) return true;
      const { field, equals } = q.showIf;
      return context[field] === equals;
    });
  }, [context, normalizedQuestions]);

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

  const activeDisclaimers = useMemo(() => {
    return visibleQuestions
      .map((q) => {
        const selected = (q.options || []).find((opt) => opt.value === (answers[q.id] ?? ''));
        if (selected?.disclaimer) {
          return { id: `ai-${q.id}`, label: q.label, message: selected.disclaimer };
        }
        return null;
      })
      .filter(Boolean);
  }, [visibleQuestions, answers]);

  useEffect(() => {
    if (onValidityChange) onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  useEffect(() => {
    if (onDisclaimersChange) onDisclaimersChange(activeDisclaimers);
  }, [activeDisclaimers, onDisclaimersChange]);

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
              const selectedOpt = (q.options || []).find((opt) => opt.value === value);
              return (
                <div className="col-12" key={q.id}>
                  <label className="form-label mb-1 d-flex align-items-center gap-2">
                    <span>{q.label}{requiredMark}</span>
                    {q.info ? <InfoPopover content={q.info} label={`More about ${q.label}`} /> : null}
                  </label>
                  <select
                    className={`form-select ${isInvalid ? 'is-invalid' : ''}`}
                    required={q.required}
                    value={value}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  >
                    <option value="">{q.placeholder || 'Select an option'}</option>
                    {(q.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {selectedOpt?.disclaimer ? (
                    <div className="mt-2">
                      <DisclaimerPopover content={selectedOpt.disclaimer} label={`${q.label} disclaimer`} />
                    </div>
                  ) : null}
                  {isInvalid ? <div className="invalid-feedback">This field is required.</div> : null}
                </div>
              );
            }

            if (q.type === 'textarea') {
              return (
                <div className="col-12" key={q.id}>
                  <label className="form-label mb-1 d-flex align-items-center gap-2">
                    <span>{q.label}{requiredMark}</span>
                    {q.info ? <InfoPopover content={q.info} label={`More about ${q.label}`} /> : null}
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
