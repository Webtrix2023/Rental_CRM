// src/ws-utils/ws-integrations/whatsapp-cloud/views/wa-offical-steps/Step7Templates.jsx
import React from 'react';
import { Button, Input, Select } from '@components/index';

export default function Templates() {
  // demo data (replace with API payload)
  const [lastSync, setLastSync] = React.useState(new Date());
  const [query, setQuery] = React.useState('');
  const [cat, setCat] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [lang, setLang] = React.useState('all');

  const [templates, setTemplates] = React.useState([
    { id: 't1', name: 'Welcome Message', category: 'Marketing', status: 'APPROVED', lang: 'EN', updated: '2 days ago', variables: 1 },
    { id: 't2', name: 'OTP Verification', category: 'Authentication', status: 'APPROVED', lang: 'EN', updated: '1 week ago', variables: 2, starred: true },
    { id: 't3', name: 'Promotion Alert', category: 'Marketing', status: 'PENDING', lang: 'EN', updated: '3 days ago', variables: 3 },
  ]);

  const approvedCount = templates.filter(t => t.status === 'APPROVED').length;
  const pendingCount  = templates.filter(t => t.status === 'PENDING').length;
  const rejectedCount = templates.filter(t => t.status === 'REJECTED').length;

  const filtered = templates.filter(t => {
    const q = query.trim().toLowerCase();
    const byQ = !q || t.name.toLowerCase().includes(q);
    const byCat = cat === 'all' || t.category.toLowerCase() === cat;
    const byStatus = status === 'all' || t.status === status.toUpperCase();
    const byLang = lang === 'all' || t.lang.toLowerCase() === lang;
    return byQ && byCat && byStatus && byLang;
  });

  const syncNow = async () => {
    // TODO: fetch from Meta / your backend
    setLastSync(new Date());
  };

  const lastSyncLabel = (() => {
    const d = lastSync;
    const hh = d.getHours() % 12 || 12;
    const mm = d.getMinutes().toString().padStart(2, '0');
    const ap = d.getHours() >= 12 ? 'PM' : 'AM';
    return `Today ${hh}:${mm} ${ap}`;
  })();

  return (
    <div className="space-y-6">
      {/* header row inside the step (chip + right sync) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
            Cloud API
          </span>
          <span className="text-xs text-slate-500">Review templates and number quality</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Last sync: {lastSyncLabel}</span>
          <Button
            className="rounded-lg bg-[#FF5C0A] px-4 text-white hover:bg-[#e65309]"
            onClick={syncNow}
          >
            Sync Templates
          </Button>
        </div>
      </div>

      {/* Number Health */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">❤</span>
          <div className="text-sm font-semibold text-slate-900">Number Health</div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <HealthPill
            label="Quality Rating"
            value="HIGH"
            sub="Excellent message delivery"
            tone="green"
          />
          <HealthPill
            label="Messaging Limit"
            value="10K"
            sub="Per day capacity"
            tone="blue"
          />
          <HealthPill
            label="Template Count"
            value={`${approvedCount}/${pendingCount}/${rejectedCount || 1}`}
            sub="Approved/Pending/Rejected"
            tone="amber"
          />
        </div>

        <div className="mt-3 flex gap-4 text-xs">
          <a href="#" className="text-[#2E6FE7] underline underline-offset-2">Improve quality tips</a>
          <a href="#" className="text-[#2E6FE7] underline underline-offset-2">Open WhatsApp Manager</a>
        </div>
      </div>

      {/* Templates */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200">🧩</span>
          <div className="text-sm font-semibold text-slate-900">Templates</div>
        </div>

        {/* search + filters */}
        <div className="mb-3 grid gap-3 md:grid-cols-[1fr,180px,160px,160px]">
          <div className="relative">
            <Input
              placeholder="Search templates…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>

          <Select
            value={cat}
            onChange={setCat}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'utility', label: 'Utility' },
              { value: 'authentication', label: 'Authentication' },
            ]}
          />

          <Select
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />

          <Select
            value={lang}
            onChange={setLang}
            options={[
              { value: 'all', label: 'All Languages' },
              { value: 'en', label: 'EN' },
              { value: 'hi', label: 'HI' },
            ]}
          />
        </div>

        {/* list */}
        <div className="divide-y rounded-lg border border-slate-200 bg-white">
          {filtered.map((t) => (
            <div key={t.id} className="flex flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {/* optional star / icon */}
                  {t.starred ? <span className="text-amber-500">★</span> : <span className="text-slate-300">☆</span>}
                  <div className="truncate font-medium text-slate-900">{t.name}</div>
                </div>
                <div className="mt-0.5 text-xs text-slate-500">Last updated: {t.updated}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px]">
                  <Pill tone="slate">{t.category}</Pill>
                  <Pill tone={t.status === 'APPROVED' ? 'green' : t.status === 'PENDING' ? 'amber' : 'rose'}>
                    {titleCase(t.status)}
                  </Pill>
                  <Pill tone="slate">{t.lang}</Pill>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 text-sm">
                <a href="#" className="text-[#2E6FE7]">Preview</a>
                <span className="text-slate-400">Variables</span>
                <a href="#" className="text-[#2E6FE7]">Open in Meta</a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 text-xs text-slate-500">
          To edit or submit new templates, use WhatsApp Manager
        </div>
      </div>

      {/* Readiness Check */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">✔</span>
          <div className="text-sm font-semibold text-slate-900">Readiness Check</div>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <div className="font-semibold">Template-ready</div>
          <div>You have {approvedCount} approved templates available for messaging</div>
        </div>

        <div className="mt-2 text-xs text-slate-500">
          You can continue without approved templates; you’ll be limited to session messages until templates are approved.
        </div>
      </div>
    </div>
  );
}

/* ---- small UI helpers ---- */
function HealthPill({ label, value, sub, tone }) {
  const map = {
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-sky-50 text-sky-700',
    amber: 'bg-amber-50 text-amber-700',
  }[tone || 'blue'];
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className={`grid h-14 w-14 place-items-center rounded-full ${map}`}>{value}</div>
      <div>
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="text-xs text-slate-600">{sub}</div>
      </div>
    </div>
  );
}

function Pill({ children, tone = 'slate' }) {
  const cls = {
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
  }[tone];
  return <span className={`rounded-full border px-2 py-0.5 ${cls}`}>{children}</span>;
}

function titleCase(s) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}
