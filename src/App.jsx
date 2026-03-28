import React, { useMemo, useState } from 'react';
import QuoteEstimator from './components/QuoteEstimator.jsx';
import AdditionalInformation from './components/AdditionalInformation.jsx';
import QuoteSummary from './components/QuoteSummary.jsx';
import Scheduling from './components/Scheduling.jsx';
import YourInformation from './components/YourInformation.jsx';
import ReviewConfirm from './components/ReviewConfirm.jsx';
import pricingConfig from './config/pricing.json';
import pageContent from './config/pageContent.json';

function App() {
  const [step, setStep] = useState(1);
  const [estimatorTotals, setEstimatorTotals] = useState({ lines: [], subtotal: 0, enforcedTotal: pricingConfig.minTotal });
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

  const carpetCounts = useMemo(() => {
    const counts = { rooms: 0, halls: 0, stairs: 0 };
    const carpetCat = pricingConfig.categories.find((c) => c.id === 'carpet');
    (carpetCat?.items || []).forEach((item) => {
      const sel = quoteSelections?.[item.id];
      const qty = sel?.qty || 0;
      if (item.id === 'room' || item.id === 'large-room') counts.rooms += qty;
      if (item.id === 'hallway') counts.halls += qty;
      if (item.id === 'stairway') counts.stairs += qty;
    });
    return counts;
  }, [quoteSelections]);

  const finalTotals = useMemo(() => {
    const base = estimatorTotals || { lines: [], subtotal: 0, enforcedTotal: pricingConfig.minTotal };
    const addOns = pricingConfig.addOns || {};
    const addonLines = [];
    let addonTotal = 0;

    // Pre-vacuuming: only if selected "Yes"
    const preVacSelection = additionalInfo?.preVacuum;
    if (preVacSelection && preVacSelection.toLowerCase().startsWith('yes')) {
      const pv = addOns.preVac || {};
      const linePrice = (carpetCounts.rooms * (pv.room || 0)) + (carpetCounts.stairs * (pv.stairway || 0)) + (carpetCounts.halls * (pv.hallway || 0));
      const totalAreas = carpetCounts.rooms + carpetCounts.stairs + carpetCounts.halls;
      if (linePrice > 0) {
        addonTotal += linePrice;
        addonLines.push({
          id: 'addon-prevac',
          label: 'Pre-vacuuming',
          qty: Math.max(totalAreas, 1),
          qtyLabel: preVacSelection,
          unitPrice: linePrice / Math.max(totalAreas, 1),
          linePrice,
          isAddon: true,
        });
      }
    }

    // Urine treatment: priced per room
    const urineValue = additionalInfo?.petUrine || '';
    const urineMap = new Map([
      ['1 spot', 1],
      ['1 room', 1],
      ['2 rooms', 2],
      ['3 rooms', 3],
      ['4 or more rooms', 4],
    ]);
    const urineRooms = urineMap.get(urineValue) || 0;
    if (urineRooms > 0 && addOns.urinePerRoom) {
      const unit = addOns.urinePerRoom;
      const linePrice = urineRooms * unit;
      addonTotal += linePrice;
      addonLines.push({
        id: 'addon-urine',
        label: 'Urine treatment',
        qty: urineRooms,
        qtyLabel: urineValue,
        unitPrice: unit,
        linePrice,
        isAddon: true,
      });
    }

    // Dark stain tiers
    const darkValue = additionalInfo?.stainTreatmentDark || '';
    const darkTierPrice = (() => {
      if (darkValue.startsWith('1-4')) return (addOns.darkStainTiers?.[0]?.price) || 0;
      if (darkValue.startsWith('5-9')) return (addOns.darkStainTiers?.[1]?.price) || 0;
      if (darkValue.startsWith('10+')) return (addOns.darkStainTiers?.[2]?.price) || 0;
      return 0;
    })();
    if (darkTierPrice > 0) {
      addonTotal += darkTierPrice;
      addonLines.push({
        id: 'addon-dark-stain',
        label: 'Dark stain treatment',
        qty: 1,
        qtyLabel: darkValue,
        unitPrice: darkTierPrice,
        linePrice: darkTierPrice,
        isAddon: true,
      });
    }

    // Colorful stain tiers
    const colorfulValue = additionalInfo?.stainTreatmentColorful || '';
    const colorfulTier = (() => {
      if (colorfulValue.startsWith('1-3')) return addOns.colorfulStainTiers?.[0] || null;
      if (colorfulValue.startsWith('4-6')) return addOns.colorfulStainTiers?.[1] || null;
      if (colorfulValue.startsWith('7+')) return addOns.colorfulStainTiers?.[2] || null;
      return null;
    })();
    if (colorfulTier && (colorfulTier.price || 0) > 0) {
      addonTotal += colorfulTier.price;
      addonLines.push({
        id: 'addon-colorful-stain',
        label: 'Colorful stain treatment',
        qty: 1,
        qtyLabel: colorfulValue,
        unitPrice: colorfulTier.price,
        linePrice: colorfulTier.price,
        isAddon: true,
      });
    }

    const subtotal = (base.subtotal || 0) + addonTotal;
    const lines = [...(base.lines || []), ...addonLines];
    const enforcedTotal = Math.max(subtotal, pricingConfig.minTotal);

    return { ...base, subtotal, enforcedTotal, lines };
  }, [additionalInfo, carpetCounts, estimatorTotals, pricingConfig.minTotal]);

  const copyFor = (key, fallbackTitle) => {
    const section = pageContent?.[key] || {};
    return {
      title: section.title || fallbackTitle,
      description: section.description || '',
    };
  };

  const renderDescription = (text) => {
    if (!text) return null;
    return text
      .split(/\n{2,}/)
      .filter(Boolean)
      .map((para, idx) => (
        <p key={idx} className="text-muted mb-3">
          {para}
        </p>
      ));
  };

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
          {(() => {
            const { title, description } = copyFor('quoteEstimator', 'Quote Estimator');
            return (
              <>
                <h1 className="mb-2">{title}</h1>
                {renderDescription(description)}
              </>
            );
          })()}
          <QuoteEstimator
            selections={quoteSelections}
            onSelectionsChange={setQuoteSelections}
            onTotalsChange={setEstimatorTotals}
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
          {(() => {
            const { title, description } = copyFor('additionalInformation', 'Additional Information');
            return (
              <>
                <h2 className="mb-2">{title}</h2>
                {renderDescription(description)}
              </>
            );
          })()}
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
              <QuoteSummary currency={pricingConfig.currency} minTotal={pricingConfig.minTotal} totals={finalTotals} disclaimers={combinedDisclaimers} />
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
          {(() => {
            const { title, description } = copyFor('scheduling', 'Scheduling');
            return (
              <>
                <h2 className="mb-2">{title}</h2>
                {renderDescription(description)}
              </>
            );
          })()}
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
              <QuoteSummary currency={pricingConfig.currency} minTotal={pricingConfig.minTotal} totals={finalTotals} disclaimers={combinedDisclaimers} />
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
          {(() => {
            const { title, description } = copyFor('yourInformation', 'Your Information');
            return (
              <>
                <h2 className="mb-2">{title}</h2>
                {renderDescription(description)}
              </>
            );
          })()}
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
              <QuoteSummary currency={pricingConfig.currency} minTotal={pricingConfig.minTotal} totals={finalTotals} disclaimers={combinedDisclaimers} />
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
          {(() => {
            const { title, description } = copyFor('reviewConfirm', 'Review & Confirm');
            return (
              <>
                <h2 className="mb-2">{title}</h2>
                {description ? <p className="text-muted mb-3">{description}</p> : null}
              </>
            );
          })()}
          <div className="row g-4 pb-5 pb-lg-0">
            <div className="col-lg-8">
              <ReviewConfirm
                totals={finalTotals}
                additionalInfo={additionalInfo}
                scheduling={selectedSlot}
                yourInfo={yourInfoValues}
                quoteSelections={quoteSelections}
                disclaimers={combinedDisclaimers}
              />
            </div>
            <div className="col-lg-4">
              <QuoteSummary currency={pricingConfig.currency} minTotal={pricingConfig.minTotal} totals={finalTotals} disclaimers={combinedDisclaimers} />
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
