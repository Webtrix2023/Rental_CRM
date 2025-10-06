import React, { useEffect, useState } from 'react';
import { Button, Input, Select } from '@components/index';
import { Check } from "lucide-react";
import { API_BASE_URL, APP_ID } from "@config";
import Cookies from 'js-cookie';
import { fetchJson } from "@utils/fetchJson";

function loadFacebookSDK(appId) {
  return new Promise((resolve) => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: "v17.0",
      });
      resolve();
    };

    (function (d, s, id) {
      let js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  });
}

export default function Authentication({ wizard, setWizard, company_id, setConfiguration }) {
  const [loading, setLoading] = useState(true);
  const isCloud = wizard.method === 'cloud';
  const signedIn = Boolean(wizard.cloud.tokenValid);
  const [bspCred, setBspCred] = useState({
    provider: 'twilio',
    account_sid: null,
    auth_token: null,
  });

  useEffect(() => {
    if (isCloud) {
      loadFacebookSDK(APP_ID).then(() => {
        setLoading(false);
      });
    } else {
      // For BSP, we assume it’s not loading
      setLoading(false);
    }
  }, [isCloud]);

  function Loader() {
    return (
      <div className="flex items-center justify-center">
        <div className="rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
      </div>
    );
  }


  const handleFacebookLogin = () => {
    setLoading(true);
    window.FB.login(
      (response) => {
        console.log('response : ', response);
        if (response.authResponse) {
          const { accessToken } = response.authResponse;
          sendAccessToken(accessToken, company_id);
        } else {
          alert("Facebook login failed or permissions not granted.");
          setWizard(w => ({
            ...w,
            cloud: {
              ...w.cloud,
              tokenValid: false
            }
          }));
          setLoading(false);
        }
      },
      { scope: "whatsapp_business_management,business_management" }
    );
  };

  const sendAccessToken = async (accessToken, company_id) => {
    const res = await fetchJson(`${API_BASE_URL}/whatsapp/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: company_id,
        access_token: accessToken,
      }),
    });
    setLoading(false);
    if (res?.flag === "S") {
      tokenValid = true;
    } else {
      tokenValid = false;
      toast.error(`${res.msg}`);
    }
    setWizard(w => ({
      ...w,
      cloud: {
        ...w.cloud,
        tokenValid: tokenValid
      }
    }));
  };
  const verifyBSPCred = async () => {

    setLoading(true);
    if (bspCred.provider == 'twilio') {
      if (!bspCred.provider || !bspCred.account_sid || !bspCred.auth_token) {
        toast.error("Missing BSP credentials. Please fill all required fields.");
        setLoading(false);
        return;
      }
    }

    const res = await fetchJson(`${API_BASE_URL}/whatsapp/verify_bsp_cred`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...bspCred,
        company_id: company_id,
      }),
    });
    setLoading(false);
    let tokenValid = false;
    if (res?.flag === "S") {
      tokenValid = true;
      setConfiguration((w) => (
        {
          ...w,
          config_json: bspCred
        }
      ))
    } else {
      tokenValid = false;
      toast.error(`${res.msg}`);
    }
    setWizard((w) => ({ ...w, bsp: { ...w.bsp, validated: tokenValid } }))
  };
  const getBSPCred = async () => {

    setLoading(true);
    const res = await fetchJson(`${API_BASE_URL}/whatsapp/twilio/getBspCred`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: company_id,
        type: 'twilio'
      }),
    });
    setLoading(false);
    if (res?.flag === "S") {
      tokenValid = true;
    } else {
      tokenValid = false;
      toast.error(`${res.msg}`);
    }
    setWizard((w) => ({ ...w, bsp: { ...w.bsp, validated: tokenValid } }))
  };

  function maskSensitive(str) {

    if (!str) return '';                 // Empty or null

    if (str.length <= 4) return str;        // Short strings, show as-is
    return '*'.repeat(str.length - 4) + str.slice(-4);
  }
  // CLOUD API UI
  if (isCloud) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
            Cloud API
          </span>
          <span className="text-xs text-slate-500">Connect with Facebook Business</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#1877F2]/10 text-[#1877F2] text-lg font-bold">
              f
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-slate-900">Sign in with Facebook</div>
              <div className="mt-1 text-sm text-slate-600">
                We’ll request Business access to list your Businesses (BM) and WhatsApp Business Accounts (WABA).
              </div>

              {!signedIn ? (
                <div className="mt-4 flex">
                  <Button
                    disabled={loading}
                    className="h-11 rounded-lg bg-[#2E6FE7] px-5 text-white hover:bg-[#2a63cc]"
                    onClick={handleFacebookLogin}
                  >
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                      f
                    </span>
                    Sign in with Facebook
                  </Button>
                  <div className='mx-3 my-2'>
                    {loading && <Loader />}
                  </div>
                </div>
              ) : (
                <div className="flex mt-4 rounded-lg border w-70 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                  <Check color="#07bc0c" size={24} />
                  <span className="font-medium pl-2">{wizard.cloud.tokenValid && 'Authenticated'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BSP UI
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
          BSP
        </span>
        <span className="text-xs text-slate-500">Connect with your provider</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-base font-semibold text-slate-900">Provider Credentials</div>

        {loading ? (
          <div className="mt-4 text-center text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600">Provider</label>
              <Select
                disabled={true}
                value={wizard.bsp.provider}
                onChange={(e) => {
                  setWizard((w) => ({ ...w, bsp: { ...w.bsp, provider: e.target.value } }));
                  setBspCred((b) => ({ ...b, provider: e.target.value }));
                }}
                options={[
                  { value: '360dialog', label: '360dialog' },
                  { value: 'twilio', label: 'Twilio' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>

            {wizard.bsp.provider === 'twilio' ? (
              <>
                <div>
                  <label className="text-xs text-slate-600">Account SID</label>
                  <Input placeholder="ACxxxxxxxx" value={maskSensitive(wizard.bsp.account_sid) || ''} onChange={(e) => {
                    setWizard((w) => ({ ...w, bsp: { ...w.bsp, account_sid: e.target.value } }));
                    setBspCred((b) => ({ ...b, account_sid: e.target.value }));
                  }} />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Auth Token</label>
                  <Input type="xxxxxxxxxxxxxxxxxxxxxxx" placeholder="••••••••" value={maskSensitive(wizard.bsp.auth_token) || ''} onChange={(e) => {
                    setBspCred((b) => ({ ...b, auth_token: e.target.value }))
                    setWizard((w) => ({ ...w, bsp: { ...w.bsp, auth_token: e.target.value } }));
                  }} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs text-slate-600">API Base URL</label>
                  <Input placeholder="https://api.360dialog.com" />
                </div>
                <div>
                  <label className="text-xs text-slate-600">API Key/Token</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              {!wizard.bsp.validated ? (<Button
                onClick={() => { verifyBSPCred() }}
                className="rounded-lg bg-[#2E6FE7] text-white hover:bg-[#2a63cc]"
              >
                Validate credentials
              </Button>) :
                (
                  <div className="flex mt-4 rounded-lg items-center justify-center border w-50 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                    <Check color="#07bc0c" size={24} />
                    <span className="font-medium ml-1">{wizard.bsp.validated && 'Validated'}</span>
                  </div>
                )
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
