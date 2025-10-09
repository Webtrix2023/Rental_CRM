import React, { useState } from 'react';
import { Button, Input } from '@components/index';

export default function Step2Prerequisites({ wizard }) {
  const isCloud = wizard.method === 'cloud';

  // local status just for UI (your real implementation can bind these to wizard or API)
  const [bmReady, setBmReady] = useState(false);
  const [wabaReady, setWabaReady] = useState(false);
  const [phoneReady, setPhoneReady] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [displayReady, setDisplayReady] = useState(false);

  if (!isCloud) {
    // BSP variant (simple for now – you can style similarly if needed)
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm text-slate-600">Connect via your BSP provider. Make sure you have:</div>
        <div className="mt-3 space-y-2">
          <MiniCheckRow label="BSP account active" />
          <MiniCheckRow label="API base URL & API key/token ready" />
          <MiniCheckRow label="At least one WhatsApp number available" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* LEFT — main content */}
      <div className="xl:col-span-2 space-y-4">
        {/* Subheader */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">Cloud API</span>
          <span className="text-xs text-slate-500">Let’s verify you have everything needed</span>
        </div>

        {/* Attention banner */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
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
                // simulate re-check
                setBmReady(false);
                setWabaReady(false);
                setPhoneReady(false);
                setDisplayReady(false);
              }}
            >
              Re-check all
            </Button>
          </div>
        </div>

        {/* Requirements title */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">Requirements Checklist</h3>
        </div>

        {/* Cards list */}
        <div className="space-y-3">
          {/* FBM */}
          <ReqCard
            icon={<FbIcon />}
            title="Facebook Business Manager account"
            subtitle="Sign in to your Facebook Business Manager to proceed"
            status={bmReady ? 'ready' : 'action'}
            right={
              <div className="flex items-center gap-2">
                <Button
                  className="rounded-lg bg-[#2E6FE7] px-3 py-1.5 text-white hover:bg-[#2a63cc]"
                  onClick={() => setBmReady(true)}
                >
                  Sign in with Facebook
                </Button>
                <a href="#" className="text-xs text-[#2E6FE7] underline underline-offset-2">Learn more</a>
              </div>
            }
          />

          {/* WABA */}
          <ReqCard
            icon={<WaIcon />}
            title="WhatsApp Business Account (WABA)"
            subtitle="Use an existing WABA or create one in Business Manager"
            status={wabaReady ? 'ready' : 'pending'}
            right={
              <div className="flex items-center gap-2">
                <Button
                  className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-sky-700 hover:bg-sky-100"
                  variant="secondary"
                  onClick={() => setWabaReady(true)}
                >
                  Detect WABA
                </Button>
                <Button className="cursor-not-allowed rounded-lg bg-slate-100 px-3 py-1.5 text-slate-400" disabled>
                  Create WABA
                </Button>
                <a href="#" className="text-xs text-[#2E6FE7] underline underline-offset-2">What is WABA?</a>
              </div>
            }
          />

          {/* Phone number not registered */}
          <ReqCard
            icon={<PhoneIcon />}
            title="Phone number not registered on WhatsApp"
            subtitle={
              <>
                Use a number not active in the WhatsApp app
                <div className="text-xs text-slate-500">This will be re-checked in Step 4 when selecting your number</div>
              </>
            }
            status={phoneReady ? 'ready' : 'action'}
            right={
              <div className="flex items-center gap-2">
                <Button
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
                  onClick={() => setPhoneReady(true)}
                >
                  Mark as ready
                </Button>
                <a href="#" className="text-xs text-[#2E6FE7] underline underline-offset-2">How to deregister/migrate</a>
              </div>
            }
          />

          {/* Display name */}
          <ReqCard
            icon={<TagIcon />}
            title="Display name ready"
            subtitle="Your brand name must meet WhatsApp naming policy"
            status={displayReady ? 'ready' : 'action'}
            right={
              <div className="flex items-center gap-2">
                <div className="w-56">
                  <Input
                    placeholder="Enter your brand name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <Button
                  className="rounded-lg bg-[#FF5C0A] px-3 py-1.5 text-white hover:bg-[#e65309]"
                  onClick={() => setDisplayReady(!!displayName.trim())}
                >
                  Save
                </Button>
                <a href="#" className="text-xs text-[#2E6FE7] underline underline-offset-2">Naming policy</a>
              </div>
            }
          />
        </div>
      </div>

      {/* RIGHT — quick guides */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-800">Quick Guides</div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-800">How to create a WABA</div>
            <ol className="mt-2 list-decimal pl-4 text-xs text-slate-600 space-y-1">
              <li>Go to Business Manager</li>
              <li>Click “Create Account”</li>
              <li>Select “WhatsApp”</li>
              <li>Follow setup steps</li>
            </ol>
            <a href="#" className="mt-2 inline-block text-xs text-[#2E6FE7] underline underline-offset-2">View full guide</a>
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-800">Deregister/migrate number</div>
            <ol className="mt-2 list-decimal pl-4 text-xs text-slate-600 space-y-1">
              <li>Open WhatsApp app</li>
              <li>Go to Settings</li>
              <li>Delete Account</li>
              <li>Wait 24 hours</li>
            </ol>
            <a href="#" className="mt-2 inline-block text-xs text-[#2E6FE7] underline underline-offset-2">View full guide</a>
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

function MiniCheckRow({ label }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-sm text-slate-700">{label}</div>
      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">Check</span>
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

// Placeholder glyphs (swap to your vectors later)
function FbIcon() {
  return <span className="text-[18px]">𝔉</span>;
}
function WaIcon() {
  return <span className="text-[18px]">🟢</span>;
}
function PhoneIcon() {
  return <span className="text-[18px]">📞</span>;
}
function TagIcon() {
  return <span className="text-[18px]">🏷️</span>;
}