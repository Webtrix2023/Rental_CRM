import React, { useState, useEffect } from 'react';
import { Button, Input } from '@components/index';
import { toast } from "react-toastify";
import { API_BASE_URL } from "@config";
import Cookies from 'js-cookie';
import { fetchJson } from "@utils/fetchJson";
import { sendAccessToken, loadFacebookSDK, clearAccessToken } from "../../API/facebookAuth";

export default function Prerequisites({ wizard, setWizard, saveStep, company_id , setConfiguration}) {
  const isCloud = wizard.method === 'cloud';
  const [loadingGlobal, setLoadingGlobal] = useState(true);
  const [loadingFB, setLoadingFB] = useState(false);
  const [loadingWABA, setLoadingWABA] = useState(false);
  const [wiz_update, setWizupdate] = useState(0);

  /* Load FB SDK when cloud method */
  useEffect(() => {
    if (isCloud) {
      loadFacebookSDK().then(() => setLoadingGlobal(false));
    } else {
      setLoadingGlobal(false);
    }
  }, [isCloud]);

  /* Always save wizard state when updated */
  useEffect(() => {
    saveStep(wizard);
  }, [wizard, wiz_update]);

  

  /* Facebook login */
  const handleFacebookLogin = () => {
    if (!company_id) {
      toast.error("Company ID is missing!");
      return;
    }
    setLoadingFB(true);
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const { accessToken } = response.authResponse;
          sendAccessToken(accessToken, company_id,setConfiguration).then(success => {
            if (success) {
              setWizard(prev => ({
                ...prev,
                prerequisites: {
                  ...prev.prerequisites,
                  facebook_sign_up: true,
                  facebook_business_exist: true, // ideally: check via API
                },
                cloud: {
                  ...prev.cloud,
                  tokenValid: true,
                }
              }));
            }
            setLoadingFB(false);
            setWizupdate(prev => prev + 1);
          });
        } else {
          toast.error(`Facebook login failed or permissions not granted.`);
          setLoadingFB(false);
        }
      },
      { scope: "whatsapp_business_management,business_management" }
    );
  };

  /* Detect WABA */
  const detectWABA = async () => {
    if (!wizard.prerequisites.facebook_sign_up) {
      toast.error(`Facebook Sign up is not Completed`);
      return;
    }
    setLoadingWABA(true);
    try {
      const res = await fetchJson(`${API_BASE_URL}/detectWABA`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id }),
      });
      const waba = res.data?.hasWABA ?? false;
      setWizard(prev => ({
        ...prev,
        prerequisites: {
          ...prev.prerequisites,
          waba_exist: waba,
          create_waba: !waba
        }
      }));
      if (res?.flag == "S"){
        setConfiguration(c => ({
          ...c,
          config_json : res.data.config_json ? res.data.config_json : {}
        }));
      }
    if (res?.flag !== "S") toast.error(res.msg);
      setWizupdate(prev => prev + 1);
    } catch (e) {
      toast.error("Network error while detecting WABA.");
    }
    setLoadingWABA(false);
  };

  /* UI rendering */
  if (!isCloud) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm text-slate-600">Connect via your BSP provider. Make sure you have:</div>
        <div className="mt-3 space-y-2">
          <MiniCheckRow wizard={wizard} checkKey={'bsp_account'} label="BSP account active" setWizard={setWizard} />
          <MiniCheckRow wizard={wizard} checkKey={'key_and_token'} label="API key and token ready" setWizard={setWizard} />
          <MiniCheckRow wizard={wizard} checkKey={'available_whatsapp_number'} label="At least one WhatsApp number available" setWizard={setWizard} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Attention banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 my-4">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200">!</span>
        <div>
          <div className="text-sm font-medium text-amber-800">Some items need your attention</div>
          <div className="text-xs text-amber-700">Complete the mandatory requirements to continue</div>
        </div>
        <div className="ml-auto">
          <Button
            className="rounded-lg border border-amber-300 bg-white px-3 py-1 text-xs text-amber-800 hover:bg-amber-50"
            variant="secondary"
            onClick={() => {
              setWizard(prev => ({
                ...prev,
                prerequisites: {
                  ...prev.prerequisites,
                  facebook_sign_up: false,
                  facebook_business_exist: false,
                  waba_exist: false,
                  create_waba: false,
                  unregistered_phone_number: false
                },
                cloud: {
                  ...prev.cloud,
                  tokenValid: false
                }
              }));
              setWizupdate(prev => prev + 1);
              clearAccessToken();
            }}
          >
            Re-check all
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">Cloud API</span>
            <span className="text-xs text-slate-500">Let’s verify you have everything needed</span>
          </div>

          {/* Requirements Checklist */}
          <div className="space-y-6">
            {/* Facebook Business Manager */}
            <ReqCard
              icon={<FbIcon />}
              title="Facebook Business Manager account"
              subtitle={wizard.prerequisites.facebook_business_exist
                ? 'Facebook Business Manager Account exists'
                : "Sign in to your Facebook Business Manager to proceed"}
              status={wizard.prerequisites.facebook_business_exist ? 'ready' : 'action'}
              right={
                <div className="flex items-center gap-2">
                  {!wizard.prerequisites.facebook_sign_up && (
                    <Button
                      className="relative rounded-lg bg-[#2E6FE7] px-3 py-1.5 text-white hover:bg-[#2a63cc]"
                      onClick={handleFacebookLogin}
                    >
                      <span className='mr-6'>Sign in with Facebook</span>
                      {loadingFB && (
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin mr-3"></span>
                      )}
                    </Button>
                  )}
                  {wizard.prerequisites.facebook_sign_up && (
                    <span className="shrink-0 bg-blue-100 border border-blue-400 text-blue-600 rounded-md px-2.5 py-1 text-xs">Signed Up</span>
                  )}
                </div>
              }
            />

            {/* WhatsApp Business Account */}
            <ReqCard
              icon={<WaIcon />}
              title="WhatsApp Business Account (WABA)"
              subtitle={wizard.prerequisites.waba_exist
                ? 'WhatsApp Business Account exists'
                : "Use an existing WABA or create one in Business Manager"}
              status={wizard.prerequisites.waba_exist ? 'ready' : 'action'}
              right={
                <div className="flex items-center gap-2">
                  <Button
                    className="relative rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-sky-700 hover:bg-sky-100"
                    variant="secondary"
                    onClick={detectWABA}
                  >
                    {loadingWABA && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-t-blue-500 border-gray-300 rounded-full animate-spin"></span>
                    )}
                    Detect WABA
                  </Button>
                  {!wizard.prerequisites.waba_exist && !loadingWABA && (
                    <Button className="cursor-not-allowed rounded-lg bg-slate-100 px-3 py-1.5 text-slate-400">Create WABA</Button>
                  )}
                </div>
              }
            />

            {/* Phone number */}
            <ReqCard
              icon={<PhoneIcon />}
              title="Phone number not registered on WhatsApp"
              subtitle={
                <>
                  Use a number not active in the WhatsApp app
                  <div className="text-xs text-slate-500">This will be re-checked in Step 4 when selecting your number</div>
                </>
              }
              status={wizard.prerequisites.unregistered_phone_number ? 'ready' : 'action'}
              right={
                <div className="flex items-center gap-2">
                  <Button
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
                    onClick={() => {
                      setWizard(prev => ({
                        ...prev,
                        prerequisites: {
                          ...prev.prerequisites,
                          unregistered_phone_number: true,
                        }
                      }));
                      setWizupdate(prev => prev + 1);
                    }}
                  >
                    Mark as ready
                  </Button>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */
function ReqCard({ icon, title, subtitle, status, right }) {
  const s =
    status === 'ready'
      ? { label: 'Ready', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' }
      : status === 'pending'
        ? { label: 'Pending', cls: 'border-slate-200 bg-slate-50 text-slate-600' }
        : { label: 'Action needed', cls: 'border-amber-200 bg-amber-50 text-amber-800' };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <IconBox>{icon}</IconBox>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">{title}</div>
              <div className="mt-1 text-xs text-slate-600">{subtitle}</div>
            </div>
            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${s.cls}`}>{s.label}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">{right}</div>
        </div>
      </div>
    </div>
  );
}

function IconBox({ children }) {
  return (
    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-slate-500">
      {children}
    </div>
  );
}

// Placeholder icons
function FbIcon() { return <span className="text-[18px]">𝔉</span>; }
function WaIcon() { return <span className="text-[18px]">🟢</span>; }
function PhoneIcon() { return <span className="text-[18px]">📞</span>; }
function MiniCheckRow({ label ,checkKey, setWizard ,wizard}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-sm text-slate-700">{label}</div>
      { wizard.prerequisites[checkKey] && 
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">ready</span>
      }
      { !wizard.prerequisites[checkKey] && 
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
          onClick={(e) =>      
              setWizard(prev => ({
                ...prev,
                prerequisites: {
                  ...prev.prerequisites,
                  [checkKey] : true,
                }
              }))
            }
        >Check</span>
      }
    </div>
  );
}
