import React, { useState } from 'react';
import { Button, Tabs } from '@components/index';
import ConnectWhatsAppModal from '../views/ConnectWhatsAppModal';
import WhatsAppTrialNumberModal from './WhatsAppTrialNumberModal';
/**
 * WhatsApp Business — Overview (matches provided Figma)
 * - Sticky header (offset top 44px)
 * - Status pill + last event
 * - Tabs: Overview | Connect | Numbers | Templates | Settings | Test | Logs
 * - Two-column body: "What you can do" (left) + "Quick Actions" (right)
 * - Uses only @components + Tailwind
 */

export default function WhatsAppBusinessOverview() {
  const [tab, setTab] = useState('overview');

  // demo stats — replace via API
  const stats = {
    connectedNumbers: 2,
    activeTemplates: 12,
    messagesToday: 247,
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'connect', label: 'Connect' },
    { key: 'numbers', label: 'Numbers' },
    { key: 'templates', label: 'Templates' },
    { key: 'settings', label: 'Settings' },
    { key: 'test', label: 'Test' },
    { key: 'logs', label: 'Logs' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="sticky top-[44px] z-30 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-3">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#E8FCEF] text-[#25D366] font-semibold">WA</div>
              <div>
                <div className="text-[20px] font-semibold text-slate-900 leading-tight">WhatsApp Business</div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <StatusPill status="connected" />
                  <span className="text-slate-500">Last event: Today 12:45 PM IST</span>
                </div>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="mt-4">
            <Tabs value={tab} onChange={setTab} items={tabs} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl mt-8 px-4 py-6">
        {tab === 'overview' && <OverviewPanel stats={stats} />}
        {tab !== 'overview' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            The <span className="font-medium capitalize">{tab}</span> screen will appear here. Hook this tab to your route or wizard.
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewPanel({ stats }) {
   const [openConnect, setOpenConnect] = useState(false);
   const [trialOpen, setTrialOpen] = React.useState(false);
     const handleContinue = (method) => {
    setOpenConnect(false);
    // route into your wizard:
    // method === 'cloud'
    //   ? router.push('/settings/integrations/whatsapp/cloud/connect/step-2')
    //   : router.push('/settings/integrations/whatsapp/bsp/connect/step-2');
  };
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-[#0B3B69]">What you can do</h3>
        <ul className="space-y-3">
          <ChecklistItem>Send approved templates to customers</ChecklistItem>
          <ChecklistItem>Session chat with customers (24h window)</ChecklistItem>
          <ChecklistItem>Track delivery and read receipts</ChecklistItem>
          <ChecklistItem>Handle customer opt-outs automatically</ChecklistItem>
        </ul>

        {/* Trial info note */}
        <div className="mt-6 rounded-xl border border-[#D9E9FF] bg-[#F2F7FF] p-4">
          <div className="mb-1 flex items-center gap-2 text-[#0B3B69]">
            <InfoIcon />
            <span className="text-sm font-semibold">Trial Option Available</span>
          </div>
          <p className="text-sm text-[#0B3B69]">
            <a href="#trial" className="text-[#2E6FE7] underline underline-offset-2">Use Webtrix24 shared number</a> for testing before connecting your own.
          </p>
        </div>
      </div>

      {/* Right card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-[#0B3B69]">Quick Actions</h3>
        <div className="flex flex-col gap-3">
          <Button className="h-11 w-full rounded-lg bg-[#FF5C0A] text-white hover:bg-[#e65309]" onClick={() => setOpenConnect(true)}>
            Connect Your Number
          </Button>
          <ConnectWhatsAppModal
              open={openConnect}
              onClose={() => setOpenConnect(false)}
              onDone={(state) => {
                // Persist & navigate if needed
                // e.g., POST /api/wa/setup with `state`
                setOpenConnect(false);
              }}
            />
          <Button
  className="h-11 w-full rounded-lg bg-[#0B2C59] text-white"
  onClick={() => setTrialOpen(true)}
>
  Use Webtrix24 Trial Number
</Button>

<WhatsAppTrialNumberModal
  open={trialOpen}
  onClose={() => setTrialOpen(false)}
  onConnectOwnNumber={() => {
    setTrialOpen(false);
    // open your “Connect WhatsApp” wizard modal here
    setOpenConnect(true);
  }}
/>

           
        </div>

        {/* KPIs */}
        <div className="mt-4 space-y-3">
          <StatRow label="Connected Numbers" value={stats.connectedNumbers} />
          <StatRow label="Active Templates" value={stats.activeTemplates} />
          <StatRow label="Messages Sent Today" value={stats.messagesToday} />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const isConnected = status === 'connected';
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${
      isConnected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700'
    }`}>
      <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {isConnected ? 'Connected' : 'Not connected'}
    </span>
  );
}

function ChecklistItem({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </span>
      <span className="text-slate-700">{children}</span>
    </li>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
      <div className="text-sm text-slate-700">{label}</div>
      <div className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm">{value}</div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12" y2="8"></line>
    </svg>
  );
}
