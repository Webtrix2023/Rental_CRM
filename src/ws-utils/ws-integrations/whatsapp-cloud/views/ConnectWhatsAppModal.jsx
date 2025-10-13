import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Button, Dialog } from '@components/index';
import { API_BASE_URL, APP_ID } from "@config";
import { fetchJson } from "@utils/fetchJson";
import { toast } from "react-toastify";
import Cookies from 'js-cookie';

// step components
import ChooseMethod from './wa-offical-steps/ChooseMethod';
import Authentication from './wa-offical-steps/Authentication';
import Prerequisites from './wa-offical-steps/Prerequisites';
import SelectNumber from './wa-offical-steps/SelectNumber';
import AccessToken from './wa-offical-steps/AccessToken';

export default function ConnectWhatsAppModal({ open, onClose, onDone, company_id }) {
  const [integration_type, setIntegrationType] = useState('whatsapp');
  const isFirstRender = useRef(true);
  const [wizard, setWizard] = useState({
    method: /** @type {'cloud'|'bsp'|null} */ (null),
    prerequisites: {
      bsp_account: false,
      key_and_token: false,
      available_whatsapp_number: false,
      facebook_sign_up: false,
      facebook_business_exist: false,
      waba_exist: false,
      create_waba: false,
      unregistered_phone_number: false,
    },
    cloud: { tokenValid: false },  // cloud-only
    bsp: { validated: false, provider: 'twilio' },             // bsp-only
    numberId: ''                                       // common
  });
  const [configuration, setConfiguration] = useState({
    'provider': null,
    'config_json': {},
    'is_default': 'N',
    'status': 'inactive',
  });
  console.log(configuration);
  
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState(1);
  const stepArray = [
    { id: 1, label: 'Choose Method', component: ChooseMethod, isVisible: () => true, isValid: (w) => w.method === 'cloud' || w.method === 'bsp' },
    { id: 2, label: 'Prerequisites', component: Prerequisites, isVisible: () => true, isValid: (w) => w.method == 'cloud' ? (w.prerequisites.facebook_sign_up && w.prerequisites.facebook_business_exist && w.prerequisites.waba_exist && w.prerequisites.unregistered_phone_number) : (w.prerequisites.bsp_account && w.prerequisites.key_and_token && w.prerequisites.available_whatsapp_number) },
    { id: 3, label: 'Authentication', component: Authentication, isVisible: () => true, isValid: (w) => (w.method === 'cloud' ? w.cloud.tokenValid : !!w.bsp.validated) },
    { id: 4, label: 'Select Number', component: SelectNumber, isVisible: () => true, isValid: (w) => !!w.numberId },
  ];
  const completed = [
    { id: 1, label: 'Choose Method', isValid: wizard.method === 'cloud' || wizard.method === 'bsp', data: wizard.method === 'cloud' ? 'cloud' : 'bsp' },
    { id: 2, label: 'Prerequisites', isValid: wizard.method == 'cloud' ? (wizard.prerequisites.facebook_sign_up && wizard.prerequisites.facebook_business_exist && wizard.prerequisites.waba_exist && wizard.prerequisites.unregistered_phone_number) : (wizard.prerequisites.bsp_account && wizard.prerequisites.key_and_token && wizard.prerequisites.available_whatsapp_number), data: "NA" },
    { id: 3, label: 'Authentication', isValid: wizard.method === 'cloud' ? !!(wizard.cloud.tokenValid) : !!wizard.bsp.validated, data: "NA" },
    { id: 4, label: 'Select Number', isValid: !!wizard.numberId, data: wizard.numberId },
  ];

  // step registry (visibility + validation per step)
  const steps = useMemo(() => (stepArray), []);
  const visibleSteps = steps.filter((s) => s.isVisible(wizard));
  const currentIndex = Math.max(0, visibleSteps.findIndex((s) => s.id === currentId));
  const currentStep = visibleSteps[currentIndex] || visibleSteps[0];
  const canContinue = currentStep?.isValid?.(wizard) ?? false;

  const isLast = currentIndex === visibleSteps.length - 1;
  const Raw = currentStep?.component;
  const StepComp = Raw && (Raw.default || Raw);
  // keep currentId valid if visibility changes (e.g., choose BSP hides step 5)
  useEffect(() => {
    if (!visibleSteps.some(s => s.id === currentId)) {
      setCurrentId(visibleSteps[0]?.id ?? 1);
    }
  }, [wizard, currentId, visibleSteps]);

  useEffect(() => {
    getSteps();
    insertIntegration()
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // skip first render
      return;
    }
    saveStep();
  }, [wizard]);

  const gotoPrev = () => {
    if (currentIndex <= 0) return;
    setCurrentId(visibleSteps[currentIndex - 1].id);
  };

  const gotoNext = () => {
    if (!canContinue) return;
    saveIntegrationSettings(isLast);
    if (isLast) { onDone?.(wizard);return; }
    setCurrentId(visibleSteps[currentIndex + 1].id);
    saveStep();
  };

  const getSteps = async () => {
    setLoading(true);
    const res = await fetchJson(`${API_BASE_URL}/getSteps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: company_id,
        integration_type: integration_type,
      }),
    });
    setLoading(false);

    if (res?.flag === "S") {
      const steps_data = JSON.parse(res.data.steps || "[]");
      const wiz = JSON.parse(res.data.wizard || "{}");

      // ✅ Merge with defaults to avoid undefined keys
      const defaultWizard = {
        method: null,
        prerequisites: {
          bsp_account: false,
          key_and_token: false,
          available_whatsapp_number: false,
          facebook_sign_up: false,
          facebook_business_exist: false,
          waba_exist: false,
          create_waba: false,
          unregistered_phone_number: false,
        },
        cloud: { tokenValid: false },
        bsp: { validated: false, provider: 'twilio' },
        numberId: ''
      };

      const mergedWizard = { ...defaultWizard, ...wiz, prerequisites: { ...defaultWizard.prerequisites, ...(wiz.prerequisites || {}) } };

      setWizard(mergedWizard);

      const settings = res.data.configuration ?? {};
      for (const step of steps_data) {
        if (step.isValid) {
          setCurrentId(step.id + 1);
        }
      }
      if (settings) {
        setConfiguration({
          provider: settings.provider || null,
          config_json: settings.config_json ? JSON.parse(settings.config_json) : {},
          is_default: settings.is_default || 'N',
          status: settings.status || 'inactive',
        });
      }
    }
  };

  const saveStep = async () => {
    if (!integration_type || integration_type == '') {
      return;
    }
    setLoading(true);
    const res = await fetchJson(`${API_BASE_URL}/updateSteps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: company_id,
        integration_type: integration_type,
        status: isLast ? 'completed' : 'in_completed',
        steps: JSON.stringify(completed),
        wizard: JSON.stringify(wizard)
      }),
    });
    setLoading(false);
    if (res?.flag === "S") {
    } else {
      toast.error(`${res.msg})`);
    }
  };
  const saveIntegrationSettings = async (isLast) => {
    setLoading(true);
    console.log('configuration: ', configuration);

    const res = await fetchJson(`${API_BASE_URL}/integration/saveWAIntegrationSettings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...configuration,
        company_id: company_id,
        config_json: JSON.stringify(configuration.config_json),
        status: isLast ? 'active' : 'inactive'
      }),
    });
    setLoading(false);
    if (res?.flag === "S") {
    } else {
      toast.error(`${res.msg})`);
    }
  };
  const insertIntegration = async () => {
    setLoading(true);
    const res = await fetchJson(`${API_BASE_URL}/integration/saveIntegration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: company_id,
        type: 'whatsapp',
      }),
    });
    setLoading(false);
    if (res?.flag === "S") {
    } else {
      toast.error(`${res.msg})`);
    }
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
              <StepComp wizard={wizard} setWizard={setWizard} saveStep={saveStep} company_id={company_id} setIntegrationType={setIntegrationType} setConfiguration={setConfiguration} />
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