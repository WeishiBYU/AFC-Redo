import React, { useMemo, useState } from 'react';
import pricingConfig from '../config/pricing.json';

function clamp(value, min) {
  return value < min ? min : value;
}

function formatCurrency(symbol, amount) {
  return `${symbol}${amount.toFixed(2)}`;
}

function QuoteEstimator() {
  const { currency, minTotal, categories, deodorizeOptions } = pricingConfig;
  const [selections, setSelections] = useState({});
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [qtyInputs, setQtyInputs] = useState({});

  const handleQtyChange = (itemId, delta) => {
    setSelections((prev) => {
      const current = prev[itemId] || { qty: 0, protect: false, deodorize: 'none' };
      const nextQty = clamp((current.qty || 0) + delta, 0);
      return { ...prev, [itemId]: { ...current, qty: nextQty } };
    });
    setQtyInputs((prev) => ({ ...prev, [itemId]: String(clamp((selections[itemId]?.qty || 0) + delta, 0)) }));
  };

  const handleQtyInput = (itemId, value) => {
    const parsed = Number.parseInt(value, 10);
    setQtyInputs((prev) => ({ ...prev, [itemId]: value }));
    setSelections((prev) => {
      const current = prev[itemId] || { qty: 0, protect: false, deodorize: 'none' };
      const nextQty = Number.isFinite(parsed) ? clamp(parsed, 0) : 0;
      return { ...prev, [itemId]: { ...current, qty: nextQty } };
    });
  };

  const handleQtyFocus = (itemId) => {
    setQtyInputs((prev) => ({ ...prev, [itemId]: '' }));
  };

  const handleQtyBlur = (itemId) => {
    setQtyInputs((prev) => {
      const raw = prev[itemId];
      if (raw === undefined || raw === '') {
        return { ...prev, [itemId]: '0' };
      }
      return prev;
    });
    setSelections((prev) => {
      const raw = qtyInputs[itemId];
      const parsed = Number.parseInt(raw, 10);
      const current = prev[itemId] || { qty: 0, protect: false, deodorize: 'none' };
      const nextQty = Number.isFinite(parsed) ? clamp(parsed, 0) : 0;
      return { ...prev, [itemId]: { ...current, qty: nextQty } };
    });
  };

  const handleProtectToggle = (itemId, enabled) => {
    setSelections((prev) => {
      const current = prev[itemId] || { qty: 0, protect: false, deodorize: 'none' };
      return { ...prev, [itemId]: { ...current, protect: enabled && (current.qty > 0) } };
    });
  };

  const handleDeodorize = (itemId, value) => {
    setSelections((prev) => {
      const current = prev[itemId] || { qty: 0, protect: false, deodorize: 'none' };
      return { ...prev, [itemId]: { ...current, deodorize: current.qty > 0 ? value : 'none' } };
    });
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    const lines = [];
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        const sel = selections[item.id];
        const qty = sel?.qty || 0;
        if (qty > 0) {
          const linePrice = item.basePrice * qty; // placeholder pricing logic
          subtotal += linePrice;
          lines.push({
            id: item.id,
            label: item.label,
            qty,
            unitPrice: item.basePrice,
            linePrice,
            protect: sel?.protect,
            deodorize: sel?.deodorize || 'none',
          });
        }
      });
    });
    const enforcedTotal = Math.max(subtotal, minTotal);
    return { subtotal, enforcedTotal, lines };
  }, [categories, minTotal, selections]);

  return (
    <>
      <div className="row g-4 pb-5 pb-lg-0">
      <div className="col-lg-8">
        <div className="accordion" id="quoteAccordion">
          {categories.map((cat, catIdx) => (
            <div className="accordion-item mb-3" key={cat.id}>
              <h2 className="accordion-header" id={`heading-${cat.id}`}>
                <button
                  className={`accordion-button ${catIdx === 0 ? '' : 'collapsed'}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${cat.id}`}
                  aria-expanded={catIdx === 0 ? 'true' : 'false'}
                  aria-controls={`collapse-${cat.id}`}
                >
                  <div className="d-flex flex-column">
                    <span>{cat.label}</span>
                    {cat.description ? (
                      <small className="text-muted">{cat.description}</small>
                    ) : null}
                  </div>
                </button>
              </h2>
              <div
                id={`collapse-${cat.id}`}
                className={`accordion-collapse collapse ${catIdx === 0 ? 'show' : ''}`}
                aria-labelledby={`heading-${cat.id}`}
              >
                <div className="accordion-body p-0">
                  <div className="table-responsive d-none d-md-block">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="w-50">Service</th>
                          <th className="text-center">Quantity</th>
                          <th className="text-center">Protect</th>
                          <th className="text-center">Deodorize</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.items.map((item) => {
                          const sel = selections[item.id] || { qty: 0, protect: false, deodorize: 'none' };
                          const displayQty = qtyInputs[item.id] ?? String(sel.qty ?? 0);
                          return (
                            <tr key={item.id}>
                              <td>
                                <div className="fw-semibold">{item.label}</div>
                                {item.unit ? <small className="text-muted">Per {item.unit}</small> : null}
                              </td>
                              <td className="text-center">
                                <div className="input-group input-group-sm justify-content-center" style={{ maxWidth: '150px', margin: '0 auto' }}>
                                  <button className="btn btn-outline-secondary" type="button" onClick={() => handleQtyChange(item.id, -1)}>-</button>
                                  <input
                                    type="number"
                                    className="form-control text-center"
                                    min="0"
                                    value={displayQty}
                                    onChange={(e) => handleQtyInput(item.id, e.target.value)}
                                    onFocus={() => handleQtyFocus(item.id)}
                                    onBlur={() => handleQtyBlur(item.id)}
                                  />
                                  <button className="btn btn-outline-secondary" type="button" onClick={() => handleQtyChange(item.id, 1)}>+</button>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="form-check form-switch d-inline-block">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    checked={sel.protect && sel.qty > 0}
                                    disabled={sel.qty === 0}
                                    onChange={(e) => handleProtectToggle(item.id, e.target.checked)}
                                  />
                                </div>
                              </td>
                              <td className="text-center">
                                <select
                                  className="form-select form-select-sm"
                                  value={sel.deodorize}
                                  disabled={sel.qty === 0}
                                  onChange={(e) => handleDeodorize(item.id, e.target.value)}
                                >
                                  {deodorizeOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile layout: per-row accordions */}
                  <div className="d-md-none mt-3">
                    {cat.items.map((item) => {
                      const sel = selections[item.id] || { qty: 0, protect: false, deodorize: 'none' };
                      const displayQty = qtyInputs[item.id] ?? String(sel.qty ?? 0);
                      return (
                        <div className="accordion" key={`m-${item.id}`} id={`acc-${cat.id}-${item.id}`}>
                          <div className="accordion-item">
                            <h2 className="accordion-header" id={`m-heading-${item.id}`}>
                              <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#m-collapse-${item.id}`}
                                aria-expanded="false"
                                aria-controls={`m-collapse-${item.id}`}
                              >
                                <div className="d-flex flex-column w-100">
                                  <span>{item.label}</span>
                                  {item.unit ? <small className="text-muted">Per {item.unit}</small> : null}
                                </div>
                                <div className="ms-auto text-end">
                                  <small className="text-muted">Qty: {sel.qty}</small>
                                </div>
                              </button>
                            </h2>
                            <div
                              id={`m-collapse-${item.id}`}
                              className="accordion-collapse collapse"
                              aria-labelledby={`m-heading-${item.id}`}
                            >
                              <div className="accordion-body">
                                <div className="mb-3">
                                  <label className="form-label">Quantity</label>
                                  <div className="input-group input-group-sm">
                                    <button className="btn btn-outline-secondary" type="button" onClick={() => handleQtyChange(item.id, -1)}>-</button>
                                    <input
                                      type="number"
                                      className="form-control text-center"
                                      min="0"
                                      value={displayQty}
                                      onChange={(e) => handleQtyInput(item.id, e.target.value)}
                                      onFocus={() => handleQtyFocus(item.id)}
                                      onBlur={() => handleQtyBlur(item.id)}
                                    />
                                    <button className="btn btn-outline-secondary" type="button" onClick={() => handleQtyChange(item.id, 1)}>+</button>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      checked={sel.protect && sel.qty > 0}
                                      disabled={sel.qty === 0}
                                      onChange={(e) => handleProtectToggle(item.id, e.target.checked)}
                                    />
                                    <label className="form-check-label">Protect</label>
                                  </div>
                                </div>
                                <div className="mb-2">
                                  <label className="form-label">Deodorize</label>
                                  <select
                                    className="form-select form-select-sm"
                                    value={sel.deodorize}
                                    disabled={sel.qty === 0}
                                    onChange={(e) => handleDeodorize(item.id, e.target.value)}
                                  >
                                    {deodorizeOptions.map((opt) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-lg-4 d-none d-lg-block">
        <div className="card position-sticky" style={{ top: '1rem' }}>
          <div className="card-header">Quote Summary</div>
          <div className="card-body">
            {totals.lines.length === 0 ? (
              <p className="text-muted mb-0">Add quantities to see your estimate.</p>
            ) : (
              <ul className="list-group list-group-flush mb-3">
                {totals.lines.map((line) => (
                  <li key={line.id} className="list-group-item d-flex justify-content-between">
                    <div>
                      <div className="fw-semibold">{line.label}</div>
                      <small className="text-muted">Qty {line.qty}</small>
                    </div>
                    <div className="text-end">
                      <div>{formatCurrency(currency, line.linePrice)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="d-flex justify-content-between fw-semibold">
              <span>Subtotal</span>
              <span>{formatCurrency(currency, totals.subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between fw-semibold mt-2">
              <span>Total (min ${minTotal})</span>
              <span>{formatCurrency(currency, totals.enforcedTotal)}</span>
            </div>
            {totals.subtotal < minTotal ? (
              <small className="text-muted">Minimum applies; add {formatCurrency(currency, minTotal - totals.subtotal)} to reach ${minTotal}.</small>
            ) : null}
          </div>
        </div>
      </div>
      </div>

      {/* Mobile sticky footer summary */}
      <div className="d-lg-none">
      <div className="position-fixed bottom-0 start-0 end-0 bg-light border-top shadow-sm p-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold mb-0">Total</div>
            <small className="text-muted">
              {totals.subtotal < minTotal
                ? `Minimum ${currency}${minTotal.toFixed(2)} applies`
                : 'Estimate'}
            </small>
          </div>
          <div className="text-end">
            <div className="fs-5 fw-semibold">
              {formatCurrency(currency, totals.enforcedTotal)}
            </div>
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => setMobileSummaryOpen((v) => !v)}
            >
              {mobileSummaryOpen ? 'Hide details' : 'View details'}
            </button>
          </div>
        </div>
      </div>

        {mobileSummaryOpen && (
          <div
            className="position-fixed start-0 end-0 bg-white border-top shadow-sm"
            style={{ maxHeight: '45vh', overflowY: 'auto', bottom: '64px' }}
          >
            <div className="p-3">
              {totals.lines.length === 0 ? (
                <p className="text-muted mb-0">Add quantities to see your estimate.</p>
              ) : (
                <ul className="list-group list-group-flush mb-3">
                  {totals.lines.map((line) => (
                    <li key={line.id} className="list-group-item d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">{line.label}</div>
                        <small className="text-muted">Qty {line.qty}</small>
                      </div>
                      <div className="text-end">
                        <div>{formatCurrency(currency, line.linePrice)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="d-flex justify-content-between fw-semibold">
                <span>Subtotal</span>
                <span>{formatCurrency(currency, totals.subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between fw-semibold mt-2">
                <span>Total (min ${minTotal})</span>
                <span>{formatCurrency(currency, totals.enforcedTotal)}</span>
              </div>
              {totals.subtotal < minTotal ? (
                <small className="text-muted">Minimum applies; add {formatCurrency(currency, minTotal - totals.subtotal)} to reach ${minTotal}.</small>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default QuoteEstimator;
