// src/ws-utils/ws-integrations/whatsapp-cloud/views/wa-offical-steps/Step8TestFinish.jsx
import {React, useEffect,useState} from 'react';
import { Button, Input, Select, Tabs, Switch } from '@components/index';
import { fetchJson } from "@utils/fetchJson";
import { API_BASE_URL } from '@config';

const Test = ({ wizard, setWizard }) => {
  const numbers = [
    { value: 'num_1', label: '+1 (234) 567-8900 - Business Main', quality: 'High Quality', limit: '10K Limit' },
  ];

  const [recipient, setRecipient] = useState('');
  const [mode, setMode] = useState('template'); // 'template' | 'session'
  const [tpl, setTpl] = useState('hello_world');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const templates = [
    { value: 'hello_world', label: 'Hello World', preview:"Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.WhatsApp Business Platform sample message" },
    { value: 'test_template', label: 'Test Template', preview:"Greetings!!!Testing Template" },
  ];
  
  const getSelectedTemplate = (tpl) => templates.find(t => t.value === tpl);
  console.log(tpl);
  
  const setMessage = (tpl) => {
    if (mode === 'template') {
      const temp = getSelectedTemplate(tpl);
      setText(temp.preview || '')
    }else{
      setText('')
    }
  }

  useEffect(() => {
    setMessage(tpl)
  }, [mode])
  
 
  const canSend =
    recipient.trim().length >= 10 &&
    ((mode === 'template' && tpl) || (mode === 'session' && text.trim().length > 0));

  const doSend = async () => {
    if (!canSend || sending) return;

    setSending(true);
    setResult(null);

    try {
      // Replace with your real API endpoint
      const res = await fetchJson(`${API_BASE_URL}/test-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          mode,
          template: mode === 'template' ? tpl : undefined,
          text: mode === 'session' ? text : undefined,
        }),
      });
      setSending(false);
      if (res?.flag === "S") {
        setResult({
          ok: true,
          text: res.msg,
        });
      } else {
        setResult({
          ok: false,
          text: res.msg,
        });
      }
    } catch (err) {
      console.error(err);
      setResult({ ok: false, text: 'Error sending message. Please try again.' });
    }
  };


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
          <div className="text-sm font-semibold text-slate-900">Test Target</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Recipient (Your Phone)</label>
            <div className="relative">
              <Input placeholder="+1 234 567 8900" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
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
        
        <div className="mt-4">
          <div className="sticky top-0 z-10 border-b border-b-gray-300 bg-white">
            <div className="mx-auto max-w-7xl px-4 pl-0 sm:px-6 sm:pl-0 lg:px-8 lg:pl-0">
              <nav className="flex justify-left items-center gap-2 pt-3">
                {[
                  { key: 'template', label: 'Template' },
                  { key: 'session', label: 'Session Message' },
                ].map((item) => (
                  <div key={item.key} className="relative group">
                    <button
                      onClick={() => setMode(item.key)}
                      className={`relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition border-b-2 ${mode === item.key
                          ? "border-orange-600 text-orange-600"
                          : "border-transparent text-gray-700 hover:text-gray-900"
                        }`}
                    >
                      {item.label}
                    </button>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {mode === 'template' ? (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Select Template</label>
              <Select value={tpl} onChange={(e) => {setTpl(e.target.value)}} options={templates} />
            </div>

            <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-slate-700">
              <span className="text-slate-500">Preview:</span>{' '}
              { getSelectedTemplate(tpl).preview || 'No preview available.'}
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-slate-700">Text</label>
            <Input placeholder="Hello from Webtrix24!" value={text} onChange={(e) => setText(e.target.value)} />
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
    </div>
  );
}

export default Test;
