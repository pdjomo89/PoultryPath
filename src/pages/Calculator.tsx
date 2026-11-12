import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Info, RotateCcw } from 'lucide-react';
import {
  BROILER_DEFAULTS,
  LAYER_DEFAULTS,
  calcBroilers,
  calcLayers,
  type BroilerInputs,
  type LayerInputs,
} from '../lib/profit';
import { CURRENCIES, money, num, pct, type CurrencyCode } from '../lib/format';
import { usePersistentState } from '../lib/storage';
import { useI18n } from '../i18n';
import PageHero from '../components/PageHero';

type Model = 'broilers' | 'layers';

interface FieldDef<K extends string> {
  key: K;
  step?: number;
  money?: boolean;
}

// Labels and hints come from the i18n messages (calculator.fields).
const BROILER_FIELDS: FieldDef<keyof BroilerInputs>[] = [
  { key: 'birds' },
  { key: 'chickCost', step: 0.01, money: true },
  { key: 'feedPerBirdKg', step: 0.1 },
  { key: 'feedPricePerKg', step: 0.01, money: true },
  { key: 'healthCostPerBird', step: 0.01, money: true },
  { key: 'otherCostsPerCycle', money: true },
  { key: 'mortalityPct', step: 0.5 },
  { key: 'liveWeightKg', step: 0.1 },
  { key: 'pricePerKg', step: 0.01, money: true },
  { key: 'cycleWeeks' },
];

const LAYER_FIELDS: FieldDef<keyof LayerInputs>[] = [
  { key: 'birds' },
  { key: 'pulletCost', step: 0.01, money: true },
  { key: 'feedPerBirdPerDayG' },
  { key: 'feedPricePerKg', step: 0.01, money: true },
  { key: 'layRatePct', step: 0.5 },
  { key: 'pricePerTray', step: 0.01, money: true },
  { key: 'healthCostPerBird', step: 0.01, money: true },
  { key: 'otherCostsPerMonth', money: true },
  { key: 'mortalityPct', step: 0.5 },
  { key: 'layingMonths' },
  { key: 'spentHenPrice', step: 0.01, money: true },
];

const toStrings = (o: object) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)])) as Record<string, string>;
const toNumbers = <T,>(o: Record<string, string>) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Number(v)])) as T;

/** "Franc CFA (BEAC) (XAF)" / "Central African CFA Franc (XAF)", in the page language. */
function currencyName(code: string, locale: string) {
  try {
    const name = new Intl.DisplayNames([locale], { type: 'currency' }).of(code);
    return name ? `${name.charAt(0).toUpperCase()}${name.slice(1)} (${code})` : code;
  } catch {
    return CURRENCIES.find((c) => c.code === code)?.label ?? code;
  }
}

export default function Calculator() {
  const { t, locale } = useI18n();
  const c = t.calculator;
  const [model, setModel] = usePersistentState<Model>('calc-model', 'broilers');
  const [currency, setCurrency] = usePersistentState<CurrencyCode>('calc-currency', 'USD');
  const [broiler, setBroiler] = usePersistentState('calc-broiler', toStrings(BROILER_DEFAULTS));
  const [layer, setLayer] = usePersistentState('calc-layer', toStrings(LAYER_DEFAULTS));

  const isBroiler = model === 'broilers';
  const values = isBroiler ? broiler : layer;
  const setValues = isBroiler ? setBroiler : setLayer;
  const fields: FieldDef<string>[] = isBroiler ? BROILER_FIELDS : LAYER_FIELDS;
  const fieldText = (isBroiler ? c.fields.broiler : c.fields.layer) as Record<string, { label: string; hint?: string }>;

  const result = useMemo(
    () => (isBroiler ? calcBroilers(toNumbers<BroilerInputs>(broiler)) : calcLayers(toNumbers<LayerInputs>(layer))),
    [isBroiler, broiler, layer],
  );

  const m = (v: number, d?: number) => money(v, currency, d, locale);
  const p = (v: number) => pct(v, locale);
  const loss = result.profit < 0;
  const maxCost = Math.max(...result.costs.map((x) => x.amount), 1);

  const reset = () => setValues(toStrings(isBroiler ? BROILER_DEFAULTS : LAYER_DEFAULTS));

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} lead={c.lead} photo="calculator">
        <p className="muted">
          {c.otherPre}
          <Link to="/contact?service=profitability">{c.otherLink}</Link>
          {c.otherPost}
        </p>
      </PageHero>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <div className="toolbar">
            <div className="segmented" role="tablist" aria-label={c.model}>
              {(['broilers', 'layers'] as Model[]).map((k) => (
                <button key={k} role="tab" aria-selected={model === k} className={model === k ? 'active' : ''} onClick={() => setModel(k)}>
                  {k === 'broilers' ? c.broilers : c.layers}
                </button>
              ))}
            </div>
            <label className="visually-hidden" htmlFor="currency">{c.currency}</label>
            <select id="currency" className="select" value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)}>
              {CURRENCIES.map((cur) => <option key={cur.code} value={cur.code}>{currencyName(cur.code, locale)}</option>)}
            </select>
            <button className="btn btn--outline btn--sm" onClick={reset}><RotateCcw size={14} /> {c.reset}</button>
          </div>

          <div className="calc">
            <div className="card">
              <h3>{isBroiler ? c.broilerInputs : c.layerInputs}</h3>
              <div className="alert alert--info" style={{ marginBottom: 20, fontSize: '0.88rem' }}>
                <Info size={18} style={{ flexShrink: 0 }} />
                <span>{c.defaultsNote}</span>
              </div>
              <div className="form-row">
                {fields.map((f) => (
                  <div className="field" key={f.key}>
                    <label htmlFor={f.key}>{fieldText[f.key].label}{f.money ? ` (${currency})` : ''}</label>
                    <input
                      id={f.key}
                      className="input"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={f.step ?? 1}
                      value={values[f.key] ?? ''}
                      onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    />
                    {fieldText[f.key].hint && <small>{fieldText[f.key].hint}</small>}
                  </div>
                ))}
              </div>
            </div>

            <div className="calc__results">
              <div className={`result-hero ${loss ? 'loss' : ''}`}>
                <span>{isBroiler ? c.profitBroiler : c.profitLayer}</span>
                <strong>{m(result.profit)}</strong>
                <span>{c.perMonth(m(result.monthlyProfit), p(result.marginPct))}</span>
              </div>
              <div className="card">
                <div className="kv"><span>{c.revenue}</span><strong>{m(result.revenue)}</strong></div>
                <div className="kv"><span>{c.totalCost}</span><strong>{m(result.totalCost)}</strong></div>
                <div className="kv"><span>{c.roi}</span><strong>{p(result.roiPct)}</strong></div>
                <div className="kv"><span>{c.output}</span><strong>{num(result.unitsSold, 0, locale)} {c.units[result.unit]}</strong></div>
                <div className="kv"><span>{isBroiler ? c.costPerBird : c.costPerTray}</span><strong>{m(result.costPerUnit, 2)}</strong></div>
                <div className="kv"><span>{c.breakEven}</span><strong>{m(result.breakEvenPrice, 2)} {c.breakEvenUnits[result.breakEvenUnit]}</strong></div>

                <h4 style={{ margin: '22px 0 12px', fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>{c.breakdown}</h4>
                {result.costs.map((cost) => (
                  <div className="bar-row" key={cost.key}>
                    <span>{c.costs[cost.key]}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${(cost.amount / maxCost) * 100}%` }} /></div>
                    <span style={{ textAlign: 'right' }}>{p(result.totalCost ? (cost.amount / result.totalCost) * 100 : 0)}</span>
                  </div>
                ))}
              </div>
              <div className="card" style={{ marginTop: 16 }}>
                <p style={{ margin: '0 0 12px' }}>{loss ? c.lossText : c.gainText}</p>
                <Link to="/contact?service=profitability" className="btn btn--primary btn--block">{c.review}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
