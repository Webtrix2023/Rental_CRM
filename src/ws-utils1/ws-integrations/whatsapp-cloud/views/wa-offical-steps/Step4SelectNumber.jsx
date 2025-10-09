// src/ws-utils/ws-integrations/whatsapp-cloud/views/wa-offical-steps/Step4SelectNumber.jsx
import React, { useEffect, useState } from 'react';
import { Button, Input, Select } from '@components/index';

export default function Step4SelectNumber({ wizard, setWizard }) {
  const isCloud = wizard.method === 'cloud';
  // Wrapper has NO hooks. Choose sub-view.
  return isCloud ? (
    <CloudSelectNumber wizard={wizard} setWizard={setWizard} />
  ) : null;
}

function CloudSelectNumber({ wizard, setWizard }) {
  // ✅ Hooks are always called for this component
  //Replace the demo arrays with your real API (GET /waba/:id/numbers, POST /numbers/register, POST /numbers/verify).
  const [numbers, setNumbers] = useState([
    { id: 'num_1', phone: '+1 415 555 0101', label: 'Default' },
    { id: 'num_2', phone: '+91 98765 43210', label: '—' },
  ]);
  const [selectedId, setSelectedId] = useState(wizard.numberId || '');

  // New-registration state
  const [cc, setCc] = useState('+1');
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [method, setMethod] = useState('sms');         // 'sms' | 'voice'
  const [stage, setStage] = useState('idle');          // 'idle' | 'code_sent' | 'verified'
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // keep wizard in sync when user picks an existing number
    if (selectedId && selectedId !== wizard.numberId) {
      setWizard((w) => ({ ...w, numberId: selectedId }));
    }
  }, [selectedId]); // setWizard is stable from props

  const canSendCode =
    cc.trim() !== '' && phone.trim().length >= 6 && displayName.trim().length >= 2 && stage === 'idle';

  const sendCode = () => {
    if (!canSendCode) return;
    // TODO: call backend to request OTP
    setStage('code_sent');
  };

  const verifyAndRegister = () => {
    if (!otp.trim()) return;
    // TODO: verify via backend, then add to list and select
    const id = `num_${Date.now()}`;
    const pretty = `${cc} ${phone.replace(/(\d{5})(\d{5})/, '$1 $2')}`;
    const newNum = { id, phone: pretty, label: 'New' };
    setNumbers((prev) => [newNum, ...prev]);
    setSelectedId(id);
    setWizard((w) => ({ ...w, numberId: id }));
    setStage('verified');
  };

  return (
    <div className="space-y-5">
      {/* chips + subheader */}
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
          Cloud API
        </span>
        <span className="text-xs text-slate-500">Choose your WhatsApp number</span>
      </div>

      {/* info banner */}
      <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-slate-700">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/60 text-sky-700">i</span>
        <div className="text-sm">Numbers must be registered to this WABA before messaging.</div>
      </div>

      {/* Existing numbers */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">📞</span>
          <div className="text-sm font-semibold text-slate-900">Existing Numbers</div>
        </div>

        <div className="space-y-2">
          {numbers.map((n) => (
            <label key={n.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="waNumber"
                  className="h-4 w-4"
                  checked={selectedId === n.id}
                  onChange={() => setSelectedId(n.id)}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800">{n.phone}</div>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{n.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* OR divider */}
      <div className="relative my-2">
        <div className="h-px w-full bg-slate-200" />
        <span className="absolute left-1/2 top-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-50 px-2 text-xs text-slate-500">
          or
        </span>
      </div>

      {/* Add & Register new number */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200">＋</span>
          <div className="text-sm font-semibold text-slate-900">Add & Register New Number</div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Phone number (cc + phone) */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">Phone Number</label>
            <div className="flex gap-2">
              <Select
                value={cc}
                onChange={setCc}
                options={[{ value: '+1', label: '+1' }, { value: '+44', label: '+44' }, { value: '+91', label: '+91' }, { value: '+61', label: '+61' }]}
              />
              <Input placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          {/* Verification method */}
          <div>
            <div className="mb-1 text-xs font-medium text-slate-700">Verification Method</div>
            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="radio" name="verifyMethod" value="sms" checked={method === 'sms'} onChange={() => setMethod('sms')} />
                SMS
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="radio" name="verifyMethod" value="voice" checked={method === 'voice'} onChange={() => setMethod('voice')} />
                Voice Call
              </label>
            </div>
          </div>

          {/* Display name */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Display Name <span className="text-sky-600" title="Must follow WhatsApp policy">•</span>
            </label>
            <Input placeholder="Your business name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <div className="mt-1 text-xs text-slate-500">Must comply with WhatsApp naming policy</div>
          </div>

          {/* Send code / OTP */}
          <div className="flex items-end">
            {stage === 'idle' && (
              <Button
                variant="secondary"
                className="h-11 w-full cursor-pointer rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-60"
                disabled={!canSendCode}
                onClick={sendCode}
              >
                Send Verification Code
              </Button>
            )}

            {stage === 'code_sent' && (
              <div className="flex w-full items-center gap-2">
                <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <Button onClick={verifyAndRegister}>Verify & Register</Button>
              </div>
            )}

            {stage === 'verified' && (
              <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Number verified & registered. Selected as current sender.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
