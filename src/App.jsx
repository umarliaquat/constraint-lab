import { useEffect, useMemo, useRef, useState } from "react";

const CONDITIONS = {
  keyboard: {
    label: "Keyboard only",
    short: "TAB",
    description: "Navigate the checkout without a pointer.",
    instruction: "Use Tab, Shift + Tab, and Enter to complete the checkout.",
    signal: "Focus order",
    issue: "The primary action enters the tab sequence before the address is complete.",
    impact: "The path no longer matches the visual reading order.",
    recommendation: "Keep DOM and focus order aligned with the visible task sequence.",
    priority: "High · task order",
  },
  vision: {
    label: "Low visual access",
    short: "160%",
    description: "Use enlarged text inside a constrained viewport.",
    instruction: "Complete the task with text enlarged and less content visible at once.",
    signal: "Text reflow",
    issue: "Fixed field dimensions cause labels and values to compete for space.",
    impact: "Critical address context becomes clipped during completion.",
    recommendation: "Allow fields to reflow vertically and preserve labels at larger text sizes.",
    priority: "Medium · readability",
  },
  network: {
    label: "Slow connection",
    short: "3.2s",
    description: "Submit payment through an unreliable connection.",
    instruction: "Complete the purchase while the simulated network is delayed.",
    signal: "System feedback",
    issue: "The payment state does not explain whether the request was received.",
    impact: "Users may retry, leave, or create a duplicate action.",
    recommendation: "Confirm receipt immediately, explain the delay, and expose a safe recovery path.",
    priority: "High · payment trust",
  },
};

const DEFAULT_FIELDS = {
  email: "alex.morgan@example.com",
  firstName: "Alex",
  lastName: "Morgan",
  address: "18 Mercer Street",
  city: "Brooklyn",
  postal: "11201",
};

function Mark({ type = "target" }) {
  if (type === "arrow") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h13M14 7l5 5-5 5" />
      </svg>
    );
  }
  if (type === "reset") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 8a8 8 0 1 0 1 6M19 4v4h-4" />
      </svg>
    );
  }
  if (type === "check") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  );
}

function ConditionPicker({ active, onChange, disabled }) {
  return (
    <fieldset className="condition-picker" disabled={disabled}>
      <legend>Choose a condition</legend>
      {Object.entries(CONDITIONS).map(([key, item]) => (
        <label className={`condition-row ${active === key ? "is-selected" : ""}`} key={key}>
          <input
            type="radio"
            name="condition"
            value={key}
            checked={active === key}
            onChange={() => onChange(key)}
          />
          <span className="condition-code">{item.short}</span>
          <span className="condition-copy">
            <strong>{item.label}</strong>
            <small>{item.description}</small>
          </span>
          <span className="radio-mark" aria-hidden="true" />
        </label>
      ))}
    </fieldset>
  );
}

function TextField({ label, name, value, onChange, onFocus, tabIndex, autoComplete }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        tabIndex={tabIndex}
        autoComplete={autoComplete}
      />
    </label>
  );
}

function CheckoutProof({
  activeCondition,
  phase,
  fields,
  setFields,
  processing,
  onSubmit,
  onFriction,
  onCancel,
  corrected,
}) {
  const keyboardTrap = activeCondition === "keyboard" && phase === "active" && !corrected;
  const modeClass = activeCondition === "vision" && phase !== "setup" ? "vision-mode" : "";

  const updateField = (event) => {
    setFields((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const focusIssue = (field) => {
    if (keyboardTrap && field === "submit") onFriction("focus-order");
    if (activeCondition === "vision" && phase === "active" && field === "address") {
      onFriction("text-reflow");
    }
  };

  return (
    <form
      className={`checkout-proof ${modeClass} ${corrected ? "is-corrected" : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="checkout-main">
        <div className="checkout-kicker">
          <span>Secure checkout</span>
          <span>Proof 021-A</span>
        </div>

        <h2>Delivery details</h2>
        <p className="checkout-intro">Confirm where your Morrow Field Kit should arrive.</p>

        <div className="form-stack">
          <TextField
            label="Email"
            name="email"
            value={fields.email}
            onChange={updateField}
            tabIndex={keyboardTrap ? 1 : undefined}
            autoComplete="email"
          />
          <div className="field-pair">
            <TextField
              label="First name"
              name="firstName"
              value={fields.firstName}
              onChange={updateField}
              tabIndex={keyboardTrap ? 2 : undefined}
              autoComplete="given-name"
            />
            <TextField
              label="Last name"
              name="lastName"
              value={fields.lastName}
              onChange={updateField}
              tabIndex={keyboardTrap ? 3 : undefined}
              autoComplete="family-name"
            />
          </div>
          <TextField
            label="Street address"
            name="address"
            value={fields.address}
            onChange={updateField}
            onFocus={() => focusIssue("address")}
            tabIndex={keyboardTrap ? 6 : undefined}
            autoComplete="street-address"
          />
          <div className="field-pair location-fields">
            <TextField
              label="City"
              name="city"
              value={fields.city}
              onChange={updateField}
              tabIndex={keyboardTrap ? 7 : undefined}
              autoComplete="address-level2"
            />
            <TextField
              label="Postal code"
              name="postal"
              value={fields.postal}
              onChange={updateField}
              tabIndex={keyboardTrap ? 8 : undefined}
              autoComplete="postal-code"
            />
          </div>
        </div>

        {corrected && activeCondition === "network" && processing && (
          <div className="resolved-status" role="status">
            <span className="status-spinner" aria-hidden="true" />
            <div>
              <strong>Payment received. Confirming securely.</strong>
              <span>This may take up to 30 seconds. You can safely stay on this page.</span>
              <button type="button" onClick={onCancel}>Cancel payment safely</button>
            </div>
          </div>
        )}

        <button
          className={`pay-button ${processing ? "is-processing" : ""}`}
          type="submit"
          onFocus={() => focusIssue("submit")}
          tabIndex={keyboardTrap ? 5 : undefined}
          aria-busy={processing}
          disabled={processing}
        >
          {processing ? (
            <>
              <span className="button-spinner" aria-hidden="true" />
              {corrected ? "Confirming payment" : "Processing"}
            </>
          ) : corrected ? (
            "Complete corrected checkout"
          ) : (
            "Pay $148.00"
          )}
        </button>
        <p className="secure-note">Encrypted payment · No real transaction</p>
      </div>

      <aside className="order-summary" aria-label="Order summary">
        <div className="product-token" aria-hidden="true">
          MF
        </div>
        <div className="product-copy">
          <strong>Morrow Field Kit</strong>
          <span>Graphite · One size</span>
        </div>
        <span className="product-price">$136.00</span>
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>$136.00</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>$0.00</dd>
          </div>
          <div>
            <dt>Tax</dt>
            <dd>$12.00</dd>
          </div>
          <div className="total-row">
            <dt>Total</dt>
            <dd>$148.00</dd>
          </div>
        </dl>
        <div className="delivery-note">
          <span>Estimated arrival</span>
          <strong>Tuesday, 12 August</strong>
        </div>
      </aside>
    </form>
  );
}

function Annotation({ condition, visible, resolved }) {
  if (!visible) return null;
  const item = CONDITIONS[condition];
  return (
    <div className={`proof-annotation ${resolved ? "is-resolved" : ""}`} role="note">
      <span className="annotation-pin">A1</span>
      <div>
        <span className="annotation-label">{resolved ? "Correction verified" : item.signal}</span>
        <strong>{resolved ? item.recommendation : item.issue}</strong>
      </div>
    </div>
  );
}

function EvidenceSequence({ phase, condition }) {
  const revealed = phase === "debrief" || phase === "replay" || phase === "complete";
  const active = phase === "active";
  return (
    <section className="evidence-sequence" aria-label="Experiment evidence">
      <article className="evidence-cell is-known">
        <div className="evidence-heading">
          <span>1</span>
          <strong>Intent</strong>
          <span className="evidence-time">Start</span>
        </div>
        <div className="evidence-preview intent-preview" aria-hidden="true"><i /><i /><i /></div>
        <p>Complete a familiar checkout with one condition changed.</p>
      </article>
      <article className={`evidence-cell ${active ? "is-live" : ""} ${revealed ? "is-known" : ""}`}>
        <div className="evidence-heading">
          <span>2</span>
          <strong>Friction</strong>
          <span className="evidence-time">{revealed ? "Captured" : "—"}</span>
        </div>
        <div className="evidence-preview friction-preview" aria-hidden="true"><i /><i /><i /></div>
        <p>{revealed ? CONDITIONS[condition].issue : active ? "Recording interaction signals…" : "Revealed during the trial."}</p>
      </article>
      <article className={`evidence-cell ${phase === "replay" || phase === "complete" ? "is-known" : ""}`}>
        <div className="evidence-heading">
          <span>3</span>
          <strong>Recovery</strong>
          <span className="evidence-time">{phase === "replay" || phase === "complete" ? "Replayed" : "—"}</span>
        </div>
        <div className="evidence-preview recovery-preview" aria-hidden="true"><i /><i /><i /></div>
        <p>{phase === "replay" || phase === "complete" ? CONDITIONS[condition].recommendation : "Unlocked after debrief."}</p>
      </article>
    </section>
  );
}

function App() {
  const [condition, setCondition] = useState("network");
  const [phase, setPhase] = useState("setup");
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [processing, setProcessing] = useState(false);
  const [friction, setFriction] = useState(false);
  const [notice, setNotice] = useState("Select a condition, then begin the trial.");
  const timerRef = useRef([]);

  const conditionData = CONDITIONS[condition];
  const corrected = phase === "replay" || phase === "complete";

  const clearTimers = () => {
    timerRef.current.forEach((timer) => window.clearTimeout(timer));
    timerRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const progress = useMemo(() => {
    if (phase === "setup") return "Ready";
    if (phase === "active") return friction ? "Friction captured" : "Trial active";
    if (phase === "debrief") return "Debrief ready";
    if (phase === "replay") return "Correction active";
    return "Verified";
  }, [phase, friction]);

  const reset = () => {
    clearTimers();
    setPhase("setup");
    setFields(DEFAULT_FIELDS);
    setProcessing(false);
    setFriction(false);
    setNotice("Select a condition, then begin the trial.");
  };

  const startTrial = () => {
    clearTimers();
    setPhase("active");
    setFriction(false);
    setNotice(conditionData.instruction);
    timerRef.current.push(
      window.setTimeout(() => {
        document.querySelector(".checkout-proof input")?.focus();
      }, 420),
    );
  };

  const captureFriction = () => {
    if (phase !== "active" || friction) return;
    setFriction(true);
    setNotice(`Evidence captured: ${conditionData.signal.toLowerCase()}.`);
  };

  const finishTrial = () => {
    if (phase === "setup") return;

    if (phase === "replay") {
      setProcessing(true);
      setNotice("The corrected interface confirms receipt and preserves a recovery path.");
      timerRef.current.push(
        window.setTimeout(() => {
          setProcessing(false);
          setPhase("complete");
          setNotice("Correction verified. The system state remained understandable.");
        }, condition === "network" ? 4500 : 700),
      );
      return;
    }

    const keyboardSignal = condition === "keyboard" && document.activeElement?.classList.contains("pay-button");
    const encounteredSignal = friction || keyboardSignal || condition === "network";

    if (!encounteredSignal) {
      setNotice(
        condition === "vision"
          ? "No evidence captured yet. Move through the address fields before submitting."
          : "No evidence captured yet. Use Tab to move through the form in sequence.",
      );
      return;
    }

    setFriction(true);

    if (condition === "network") {
      setProcessing(true);
      setNotice("Payment request sent. The interface has not confirmed receipt.");
      timerRef.current.push(window.setTimeout(() => setFriction(true), 600));
      timerRef.current.push(
        window.setTimeout(() => {
          setProcessing(false);
          setPhase("debrief");
          setNotice("Trial complete. Inspect the evidence before replaying the correction.");
        }, 3200),
      );
    } else {
      setPhase("debrief");
      setNotice("Trial complete. Inspect the evidence before replaying the correction.");
    }
  };

  const startReplay = () => {
    clearTimers();
    setPhase("replay");
    setProcessing(false);
    setNotice(`Correction active: ${conditionData.recommendation}`);
  };

  const cancelReplay = () => {
    clearTimers();
    setProcessing(false);
    setPhase("replay");
    setNotice("Payment cancelled safely. The checkout is ready to retry without a duplicate action.");
  };

  return (
    <main className={`app-shell phase-${phase}`}>
      <div className="registration-mark mark-a" aria-hidden="true"><Mark /></div>
      <div className="registration-mark mark-b" aria-hidden="true"><Mark /></div>

      <aside className="experiment-index">
        <a className="wordmark" href="#challenge-surface" aria-label="Constraint Lab home">
          Constraint<br />Lab
        </a>
        <div className="index-rule" />
        <dl className="index-meta">
          <div><dt>Experiment</dt><dd>021</dd></div>
          <div><dt>Scenario</dt><dd>Checkout</dd></div>
          <div><dt>Status</dt><dd>{progress}</dd></div>
          <div><dt>Evidence</dt><dd>Synthetic</dd></div>
        </dl>
        <div className="index-footer">
          <span>CL—021</span>
          <span>16:10</span>
        </div>
      </aside>

      <section className="workspace" id="challenge-surface">
        <header className="workspace-header">
          <div>
            <span className="proof-count"><i /> Proof 1 of 1</span>
            <h1>Checkout under pressure</h1>
          </div>
          <div className="header-actions">
            <span className="synthetic-stamp">Synthetic scenario</span>
            {phase !== "setup" && (
              <button className="reset-action" type="button" onClick={reset}>
                <Mark type="reset" /> Reset
              </button>
            )}
          </div>
        </header>

        <div className="workspace-grid">
          <section className="proof-stage" aria-label="Interactive checkout proof">
            <div className="stage-toolbar">
              <span>{corrected ? "Corrected proof" : "Live proof"}</span>
              <span className="condition-status"><i /> {conditionData.label}</span>
              <span>{phase === "active" ? "Recording" : progress}</span>
            </div>

            <div className="proof-canvas">
              <CheckoutProof
                activeCondition={condition}
                phase={phase}
                fields={fields}
                setFields={setFields}
                processing={processing}
                onSubmit={finishTrial}
                onFriction={captureFriction}
                onCancel={cancelReplay}
                corrected={corrected}
              />
              <Annotation
                condition={condition}
                visible={friction || corrected}
                resolved={corrected}
              />
              {phase === "setup" && (
                <div className="proof-veil">
                  <div className="veil-copy">
                    <span className="veil-index">021</span>
                    <h2>Can this checkout<br />survive {conditionData.label.toLowerCase()}?</h2>
                    <p>The live specimen stays visible. Begin when you are ready to test its weakest moment.</p>
                    <button type="button" onClick={startTrial}>Run this condition</button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="constraint-docket">
            <div className="docket-header">
              <span>Active condition</span>
              <span>CL-021 / A</span>
            </div>

            {phase === "setup" ? (
              <>
                <ConditionPicker active={condition} onChange={setCondition} disabled={false} />
                <div className="task-brief">
                  <span>Task brief</span>
                  <strong>Confirm delivery details and pay $148.</strong>
                  <p>{conditionData.instruction}</p>
                  <button className="task-start-action" type="button" onClick={startTrial}>
                    Run {conditionData.label.toLowerCase()} trial <Mark type="arrow" />
                  </button>
                </div>
              </>
            ) : phase === "debrief" || phase === "replay" || phase === "complete" ? (
              <div className="debrief-panel">
                <span className="debrief-label">Evidence A1</span>
                <h2>{phase === "debrief" ? conditionData.signal : "Correction applied"}</h2>
                <p className="debrief-issue">
                  {phase === "debrief" ? conditionData.issue : conditionData.recommendation}
                </p>
                <dl>
                  <div><dt>Observed impact</dt><dd>{conditionData.impact}</dd></div>
                  <div><dt>Demo priority</dt><dd>{conditionData.priority}</dd></div>
                  <div><dt>Evidence type</dt><dd>Illustrative interaction trace</dd></div>
                </dl>
                {phase === "debrief" && (
                  <button className="replay-action" type="button" onClick={startReplay}>
                    Replay corrected proof <Mark type="arrow" />
                  </button>
                )}
                {phase === "complete" && (
                  <div className="verified-block">
                    <Mark type="check" />
                    <div><strong>Correction verified</strong><span>The task remained clear under the same condition.</span></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="live-docket">
                <span className="condition-large-code">{conditionData.short}</span>
                <h2>{conditionData.label}</h2>
                <p>{conditionData.instruction}</p>
                <div className={`recording-status ${friction ? "has-evidence" : ""}`}>
                  <i />
                  <div><strong>{friction ? "Evidence captured" : "Observing interaction"}</strong><span>{friction ? conditionData.signal : "Signals appear here as you work."}</span></div>
                </div>
              </div>
            )}

            <div className="docket-note">
              <span>About this simulation</span>
              <p>This is a design condition, not a representation of any person’s lived experience.</p>
            </div>
          </aside>
        </div>

        <EvidenceSequence phase={phase} condition={condition} />

        <footer className="workspace-footer">
          <span aria-live="polite">{notice}</span>
          <span>Constraint Lab · Experimental build</span>
        </footer>
      </section>
    </main>
  );
}

export default App;
