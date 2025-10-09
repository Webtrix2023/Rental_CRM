// src/ws-utils/ws-integrations/whatsapp-cloud/views/wa-offical-steps/Step5AccessToken.jsx
import React from 'react';
import { Button, Input } from '@components/index';

export default function Step5AccessToken({ wizard, setWizard }) {
  const [token, setToken] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [validating, setValidating] = React.useState(false);
  const [error, setError] = React.useState('');

  const canValidate = token.trim().length > 0 && !validating;

  const handlePaste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setToken((t || '').trim());
    } catch {
      // noop – browser might block clipboard without user gesture
    }
  };

  const handleClear = () => {
    setToken('');
    setError('');
    setWizard((w) => ({ ...w, cloud: { ...w.cloud, tokenValid: false } }));
  };

  const validateToken = async () => {
    if (!canValidate) return;
    setValidating(true);
    setError('');

    // TODO: call your backend: POST /api/wa/validate-token { token }
    // Quick client-side sanity check (format hint only)
    const looksLikeFb = /^EAA/i.test(token) || /^EAAG/i.test(token);

    // Simulate async
    await new Promise((r) => setTimeout(r, 500));

    if (!looksLikeFb) {
      setWizard((w) => ({ ...w, cloud: { ...w.cloud, tokenValid: false } }));
      setError('This does not look like a valid Facebook System User token.');
    } else {
      setWizard((w) => ({ ...w, cloud: { ...w.cloud, tokenValid: true } }));
    }

    setValidating(false);
  };

  return (
    <div className="space-y-5">
      {/* chips + subtitle */}
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
          Cloud API
        </span>
        <span className="text-xs text-slate-500">Provide your Facebook System User token</span>
      </div>

      {/* Token card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">🔑</div>
          <div className="flex-1">
            <div className="text-base font-semibold text-slate-900">Paste Access Token</div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-slate-700">
                System User Access Token
              </label>

              <div className="relative">
                <Input
                  type={show ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your Facebook System User token here"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 text-slate-500 hover:text-slate-700"
                  aria-label={show ? 'Hide token' : 'Show token'}
                >
                  {show ? '🙈' : '👁️'}
                </button>
              </div>

              <div className="mt-1 text-xs text-slate-500">
                Use a System User token from your Facebook Business. Recommended: restricted role, long-lived token.
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                  onClick={handlePaste}
                >
                  📋 Paste from Clipboard
                </Button>

                <Button
                  variant="secondary"
                  className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                  onClick={handleClear}
                >
                  🗑️ Clear
                </Button>

                <Button
                  onClick={validateToken}
                  disabled={!canValidate}
                  className="rounded-lg bg-[#2E6FE7] px-4 text-white hover:bg-[#2a63cc] disabled:opacity-60"
                >
                  {validating ? 'Validating…' : '✔ Validate Token'}
                </Button>
              </div>

              {wizard.cloud.tokenValid && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  Token valid. You can continue.
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* (The left “Token Best Practices” help card shown in your screenshot belongs to the wizard sidebar) */}
    </div>
  );
}
