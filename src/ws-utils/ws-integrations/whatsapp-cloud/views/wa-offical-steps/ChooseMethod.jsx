import React from 'react';
import { Button } from '@components/index';
import { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import { fetchJson } from "@utils/fetchJson";
import { API_BASE_URL, APP_ID } from "@config";


const ChooseMethod = ({ wizard, setWizard, setConfiguration }) => {
    const select = (m) => setWizard((w) => ({ ...w, method: m }));
    const selected = wizard.method;
    const [settings, setSettings] = useState([]);
    const [defaultProvider, setDefaultProvider] = useState(null);

    const isActive = (provider) => settings.some(s => s.provider === provider && s.status === 'active');
    const isDefault = (provider) => settings.some(s => s.provider === provider && s.is_default === 'Y');
    const getSettingByProvider = (provider) => settings.find(s => s.provider === provider);
    const updateDefault = async () => {
        try {
            const res = await fetchJson(`${API_BASE_URL}/integration/setDefaultWAProvider`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company_id: 1, provider: defaultProvider }),
            });
            if (res?.flag === "S") {
                toast.success("Default provider updated!");
            } else {
                toast.error(res.msg || "Failed to update default provider");
            }
        } catch (err) {
            console.log(err);
            toast.error("Error updating default provider");
        }
    };
    const fetchWhatsAppSettings = async () => {
        try {
            const res = await fetchJson(`${API_BASE_URL}/integration/getWASettings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company_id: 1 }),
            });
            if (res?.flag === "S") {
                setSettings(res.data);
            } else {
                toast.error(res.msg || "Failed to fetch Settings");
            }
        } catch (err) {
            console.log(err);
            toast.error("Error fetching settings");
        }
    };
    const setSelectedConfig = (provider) => {
        if (isActive(provider)) {
            const settings = getSettingByProvider(provider);
            if (settings) {
                setConfiguration(
                    {
                        'provider': settings.provider || null,
                        'config_json': settings.config_json ? JSON.parse(settings.config_json) : {},
                        'is_default': settings.is_default || 'N',
                        'status': settings.status || 'inactive',
                    }
                );
            }
            console.log(settings);
        } else {
            setConfiguration(
                {
                    'provider': provider,
                    'config_json': {},
                    'is_default': 'N',
                    'status': 'inactive',
                }
            );
        }
    }

    useEffect(() => {
        fetchWhatsAppSettings();
    }, []);

    useEffect(() => {
        if (!defaultProvider) return;
        const updateDefaultProvider = async () => {
            await updateDefault();
            fetchWhatsAppSettings(); // refresh settings after update
        };
        updateDefaultProvider();
    }, [defaultProvider]);

    return (
        <div>
            <p className="text-sm text-slate-600">Select how you want to connect your WhatsApp number</p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <MethodCard
                    selected={!isActive('meta') && selected === 'cloud'}
                    onSelect={() => {
                        select('cloud');
                        setSelectedConfig('meta');
                    }
                    }
                    disabled={isActive('meta')}
                    title={<>Meta <br className="hidden md:block" /> WhatsApp Cloud API</>}
                    badge="Recommended"
                    bullets={['Free tier available', 'Full control over templates', 'Direct from Meta']}
                    meta={[{ k: 'Ownership:', v: 'You own WABA' }, { k: 'Billing:', v: 'Direct to Meta' }, { k: 'Setup:', v: 'Medium', vClass: 'text-amber-600' }]}
                    isDefault={isDefault('meta')}
                    isConnected={isActive('meta')}
                    onSetDefault={() => setDefaultProvider('meta')}
                />
                <MethodCard
                    selected={!isActive('twilio') && selected === 'bsp'}
                    onSelect={() => {
                        select('bsp')
                        setSelectedConfig('twilio');
                    }
                    }
                    disabled={isActive('twilio')}
                    title="Twilio"
                    subtitle="Use your provider’s credentials"
                    bullets={['Managed service', 'Additional features', 'Support included']}
                    meta={[{ k: 'Ownership:', v: 'Provider owns' }, { k: 'Billing:', v: 'Through provider' }, { k: 'Setup:', v: 'Easy', vClass: 'text-emerald-600' }]}
                    isDefault={isDefault('twilio')}
                    isConnected={isActive('twilio')}
                    onSetDefault={() => setDefaultProvider('twilio')}
                />
            </div>
        </div>
    );
};


function MethodCard({ selected, onSelect, title, subtitle, bullets, badge, meta, isDefault, onSetDefault, isConnected, disabled }) {
    return (
        <button
            disabled={disabled}
            type="button"
            onClick={() => onSelect()}
            className={`h-full w-full rounded-2xl border p-4 text-left transition
                ${selected ? 'border-[#2E6FE7] ring-2 ring-[#2E6FE7]/30' : 'border-slate-200 hover:border-slate-300'}`}
        >
            <div className="flex items-start justify-between">
                <div className='flex-1'>
                    <div className="text-lg font-semibold text-[#0B3B69] w-full">{title}</div>
                    {subtitle && <div className="text-sm text-slate-600">{subtitle}</div>}
                </div>
                <div className="flex items-center gap-2">
                    {/* Default Checkbox */}
                    {!isDefault && <label className="flex items-center gap-1 text-sm font-medium text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            onClick={onSetDefault}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        Make Default
                    </label>}
                    {isDefault && (
                        <span className="inline-flex text-xs items-center px-3 py-1 rounded-xl text-sm font-medium bg-blue-50 text-blue-600 border border-blue-400">
                            Default
                        </span>
                    )}
                    {isConnected && (
                        <span className="inline-flex text-xs items-center px-3 py-1 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-600 border border-emerald-400">
                            Connected
                        </span>
                    )}
                </div>
            </div>

            <ul className="mt-4 space-y-2">
                {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </span>
                        {b}
                    </li>
                ))}
            </ul>

            <div className="mt-4 grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-sm">
                {meta.map((m, i) => (
                    <React.Fragment key={i}>
                        <div className="text-slate-500">{m.k}</div>
                        <div className={`font-medium text-slate-800 ${m.vClass || ''}`}>{m.v}</div>
                    </React.Fragment>
                ))}
            </div>
        </button>
    );
}

export default ChooseMethod; 