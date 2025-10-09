// src/ws-utils/ws-integrations/whatsapp-cloud/views/wa-offical-steps/Step6Webhook.jsx
import React from 'react';
import { Button, Input, Select } from '@components/index';

export default function Step6Webhook({ wizard, setWizard }) {
  // base data
  const defaultUrl =
    (typeof window !== 'undefined' ? window.location.origin : '') +
    '/webhooks/whatsapp/callback';

  // local UI state
  const [callbackUrl] = React.useState(defaultUrl);
  const [verifyToken, setVerifyToken] = React.useState(
    wizard.cloud?.verifyToken ||
      `whv_${Math.random().toString(36).slice(2, 8)}xyz${new Date().getFullYear()}`
  );
  const [showToken, setShowToken] = React.useState(false);
  const [subscribed, setSubscribed] = React.useState(false);
  const [verifyStatus, setVerifyStatus] = React.useState(
    wizard.webhookVerified ? 'verified' : 'pending'
  );
  const [sampleType, setSampleType] = React.useState('inbound');
  const [events, setEvents] = React.useState([
    // seed with a few fake rows for demo
    { t: '2:45 PM', ev: 'message.received', status: 200, dur: '120ms', ok: true },
    { t: '2:43 PM', ev: 'message.status', status: 200, dur: '95ms', ok: true },
    { t: '2:40 PM', ev: 'verification', status: 403, dur: '200ms', ok: false },
  ]);

  const isCloud = wizard.method === 'cloud';

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const regenerate = () => {
    const next = `whv_${Math.random().toString(36).slice(2, 10)}_secure_token_${new Date().getFullYear()}`;
    setVerifyToken(next);
    setVerifyStatus('pending');
    setWizard((w) => ({ ...w, cloud: { ...w.cloud, verifyToken: next }, webhookVerified: false }));
  };

  const autoRegister = async () => {
    // TODO: POST /api/wa/webhook/register { wabaId, callbackUrl, verifyToken, events: [...] }
    setSubscribed(true);
    setEvents((prev) => [
      { t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ev: 'subscription', status: 200, dur: '80ms', ok: true },
      ...prev,
    ]);
  };

  const verifyNow = async () => {
    // TODO: Real verify (Meta GET challenge → respond with token)
    setWizard((w) => ({ ...w, webhookVerified: true }));
    setVerifyStatus('verified');
    setEvents((prev) => [
      { t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ev: 'verification', status: 200, dur: '60ms', ok: true },
      ...prev,
    ]);
  };

  const sendSample = () => {
    // TODO: Call backend to simulate event post
    const ev = sampleType === 'inbound' ? 'message.received' : 'message.status';
    setEvents((prev) => [
      { t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ev, status: 200, dur: '110ms', ok: true },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* chips + subtitle */}
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
          {isCloud ? 'Cloud API' : 'BSP'}
        </span>
        <span className="text-xs text-slate-500">Configure webhook for message delivery</span>
      </div>

      {/* Callback details */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">🔗</span>
          <div className="text-sm font-semibold text-slate-900">Callback Details</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Callback URL</label>
            <div className="relative">
              <Input readOnly value={callbackUrl} />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 text-slate-500 hover:text-slate-700"
                onClick={() => copy(callbackUrl)}
                title="Copy"
              >
                📋
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Verify Token</label>
            <div className="relative">
              <Input type={showToken ? 'text' : 'password'} value={verifyToken} readOnly />
              <button
                type="button"
                className="absolute right-8 top-1/2 -translate-y-1/2 rounded px-2 text-slate-500 hover:text-slate-700"
                onClick={() => setShowToken((s) => !s)}
                title={showToken ? 'Hide' : 'Show'}
              >
                {showToken ? '🙈' : '👁️'}
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 text-slate-500 hover:text-slate-700"
                onClick={() => copy(verifyToken)}
                title="Copy"
              >
                📋
              </button>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs">
              <button className="text-[#FF5C0A] underline underline-offset-2" onClick={regenerate}>
                Regenerate token
              </button>
              <a className="text-[#2E6FE7] underline underline-offset-2" href="#">
                What is this?
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Register & Subscribe */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 text-sm font-semibold text-slate-900">Register & Subscribe</div>
        <div className="mb-4 text-sm text-slate-600">
          We’ll register this URL for your selected WABA and subscribe to <span className="font-medium">messages</span> and <span className="font-medium">message_status</span> events.
        </div>

        <div className="space-y-2">
          <SubRow label="messages" desc="Receive incoming WhatsApp messages" />
          <SubRow label="message_status" desc="Receive delivery and read receipts" />
        </div>

        <div className="mt-4">
          <Button
            onClick={autoRegister}
            className="h-11 rounded-lg bg-[#FF5C0A] px-5 text-white hover:bg-[#e65309]"
          >
            🚀 Auto-register Webhook
          </Button>
          {subscribed && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Webhook registered and events subscribed.
            </div>
          )}
        </div>
      </div>

      {/* Verification & Live Test */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200">✔</span>
            <div className="text-sm font-semibold text-slate-900">Verification & Live Test</div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs ${
              verifyStatus === 'verified'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 border'
                : 'border-amber-200 bg-amber-50 text-amber-800 border'
            }`}
          >
            {verifyStatus === 'verified' ? 'Verified' : 'Pending'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={verifyNow}
            className="rounded-lg bg-[#2E6FE7] px-4 text-white hover:bg-[#2a63cc]"
          >
            Verify Now
          </Button>

          <div className="ml-0 flex items-center gap-2">
            <span className="text-sm text-slate-600">Send sample event:</span>
            <Select
              value={sampleType}
              onChange={setSampleType}
              options={[
                { value: 'inbound', label: 'Inbound message' },
                { value: 'status', label: 'message_status' },
              ]}
            />
            <Button variant="secondary" onClick={sendSample}>
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Webhook Events */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200">≡</span>
            <div className="text-sm font-semibold text-slate-900">Recent Webhook Events</div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value="all"
              onChange={() => {}}
              options={[{ value: 'all', label: 'All events' }]}
            />
            <Select
              value="24h"
              onChange={() => {}}
              options={[
                { value: '1h', label: 'Last 1h' },
                { value: '24h', label: 'Last 24h' },
                { value: '7d', label: 'Last 7d' },
              ]}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2 text-slate-700">{e.t}</td>
                  <td className="px-3 py-2 text-slate-700">{e.ev}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-md px-2 py-0.5 text-xs ${e.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{e.dur}</td>
                  <td className="px-3 py-2">{e.ok ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* side help card “Webhook Security” belongs to the wizard sidebar, not this step body */}
    </div>
  );
}

function SubRow({ label, desc }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div>
        <div className="text-sm font-medium text-slate-800">{label}</div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>
      <span className="rounded-md bg-white px-2 py-0.5 text-xs text-slate-600">required</span>
    </div>
  );
}
