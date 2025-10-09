import React from 'react';
import { Button, Input, Select } from '@components/index';

export default function Step3Authentication({ wizard, setWizard }) {
  const isCloud = wizard.method === 'cloud';

  // ---- CLOUD API UI (matches screenshot) ----
  if (isCloud) {
    const signedIn = Boolean(wizard.cloud.bmId && wizard.cloud.wabaId);

    return (
      <div className="space-y-5">
        {/* Subheader chips */}
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
            Cloud API
          </span>
          <span className="text-xs text-slate-500">Connect with Facebook Business</span>
        </div>

        {/* Sign in card */}
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
                <div className="mt-4">
                  <Button
                    className="h-11 rounded-lg bg-[#2E6FE7] px-5 text-white hover:bg-[#2a63cc]"
                    onClick={() => {
                      // TODO: replace with real OAuth flow.
                      // On success, set BM/WABA (to unlock Continue in the wizard).
                      setWizard(w => ({
                        ...w,
                        cloud: { ...w.cloud, bmId: 'bm_auto', wabaId: 'waba_auto' },
                      }));
                    }}
                  >
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                      f
                    </span>
                    Sign in with Facebook
                  </Button>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  Connected · BM: <span className="font-medium">{wizard.cloud.bmId}</span> · WABA:{' '}
                  <span className="font-medium">{wizard.cloud.wabaId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- BSP UI (clean card, keeps your previous fields) ----
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

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs text-slate-600">Provider</label>
            <Select
              value={wizard.bsp.provider}
              onChange={(v) => setWizard((w) => ({ ...w, bsp: { ...w.bsp, provider: v } }))}
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
                <Input placeholder="ACxxxxxxxx" />
              </div>
              <div>
                <label className="text-xs text-slate-600">Auth Token</label>
                <Input type="password" placeholder="••••••••" />
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
            <Button
              onClick={() => setWizard((w) => ({ ...w, bsp: { ...w.bsp, validated: true } }))}
              className="rounded-lg bg-[#2E6FE7] text-white hover:bg-[#2a63cc]"
            >
              Validate credentials
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}