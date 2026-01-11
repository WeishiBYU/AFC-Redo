import React, { useMemo } from 'react';
import pricingConfig from '../config/pricing.json';

function ReviewConfirm({ totals, additionalInfo, scheduling, yourInfo, quoteSelections }) {
  const { categories, currency, minTotal } = pricingConfig;

  const serviceLines = useMemo(() => {
    const lines = [];
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        const sel = quoteSelections?.[item.id];
        const qty = sel?.qty || 0;
        if (qty > 0) {
          lines.push({
            category: cat.label,
            label: item.label,
            qty,
            protect: sel?.protect,
            deodorize: sel?.deodorize,
            unitPrice: item.basePrice,
            linePrice: item.basePrice * qty,
          });
        }
      });
    });
    return lines;
  }, [categories, quoteSelections]);

  const fmt = (n) => `${currency}${(n ?? 0).toFixed(2)}`;

  const renderInfoList = (obj) => {
    if (!obj) return <p className="text-muted mb-0">No details provided.</p>;
    return (
      <dl className="row mb-0">
        {Object.entries(obj).map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="col-4 text-capitalize small text-muted">{k}</dt>
            <dd className="col-8 mb-1">{v || <span className="text-muted">—</span>}</dd>
          </React.Fragment>
        ))}
      </dl>
    );
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h4 mb-3">Review & Confirm</h2>

        <h5 className="mt-3">Services</h5>
        {serviceLines.length === 0 ? (
          <p className="text-muted">No services selected.</p>
        ) : (
          <ul className="list-group mb-3">
            {serviceLines.map((line, idx) => (
              <li key={`${line.label}-${idx}`} className="list-group-item d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-semibold">{line.label}</div>
                  <small className="text-muted">{line.category}</small>
                  <div className="small text-muted">Qty {line.qty}</div>
                  <div className="small text-muted">Protect: {line.protect ? 'Yes' : 'No'}; Deodorize: {line.deodorize || 'none'}</div>
                </div>
                <div className="text-end">
                  <div className="fw-semibold">{fmt(line.linePrice)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h5>Additional Information</h5>
        {additionalInfo ? renderInfoList(additionalInfo) : <p className="text-muted">No additional info.</p>}

        <h5 className="mt-3">Scheduling</h5>
        {scheduling?.slot ? (
          <p className="mb-1">{scheduling.slot.label}</p>
        ) : scheduling?.requestedCallback ? (
          <p className="mb-1">Callback requested for scheduling.</p>
        ) : (
          <p className="text-muted">No slot selected.</p>
        )}
        {scheduling?.date ? <p className="small text-muted mb-2">Date: {scheduling.date.toDateString()}</p> : null}

        <h5 className="mt-3">Your Information</h5>
        {yourInfo ? renderInfoList(yourInfo) : <p className="text-muted">No contact info provided.</p>}

        <div className="mt-4">
          <div className="d-flex justify-content-between fw-semibold">
            <span>Subtotal</span>
            <span>{fmt(totals?.subtotal || 0)}</span>
          </div>
          <div className="d-flex justify-content-between fw-semibold mt-1">
            <span>Total (min ${minTotal})</span>
            <span>{fmt(totals?.enforcedTotal || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewConfirm;
