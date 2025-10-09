// src/ws-utils/ws-integrations/whatsapp-cloud/views/wa-offical-steps/Step8TestFinish.jsx
import React from 'react';
import { Button, Input, Select, Tabs, Switch } from '@components/index';
import { preview } from 'vite';

const Test = ({ wizard, setWizard }) => {
  // demo list – replace with numbers connected to this WABA
  const numbers = [
    { value: 'num_1', label: '+1 (234) 567-8900 - Business Main', quality: 'High Quality', limit: '10K Limit' },
  ];

  const [sender, setSender] = React.useState([]);
  const [recipient, setRecipient] = React.useState('');
  const [mode, setMode] = React.useState('template'); // 'template' | 'session'
  const [tpl, setTpl] = React.useState('t1');
  const [v1, setV1] = React.useState('John Doe');
  const [v2, setV2] = React.useState('CRM Ease');

  const [sending, setSending] = React.useState(false);
  const [result, setResult] = React.useState(null); // { ok: boolean, text: string }
  const [defaultSender, setDefaultSender] = React.useState(true);
  
  const templates = [
    { value: 'hello_world', label: 'Welcome Message', preview:"Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.WhatsApp Business Platform sample message" },
  ];
  // const getSelectedTemplate = templates.find(temp) 
  // const getSelectedTemplate = (tpl) => templates.find(t => t.value === tpl);


  const canSend =
    !!sender && recipient.trim().length >= 8 && (mode === 'session' || (mode === 'template' && !!tpl));

  const doSend = async () => {
    if (!canSend || sending) return;
    setSending(true);
    setResult(null);

    // TODO: call your backend: POST /api/wa/test-send
    await new Promise((r) => setTimeout(r, 700));

    setSending(false);
    setResult({ ok: true, text: 'Queued successfully (ID: msg_12345). Check “Recent Webhook Events”.' });
  };

  // persist default sender choice (optional)
  React.useEffect(() => {
    setWizard?.((w) => ({ ...w, defaultSender: defaultSender ? sender : null }));
  }, [defaultSender, sender]); // eslint-disable-line

  const senderMeta = numbers.find((n) => n.value === sender);

  return (
    <div className="space-y-6">
      {/* header chips */}
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
          Cloud API
        </span>
        <span className="text-xs text-slate-500">Send a test message and complete setup</span>
        <a href="#" className="ml-auto text-xs text-[#2E6FE7]">View setup summary</a>
      </div>

      {/* Choose Number & Test Target */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">📞</span>
          {/* <div className="text-sm font-semibold text-slate-900">Choose Number & Test Target</div> */}
          <div className="text-sm font-semibold text-slate-900">Test Target</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Sender Number</label>
            <Select value={sender} onChange={setSender} options={numbers} />
            {senderMeta && (
              <div className="mt-2 flex items-center gap-2 text-[11px]">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">{senderMeta.quality}</span>
                <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-700">{senderMeta.limit}</span>
              </div>
            )}
          </div> */}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Recipient (Your Phone)</label>
            <div className="relative">
              <Input placeholder="+1 234 567 8900" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              {/* <button className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#2E6FE7]" type="button">
                Use admin phone
              </button> */}
            </div>
            <div className="mt-1 text-xs text-slate-500">Must be different from sender number</div>
          </div>
        </div>
      </div>

      {/* Message to Send */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-50 text-violet-600 ring-1 ring-violet-200">🧾</span>
          <div className="text-sm font-semibold text-slate-900">Message to Send</div>
        </div>

        <Tabs
          value={mode}
          onChange={setMode}
          items={[
            { key: 'template', label: 'Template' },
            { key: 'session', label: 'Session Message' },
          ]}
        />

        {mode === 'template' ? (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Select Template</label>
              <Select value={tpl} onChange={setTpl} options={templates} />
            </div>

            <div>
              <div className="mb-1 text-xs font-medium text-slate-700">Variables Preview</div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 text-xs text-slate-500">{'{{1}}'}</div>
                  <Input value={v1} onChange={(e) => setV1(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 text-xs text-slate-500">{'{{2}}'}</div>
                  <Input value={v2} onChange={(e) => setV2(e.target.value)} />
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-slate-700">
                <span className="text-slate-500">Preview:</span>{' '}

                Hi {v1}, welcome to {v2}! We’re excited to help you manage your customer relationships more effectively.
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-slate-700">Text</label>
            <Input placeholder="Hello from Webtrix24!" />
          </div>
        )}
      </div>

      {/* Send Test & Live Result */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">📤</span>
            <div className="text-sm font-semibold text-slate-900">Send Test & Live Result</div>
          </div>
          <Button
            onClick={doSend}
            disabled={!canSend || sending}
            className="rounded-lg bg-[#FF5C0A] px-4 text-white hover:bg-[#e65309] disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send Test'}
          </Button>
        </div>

        {result && (
          <div
            className={`rounded-lg p-3 text-sm ${
              result.ok
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            {result.text}
          </div>
        )}
      </div>

      {/* Defaults & Safeguards */}
      {/* <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">🛡️</span>
          <div className="text-sm font-semibold text-slate-900">Defaults & Safeguards</div>
        </div>

        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div>
            <div className="text-sm font-medium text-slate-800">Set as Default Sender</div>
            <div className="text-xs text-slate-500">Use this number for new campaigns and messages</div>
          </div>
          <Switch checked={defaultSender} onChange={setDefaultSender} />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
          <div>Quiet hours reminder</div>
          <a href="#" className="text-[#2E6FE7]">Messaging Settings</a>
        </div>
      </div> */}
    </div>
  );
}

export default Test;