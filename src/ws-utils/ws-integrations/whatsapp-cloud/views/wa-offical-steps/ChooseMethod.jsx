import React from 'react';
import { Button } from '@components/index';


const ChooseMethod = ({ wizard, setWizard , setIntegrationType}) => {
    const select = (m) => setWizard((w) => ({ ...w, method: m }));
    const selected = wizard.method;

    return (
        <div>
            <p className="text-sm text-slate-600">Select how you want to connect your WhatsApp number</p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <MethodCard
                    selected={selected === 'cloud'}
                    onSelect={() => { select('cloud');}}
                    title={<>Meta <br className="hidden md:block" /> WhatsApp <br className="hidden md:block" /> Cloud API</>}
                    badge="Recommended"
                    bullets={['Free tier available', 'Full control over templates', 'Direct from Meta']}
                    meta={[{ k: 'Ownership:', v: 'You own WABA' }, { k: 'Billing:', v: 'Direct to Meta' }, { k: 'Setup:', v: 'Medium', vClass: 'text-amber-600' }]}
                />
                <MethodCard
                    selected={selected === 'bsp'}
                    onSelect={() => {select('bsp')}}
                    title="Twilio"
                    subtitle="Use your provider’s credentials"
                    bullets={['Managed service', 'Additional features', 'Support included']}
                    meta={[{ k: 'Ownership:', v: 'Provider owns' }, { k: 'Billing:', v: 'Through provider' }, { k: 'Setup:', v: 'Easy', vClass: 'text-emerald-600' }]}
                />
            </div>
            {/* Trial banner */}
            <div className="mt-5 rounded-xl border border-[#D9E9FF] bg-[#F2F7FF] p-4">
                <div className="mb-1 text-sm font-semibold text-[#0B3B69]">Try with CRM Ease test number first</div>
                <p className="text-sm text-[#0B3B69]">Perfect for testing before connecting your own number. Limited to 50 messages per day. <a className="text-[#2E6FE7] underline underline-offset-2" href="#">Learn more about test number</a></p>
            </div>
        </div>
    );
}


function MethodCard({ selected, onSelect, title, subtitle, bullets, badge, meta }) {
    
    return (
        <button type="button" onClick={onSelect} className={`h-full rounded-2xl border p-4 text-left transition ${selected ? 'border-[#2E6FE7] ring-2 ring-[#2E6FE7]/30' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-lg font-semibold text-[#0B3B69]">{title}</div>
                    {subtitle && <div className="text-sm text-slate-600">{subtitle}</div>}
                </div>
                {badge && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{badge}</span>}
            </div>
            <ul className="mt-4 space-y-2">
                {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                        </span>
                        {b}
                    </li>
                ))}
            </ul>
            <div className="mt-4 grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-sm">
                {meta.map((m, i) => (<React.Fragment key={i}><div className="text-slate-500">{m.k}</div><div className={`font-medium text-slate-800 ${m.vClass || ''}`}>{m.v}</div></React.Fragment>))}
            </div>
        </button>
    );
}

export default ChooseMethod; 