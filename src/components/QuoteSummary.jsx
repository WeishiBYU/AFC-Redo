import React, { useState } from 'react';

function formatCurrency(symbol, amount) {
  return `${symbol}${amount.toFixed(2)}`;
}

function QuoteSummary({ currency, minTotal, totals, disclaimers = [] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const lines = totals?.lines || [];
  const subtotal = totals?.subtotal ?? 0;
  const enforcedTotal = totals?.enforcedTotal ?? Math.max(subtotal, minTotal);
  const minApplied = subtotal < minTotal;
  const totalLabel = minApplied
    ? `Total (minimum ${formatCurrency(currency, minTotal)} applied)`
    : 'Total';

  return (
    <>
      {/* Desktop card */}
      <div className="d-none d-lg-block">
        <div className="card position-sticky" style={{ top: '1rem' }}>
          <div className="card-header">Quote Summary</div>
          <div className="card-body">
            {lines.length === 0 ? (
              <p className="text-muted mb-0">Add quantities to see your estimate.</p>
            ) : (
              <ul className="list-group list-group-flush mb-3">
                {lines.map((line) => (
                  <li key={line.id} className="list-group-item d-flex justify-content-between">
                    <div>
                      <div className="fw-semibold">{line.label}</div>
                      <small className="text-muted">Qty {line.qtyLabel || line.qty}</small>
                    </div>
                    <div className="text-end">
                      <div>{formatCurrency(currency, line.linePrice)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="d-flex justify-content-between fw-semibold">
              <span>{totalLabel}</span>
              <span>{formatCurrency(currency, enforcedTotal)}</span>
            </div>
            {minApplied ? (
              <small className="text-muted">Add {formatCurrency(currency, minTotal - subtotal)} to reach the minimum.</small>
            ) : null}
            {disclaimers.length > 0 ? (
              <div className="mt-3">
                <div className="fw-semibold mb-2">Disclaimers</div>
                <div className="d-flex flex-column gap-2">
                  {disclaimers.map((d) => (
                    <div key={d.id} className="alert alert-warning p-2 small mb-0">
                      <strong>{d.label}:</strong> {d.message}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className="d-lg-none">
        <div
          className="position-fixed bottom-0 start-0 end-0 bg-light border-top shadow-sm p-3"
          style={{ zIndex: 1050 }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
                  <div className="fw-semibold mb-0">{totalLabel}</div>
                  <small className="text-muted">
                    {minApplied ? `Minimum applies` : 'Estimate'}
                  </small>
            </div>
            <div className="text-end">
              <div className="fs-5 fw-semibold">
                {formatCurrency(currency, enforcedTotal)}
              </div>
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? 'Hide details' : 'View details'}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="position-fixed start-0 end-0 bg-white border-top shadow-sm"
            style={{ maxHeight: '60vh', overflowY: 'auto', bottom: '80px', zIndex: 1049 }}
          >
            <div className="p-3 pb-5">
              {lines.length === 0 ? (
                <p className="text-muted mb-0">Add quantities to see your estimate.</p>
              ) : (
                <ul className="list-group list-group-flush mb-3">
                  {lines.map((line) => (
                    <li key={line.id} className="list-group-item d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">{line.label}</div>
                        <small className="text-muted">Qty {line.qtyLabel || line.qty}</small>
                      </div>
                      <div className="text-end">
                        <div>{formatCurrency(currency, line.linePrice)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="d-flex justify-content-between fw-semibold">
                <span>{totalLabel}</span>
                <span>{formatCurrency(currency, enforcedTotal)}</span>
              </div>
              {minApplied ? (
                <small className="text-muted">Add {formatCurrency(currency, minTotal - subtotal)} to reach the minimum.</small>
              ) : null}
              {disclaimers.length > 0 ? (
                <div className="mt-3">
                  <div className="fw-semibold mb-2">Disclaimers</div>
                  <div className="d-flex flex-column gap-2">
                    {disclaimers.map((d) => (
                      <div key={d.id} className="alert alert-warning p-2 small mb-0">
                        <strong>{d.label}:</strong> {d.message}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default QuoteSummary;
