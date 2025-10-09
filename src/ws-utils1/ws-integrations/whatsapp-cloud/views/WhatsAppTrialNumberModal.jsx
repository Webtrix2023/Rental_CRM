import React from 'react';
import { Dialog, Button, Input, Select, Tabs } from '@components/index';

export default function WhatsAppTrialNumberModal({
  open,
  onClose,
  onConnectOwnNumber, // optional: when user clicks “Connect Your Own Number”
}) {
  // demo data (replace with API)
  const trialDeepLink = 'https://wa.me/15551234567?text=START';
  const trialQrSrc = ''; // if you render a QR image, place its URL here
  const templates = [
    { value: 'welcome_trial', label: 'welcome_trial · Welcome to CRM Ease trial' },
    { value: 'otp_trial', label: 'otp_trial · Trial OTP' },
  ];

  const [tab, setTab] = React.useState('template'); // 'template' | 'session'
  const [tpl, setTpl] = React.useState(templates[0].value);
  const [customer, setCustomer] = React.useState('John Doe');
  const [sessionMsg, setSessionMsg] = React.useState('Hello from CRM Ease Trial 👋');
  const [sending, setSending] = React.useState(false);
  const [sessionActive] = React.useState(true);
  const [lastInbound] = React.useState('2:46 PM');
  const [fromMasked] = React.useState('+91 9876**2210');

  const openInWhatsApp = () => {
    window.open(trialDeepLink, '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(trialDeepLink); } catch {}
  };

  const sendTemplate = async () => {
    setSending(true);
    // TODO: POST /api/wa/trial/send-template { tpl, customer }
    await new Promise(r => setTimeout(r, 600));
    setSending(false);
  };

  const sendSession = async () => {
    setSending(true);
    // TODO: POST /api/wa/trial/send-session { text: sessionMsg }
    await new Promise(r => setTimeout(r, 600));
    setSending(false);
  };

  return (
    <Dialog
      isOpen={open}
      onClose={onClose}
      variant="custom"
      hideHeader
      hideFooter
      size="xl"
      bodyClassName="p-0"
    >
      <div className="h-[86vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-[#F7F9FC]">
        {/* top mini-bar (optional hint) */}
       <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-white px-5 py-3">
          <button onClick={onClose} className="mr-1 text-slate-500 hover:text-slate-700">←</button>
          <div className="font-medium text-slate-800">Try WhatsApp with a CRM Ease Test Number</div>
          <div className="ml-2 text-xs text-slate-500">
            Scan the QR to open WhatsApp and send the pre-filled message to start a 24-hour session
          </div>
          <div className="ml-auto rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
            Trial Mode
          </div>
          <div className="ml-2 text-xs text-slate-500">10 msgs/day limit</div>
        </div>

        {/* content */}
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Scan to Start */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">Scan to Start</div>

              <div className="mt-4 flex flex-col items-center">
                <div className="grid h-60 w-60 place-items-center rounded-xl border border-slate-200 bg-slate-50">
                  {/* QR placeholder or image */}
                  {trialQrSrc ? (
                    <img src={trialQrSrc} alt="QR" className="h-56 w-56 rounded-md object-contain" />
                  ) : (
                    <div className="text-slate-400">QR preview</div>
                  )}
                </div>

                <Button
                  className="mt-5 h-11 w-full max-w-sm rounded-lg bg-[#FF5C0A] text-white hover:bg-[#e65309]"
                  onClick={openInWhatsApp}
                >
                  🟢 Open in WhatsApp
                </Button>

                <Button
                  variant="secondary"
                  className="mt-2 h-11 w-full max-w-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                  onClick={copyLink}
                >
                  📋 Copy Link
                </Button>

                <div className="mt-2 text-center text-xs text-slate-500">
                  If the QR doesn’t work, click “Open in WhatsApp”
                </div>
              </div>
            </div>

            {/* Session Status */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">Session Status</div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  {sessionActive ? 'Session Active' : 'Session Inactive'}
                </span>
                <div className="text-xs text-slate-600">
                  Started: <span className="font-medium">Today 2:45 PM</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700">
                <div className="text-slate-500">Last inbound:</div>
                <div>{lastInbound}</div>
                <div className="text-slate-500">From:</div>
                <div>{fromMasked}</div>
              </div>

              <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-slate-700">
                <span className="text-sky-700">ℹ</span>{' '}
                Send <span className="font-medium">“START”</span> manually after opening the chat if nothing happens in 2 minutes
              </div>
            </div>

            
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Send a Test */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">Send a Test</div>

              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { key: 'template', label: 'Template' },
                  { key: 'session', label: 'Session Message' },
                ]}
              />

              {tab === 'template' ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Template</label>
                    <Select value={tpl} onChange={setTpl} options={templates} />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Customer Name</label>
                    <Input value={customer} onChange={(e) => setCustomer(e.target.value)} />
                  </div>

                  <Button
                    onClick={sendTemplate}
                    disabled={sending}
                    className="mt-1 h-11 w-full rounded-lg bg-[#FF5C0A] text-white hover:bg-[#e65309] disabled:opacity-60"
                  >
                    {sending ? 'Sending…' : 'Send Test Template'}
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Message</label>
                    <Input value={sessionMsg} onChange={(e) => setSessionMsg(e.target.value)} />
                  </div>
                  <Button
                    onClick={sendSession}
                    disabled={sending}
                    className="mt-1 h-11 w-full rounded-lg bg-[#FF5C0A] text-white hover:bg-[#e65309] disabled:opacity-60"
                  >
                    {sending ? 'Sending…' : 'Send Session Message'}
                  </Button>
                </div>
              )}
            </div>

            {/* Trial Limitations */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">Trial Limitations</div>

              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-300" />
                  Shared number for evaluation only (no campaigns, no bulk)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-300" />
                  Daily cap & fair-use rate limits apply
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-300" />
                  Content must follow WhatsApp policies; do not share sensitive data
                </li>
              </ul>

              <Button
                className="mt-4 h-11 w-full rounded-lg bg-[#0B2C59] text-white hover:bg-[#0a264c]"
                onClick={() => onConnectOwnNumber?.()}
              >
                Connect Your Own Number
              </Button>
            </div>
          </div>
        </div>
{/* Next Steps */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 m-6">
              <div className="text-sm font-semibold text-slate-900">Next Steps</div>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <Tile
                  title="Open Unified Inbox"
                  sub="View the test thread"
                  cta="Open"
                  onClick={() => window.open('#/inbox', '_blank')}
                />

                <Tile
                  title="Build a Campaign"
                  sub="Connect your own number to enable"
                  disabled
                />

                <Tile
                  title="Numbers & Templates"
                  sub="Learn about your own setup"
                  cta="Manage"
                  onClick={() => onConnectOwnNumber?.()}
                />
              </div>
            </div>
        {/* footer note */}
       <div className="sticky bottom-0 z-20 border-t bg-white px-5 py-3 text-center text-xs text-slate-500">
          CRM Ease Trial Number is for product evaluation only. Messages may be moderated and logs retained briefly to improve service.
        </div>
      </div>
    </Dialog>
  );
}

/* --- small helper tile --- */
function Tile({ title, sub, cta, onClick, disabled }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        disabled ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="text-sm font-medium text-slate-900">{title}</div>
      <div className="mt-1 text-xs text-slate-600">{sub}</div>
      {cta && (
        <div className="mt-3">
          <Button
            variant="secondary"
            className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            onClick={onClick}
            disabled={disabled}
          >
            {cta}
          </Button>
        </div>
      )}
    </div>
  );
}
