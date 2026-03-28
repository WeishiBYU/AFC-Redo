import React, { useMemo, useState } from 'react';
import QuoteEstimator from './components/QuoteEstimator.jsx';
import AdditionalInformation from './components/AdditionalInformation.jsx';
import QuoteSummary from './components/QuoteSummary.jsx';
import Scheduling from './components/Scheduling.jsx';
import YourInformation from './components/YourInformation.jsx';
import ReviewConfirm from './components/ReviewConfirm.jsx';
import pricingConfig from './config/pricing.json';

function App() {
  const [step, setStep] = useState(1);
  const [totals, setTotals] = useState({ lines: [], subtotal: 0, enforcedTotal: pricingConfig.minTotal });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [yourInfoValid, setYourInfoValid] = useState(false);
  const [quoteSelections, setQuoteSelections] = useState({});
  const [additionalInfo, setAdditionalInfo] = useState(null);
  const [yourInfoValues, setYourInfoValues] = useState(null);
  const [quoteValid, setQuoteValid] = useState(false);
  const [additionalValid, setAdditionalValid] = useState(false);
  const [schedulingValid, setSchedulingValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [quoteDisclaimers, setQuoteDisclaimers] = useState([]);
  const [additionalDisclaimers, setAdditionalDisclaimers] = useState([]);

  const combinedDisclaimers = useMemo(() => {
    const byId = new Map();
    [...quoteDisclaimers, ...additionalDisclaimers].forEach((d) => {
      if (d?.id) byId.set(d.id, d);
    });
    return Array.from(byId.values());
  }, [quoteDisclaimers, additionalDisclaimers]);

  const goNext = () => {
    if (step === 1 && !quoteValid) {
      setErrorMsg('Please select at least one service quantity before continuing.');
      setShowErrors(true);
      return;
    }
    if (step === 2 && !additionalValid) {
      setErrorMsg('Please answer all required questions before continuing.');
      setShowErrors(true);
      return;
    }
    if (step === 3 && !schedulingValid) {
      setErrorMsg('Please select a time slot or request a callback before continuing.');
      setShowErrors(true);
      return;
    }
    if (step === 4 && !yourInfoValid) {
      setErrorMsg('Please complete your contact and address details before continuing.');
      setShowErrors(true);
      return;
    }
    setErrorMsg('');
    setShowErrors(false);
    setStep((s) => Math.min(5, s + 1));
  };
  const goBack = () => {
    setErrorMsg('');
    setShowErrors(false);
    setStep((s) => Math.max(1, s - 1));
  };

  return (
    <div className="container py-4 pb-5" style={{ paddingBottom: '6rem' }}>
      {step === 1 && (
        <>
          <h1 className="mb-3">Quote Estimator (Scaffold)</h1>
          <QuoteEstimator
            selections={quoteSelections}
            onSelectionsChange={setQuoteSelections}
            onTotalsChange={setTotals}
            onValidityChange={setQuoteValid}
            onDisclaimersChange={setQuoteDisclaimers}
            showErrors={showErrors}
          />
          {errorMsg ? (
            <div className="alert alert-warning mt-4 mb-3" role="alert">
              {errorMsg}
            </div>
          ) : null}
          <div className="mt-4 d-flex flex-column flex-md-row justify-content-end gap-3 mb-5">
            <button className="btn btn-primary w-100 w-md-auto" type="button" onClick={goNext}>
              Next: Additional Information
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="mb-3">Additional Information (Scaffold)</h2>
          <div className="row g-4 pb-5 pb-lg-0">
            <div className="col-lg-8">
              <AdditionalInformation
                context={{ hasCarpetCleaning: true }}
                value={additionalInfo}
                onChange={setAdditionalInfo}
                onValidityChange={setAdditionalValid}
                onDisclaimersChange={setAdditionalDisclaimers}
                showErrors={showErrors}
              />
            </div>
            <div className="col-lg-4">
              <QuoteSummary currency={pricingConfig.currency} minTotal={pricingConfig.minTotal} totals={totals} disclaimers={combinedDisclaimers} />
            </div>
          </div>
          {errorMsg ? (
            <div className="alert alert-warning mt-4 mb-3" role="alert">
              {errorMsg}
            </div>
          ) : null}
          <div className="mt-4 d-flex justify-content-between mb-5">
            <button className="btn btn-outline-secondary" type="button" onClick={goBack}>
              Back
            </button>
            <button className="btn btn-primary" type="button" onClick={goNext}>
              Next: Scheduling
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="mb-3">Scheduling (Scaffold)</h2>
          <div className="row g-4 pb-5 pb-lg-0">
            <div className="col-lg-8">
              <Scheduling
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                onValidityChange={setSchedulingValid}
                showErrors={showErrors}
              />
            </div>
            <div className="col-lg-4">
              <QuoteSummary currency={pricingConfig.currency} minTotal={pricingConfig.minTotal} totals={totals} disclaimers={combinedDisclaimers} />
            </div>
          </div>
          {errorMsg ? (
            <div className="alert alert-warning mt-4 mb-3" role="alert">
              {errorMsg}
            </div>
          ) : null}
          <div className="mt-4 d-flex justify-content-between mb-5">
            <button className="btn btn-outline-secondary" type="button" onClick={goBack}>
              Back
            </button>
            <button className="btn btn-primary" type="button" onClick={goNext}>
              Continue
            </button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h2 className="mb-3">Your Information (Scaffold)</h2>
          <div className="row g-4 pb-5 pb-lg-0">
            <div className="col-lg-8">
              <YourInformation
                value={yourInfoValues}
                onChange={setYourInfoValues}
                onValidityChange={setYourInfoValid}
                showErrors={showErrors}
              />
            </div>
            <div className="col-lg-4">
              <QuoteSummary currency={pricingConfig.currency} minTotal={pricingConfig.minTotal} totals={totals} disclaimers={combinedDisclaimers} />
            </div>
          </div>
          {errorMsg ? (
            <div className="alert alert-warning mt-4 mb-3" role="alert">
              {errorMsg}
            </div>
          ) : null}
          <div className="mt-4 d-flex justify-content-between mb-5">
            <button className="btn btn-outline-secondary" type="button" onClick={goBack}>
              Back
            </button>
            <button className="btn btn-primary" type="button" onClick={goNext}>
              Continue
            </button>
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <h2 className="mb-3">Review & Confirm (Scaffold)</h2>
          <div className="row g-4 pb-5 pb-lg-0">
            <div className="col-lg-8">
              <ReviewConfirm
                totals={totals}
                additionalInfo={additionalInfo}
                scheduling={selectedSlot}
                yourInfo={yourInfoValues}
                quoteSelections={quoteSelections}
              />
            </div>
            <div className="col-lg-4">
              <QuoteSummary currency={pricingConfig.currency} minTotal={pricingConfig.minTotal} totals={totals} disclaimers={combinedDisclaimers} />
            </div>
          </div>
          {errorMsg ? (
            <div className="alert alert-warning mt-4 mb-3" role="alert">
              {errorMsg}
            </div>
          ) : null}
          <div className="mt-4 d-flex justify-content-between mb-5">
            <button className="btn btn-outline-secondary" type="button" onClick={goBack}>
              Back
            </button>
            <button className="btn btn-success" type="button">
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
