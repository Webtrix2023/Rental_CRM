import React, { useEffect, useMemo, useState } from 'react';
import { Button, Dialog } from '@components/index';

// step components
import Step1ChooseMethod from './wa-offical-steps/Step1ChooseMethod';
import Step2Prerequisites from './wa-offical-steps/Step2Prerequisites';
import Step3Authentication from './wa-offical-steps/Step3Authentication';
import Step4SelectNumber from './wa-offical-steps/Step4SelectNumber';
import Step5AccessToken from './wa-offical-steps/Step5AccessToken';
import Step6Webhook from './wa-offical-steps/Step6Webhook';
import Step7Templates from './wa-offical-steps/Step7Templates';
import Step8TestFinish from './wa-offical-steps/Step8TestFinish';

export default function ConnectWhatsAppModal({ open, onClose, onDone }) {
  // central wizard state shared across steps
  const [wizard, setWizard] = useState({
    method: /** @type {'cloud'|'bsp'|null} */ (null),
    cloud: { bmId: '', wabaId: '', tokenValid: false },  // cloud-only
    bsp: { validated: false, provider: '' },             // bsp-only
    numberId: '',                                        // common
    webhookVerified: false,                              // common
  });

  const [currentId, setCurrentId] = useState(1);

  // step registry (visibility + validation per step)
  const steps = useMemo(() => ([
    { id: 1, label: 'Choose Method', component: Step1ChooseMethod, isVisible: () => true, isValid: (w) => w.method === 'cloud' || w.method === 'bsp' },
    { id: 2, label: 'Prerequisites', component: Step2Prerequisites, isVisible: () => true, isValid: () => true },
    { id: 3, label: 'Authentication', component: Step3Authentication, isVisible: () => true, isValid: (w) => (w.method === 'cloud' ? !!(w.cloud.bmId && w.cloud.wabaId) : !!w.bsp.validated) },
    { id: 4, label: 'Select Number', component: Step4SelectNumber, isVisible: () => true, isValid: (w) => !!w.numberId },
    { id: 5, label: 'Access Token', component: Step5AccessToken, isVisible: (w) => w.method === 'cloud', isValid: (w) => (w.method === 'cloud' ? !!w.cloud.tokenValid : true) },
    { id: 6, label: 'Webhook Setup', component: Step6Webhook, isVisible: () => true, isValid: (w) => !!w.webhookVerified },
    { id: 7, label: 'Templates', component: Step7Templates, isVisible: () => true, isValid: () => true },
    { id: 8, label: 'Test & Finish', component: Step8TestFinish, isVisible: () => true, isValid: () => true },
  ]), []);

  const visibleSteps = steps.filter((s) => s.isVisible(wizard));
  const currentIndex = Math.max(0, visibleSteps.findIndex((s) => s.id === currentId));
  const currentStep = visibleSteps[currentIndex] || visibleSteps[0];

  const canContinue = currentStep?.isValid?.(wizard) ?? false;
  const isLast = currentIndex === visibleSteps.length - 1;
  const Raw = currentStep?.component;
  const StepComp = Raw && (Raw.default || Raw);
  console.log("StepComp", Raw);
  // keep currentId valid if visibility changes (e.g., choose BSP hides step 5)
  useEffect(() => {
    if (!visibleSteps.some(s => s.id === currentId)) {
      setCurrentId(visibleSteps[0]?.id ?? 1);
    }
  }, [wizard, currentId, visibleSteps]);

  const gotoPrev = () => {
    if (currentIndex <= 0) return;
    setCurrentId(visibleSteps[currentIndex - 1].id);
  };

  const gotoNext = () => {
    if (!canContinue) return;
    if (isLast) { onDone?.(wizard); return; }
    setCurrentId(visibleSteps[currentIndex + 1].id);
  };

  const StepView = currentStep.component;

  // -------- RETURN WITH DIALOG (popup) --------
  return (
    <Dialog
      isOpen={open}
      onClose={onClose}
      // if you upgraded Dialog with these props, great; if not, they’ll be ignored
      variant="custom"
      size="full"
      bodyClassName="p-0"
    >
      <div className="flex h-[95vh] overflow-hidden rounded-2xl">
        {/* Left stepper */}
        <aside className="hidden w-64 shrink-0 flex-col justify-between bg-[#0B2C59] p-4 text-white md:flex">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#E8FCEF] text-[#25D366] font-semibold">WA</div>
              <div>
                <div className="text-sm/5 opacity-80">Connect WhatsApp</div>
                <div className="text-[13px] opacity-60">Setup your number</div>
              </div>
            </div>

            {visibleSteps.map((s, idx) => (
              <StepperItem
                key={s.id}
                n={idx + 1}
                label={s.label}
                active={currentId === s.id}
                onClick={() => setCurrentId(s.id)}
              />
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-[#0A2547] p-4">
            <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10">?</span>
              Need help?
            </div>
            <div className="text-xs opacity-80">Check our setup guide or contact support</div>
          </div>
        </aside>

        {/* Right content */}
        <main className="flex min-w-0 flex-1 flex-col bg-white">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-[#0B3B69]">{currentStep.label}</h2>
            <p className="mt-1 text-sm text-slate-600">Step {currentIndex + 1} of {visibleSteps.length}</p>
          </div>

          {/* Body (scrollable) */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {typeof StepComp === 'function' ? (
              <StepComp wizard={wizard} setWizard={setWizard} />
            ) : (
              <div className="text-sm text-red-600">
                Step component failed to load. Ensure it has a default export.
              </div>
            )}
          </div>

          {/* Footer (Back / Continue) */}
          <div className="sticky bottom-0 z-10 border-t bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <WizardBack onClick={gotoPrev} disabled={currentIndex === 0} />
              <WizardNext onClick={gotoNext} disabled={!canContinue} finish={isLast} />
            </div>
          </div>
        </main>
      </div>
    </Dialog>
  );
}

/* ====== local UI bits ====== */

function StepperItem({ n, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-2 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm ${active ? 'bg-white/5' : 'opacity-80'
        }`}
    >
      <span
        className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${active ? 'bg-white text-[#0B2C59]' : 'bg-white/20'
          }`}
      >
        {n}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function WizardBack({ onClick, disabled }) {
  return (
    <Button variant="secondary" onClick={onClick} disabled={disabled}>
      ← Back
    </Button>
  );
}

function WizardNext({ onClick, disabled, finish }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="h-11 rounded-lg bg-[#FF5C0A] text-white hover:bg-[#e65309] disabled:opacity-60"
    >
      {finish ? 'Finish setup' : 'Continue'}
    </Button>
  );
}