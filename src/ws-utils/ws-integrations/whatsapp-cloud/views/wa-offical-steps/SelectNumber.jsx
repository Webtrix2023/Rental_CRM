import React, { useEffect, useState, useMemo } from "react";
import { Button, Input, Select } from "@components/index";
import { API_BASE_URL } from "@config";
import Cookies from "js-cookie";
import { fetchJson } from "@utils/fetchJson";
import { toast } from "react-toastify";

function Loader() {
  return (
    <div className="flex items-center justify-center">
      <div className="rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
    </div>
  );
}

export default function SelectNumber({ wizard, setWizard, saveStep, company_id ,setConfiguration }) {
  return wizard.method === "cloud" ? (
    <CloudSelectNumber wizard={wizard} setWizard={setWizard} saveStep={saveStep} company_id={company_id} setConfiguration={setConfiguration} />
  ) : (
    <VerifyWANumber wizard={wizard} setWizard={setWizard} saveStep={saveStep} company_id={company_id} setConfiguration={setConfiguration} />
  )
}

function VerifyWANumber({ wizard, setWizard, saveStep, company_id, setConfiguration }) {
  const [loading, setLoading] = useState(false);
  const [mobile_no, setMobileNo] = useState( wizard.numberId || '');

  const verifyMobileNo = async () => {
    setLoading(true);
    // 1. Empty check
    if (!mobile_no || mobile_no.trim() === '') {
      toast.error("Please fill registered WhatsApp number.");
      setLoading(false);
      return;
    }

    // 2. Basic phone number validation (E.164 format: +[country][number])
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(mobile_no)) {
      toast.error("Please enter a valid mobile number in E.164 format (e.g. +14155552671).");
      setLoading(false);
      return;
    }

    try {
      // 3. API call
      const res = await fetchJson(`${API_BASE_URL}/whatsapp/twilio/verifyNumber`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_no: mobile_no,
          company_id: company_id,
        }),
      });

      setLoading(false);

      if (res?.flag === "S") {
        console.log('mobile_no : ',mobile_no);
        
        setWizard((w) => ({ ...w, numberId: mobile_no }));
        setConfiguration((w) => ({ 
          ...w,
          config_json:{
            ...w.config_json,
            whatsapp_number : mobile_no
          }
          // is_default : 'Y'
        }));        
        toast.success("Number verified successfully!");
      } else {
        toast.error(`${res.msg || "Verification failed"}`);
      }
    } catch (err) {
      setLoading(false);
      toast.error("Network error while verifying number.");
    }
  };


  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-base font-semibold text-slate-900">Verify WhatsApp Number</div>

        {loading ? (
          <div className="mt-4 text-center text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {wizard.bsp.provider === 'twilio' ? (
              <>
                <div>
                  <label className="text-xs text-slate-600">WhatsApp Number</label>
                  <Input placeholder="+91xxxxxxxxxx" value={wizard.numberId || mobile_no} onChange={(e) => {
                    console.log('val : ',e.target.value);
                    setMobileNo(e.target.value)
                  }} />
                </div>
              </>
            ) : (
              <>
              </>
            )}

            <div className="md:col-span-2">
              <Button
                onClick={() => { verifyMobileNo() }}
                className={`rounded-lg bg-[#2E6FE7] text-white hover:bg-[#2a63cc]`}
                disabled={!mobile_no}
              >
                Validate Number
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function CloudSelectNumber({ wizard, setWizard, saveStep, company_id }) {
  const [numbers, setNumbers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);

  // Registration state
  const [cc, setCc] = useState("+1");
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [method, setMethod] = useState("sms"); // 'sms' | 'voice'
  const [stage, setStage] = useState("idle"); // 'idle' | 'code_sent' | 'verified'
  const [otp, setOtp] = useState("");

  const countryOptions = useMemo(
    () => [
      { value: "+1", label: "+1" },
      { value: "+44", label: "+44" },
      { value: "+91", label: "+91" },
      { value: "+61", label: "+61" },
    ],
    []
  );

  // Fetch existing numbers
  useEffect(() => {
    const fetchNumbers = async () => {
      setLoading(true);
      try {
        const res = await fetchJson(`${API_BASE_URL}/getMobileNumbers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_id: company_id }),
        });
        if (res?.flag === "S") {
          setNumbers(res.data);
          const active = numbers.find(num => num.is_active === "y");
          setSelectedId(active ? active.id : null);
        } else {
          toast.error(res.msg || "Failed to fetch numbers");
        }
      } catch (err) {
        toast.error("Error fetching numbers");
      } finally {
        setLoading(false);
      }
    };
    fetchNumbers();
  }, [company_id]);

  // Keep wizard in sync
  useEffect(() => {
    if (selectedId && selectedId !== wizard.numberId) {
      setWizard((w) => ({ ...w, numberId: selectedId }));
    }
  }, [selectedId, wizard.numberId, setWizard]);

  const handleSetActive = async (numberId) => {
    setLoading(true);
    try {
      const res = await fetchJson(`${API_BASE_URL}/setActivePhoneNumber`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: company_id, selected_id: numberId }),
      });
      if (res?.flag === "S") {
        setSelectedId(numberId);
        toast.success("Active number updated");
        setConfiguration((w) => ({ 
          ...w,
          config_json:{
            ...w.config_json,
            whatsapp_number_id : numberId
          }
        }));  
      } else {
        toast.error(res.msg || "Failed to set active number");
      }
    } catch (err) {
      toast.error("Error setting active number");
    } finally {
      setLoading(false);
    }
  };

  const canSendCode =
    cc.trim() && phone.trim().length >= 6 && displayName.trim().length >= 2 && stage === "idle";

  const handleSendCode = () => {
    if (!canSendCode) return;
    // TODO: call backend to request OTP
    setStage("code_sent");
  };

  const handleVerifyAndRegister = () => {
    if (!otp.trim()) return;
    // TODO: verify via backend, then add to list and select
    const id = `num_${Date.now()}`;
    const pretty = `${cc} ${phone.replace(/(\d{5})(\d{5})/, "$1 $2")}`;
    const newNum = { id, phone: pretty, label: "New", is_active: "y" };

    setNumbers((prev) => [newNum, ...prev]);
    setSelectedId(id);
    setStage("verified");
    toast.success("Number verified & registered");
  };

  return (
    <div className="space-y-5">
      {/* Chips + subheader */}
      <HeaderChip />

      {/* Info banner */}
      <InfoBanner />

      {/* Existing numbers */}
      <ExistingNumbers
        numbers={numbers}
        loading={loading}
        selectedId={selectedId}
        onSelect={handleSetActive}
      />

      {/* Divider */}
      {/* <Divider /> */}

      {/* Add & Register new number */}
      {/* <RegisterNumber
        cc={cc}
        setCc={setCc}
        phone={phone}
        setPhone={setPhone}
        displayName={displayName}
        setDisplayName={setDisplayName}
        method={method}
        setMethod={setMethod}
        stage={stage}
        otp={otp}
        setOtp={setOtp}
        countryOptions={countryOptions}
        canSendCode={canSendCode}
        onSendCode={handleSendCode}
        onVerify={handleVerifyAndRegister}
      /> */}
    </div>
  );
}

/* ---------- Sub Components ---------- */
const HeaderChip = () => (
  <div className="flex items-center gap-2">
    <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
      Cloud API
    </span>
    <span className="text-xs text-slate-500">Choose your WhatsApp number</span>
  </div>
);

const InfoBanner = () => (
  <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-slate-700">
    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/60 text-sky-700">
      i
    </span>
    <div className="text-sm">Numbers must be registered to this WABA before messaging.</div>
  </div>
);

const ExistingNumbers = ({ numbers, loading, selectedId, onSelect }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="mb-2 flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
        📞
      </span>
      <div className="text-sm font-semibold text-slate-900">Existing Numbers</div>
    </div>

    <div className="space-y-2">
      {loading && <Loader />}
      {!loading && numbers.length === 0 && (
        <label className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-3">
          No phone numbers
        </label>
      )}
      {!loading &&
        numbers.map((n) => (
          <label
            key={n.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="waNumber"
                className="h-4 w-4"
                checked={selectedId === n.id || n.is_active === "y"}
                onChange={() => onSelect(n.id)}
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800">
                  +{n.extension} {n.display_phone_number || ""}
                </div>
              </div>
            </div>
            {n.is_active === "y" &&
              <span className="rounded-full bg-green-100 px-5 py-1 text-xs text-green-600">
                {"Active"}
              </span>
            }
          </label>
        ))}
    </div>
  </div>
);

const Divider = () => (
  <div className="relative my-2">
    <div className="h-px w-full bg-slate-200" />
    <span className="absolute left-1/2 top-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-50 px-2 text-xs text-slate-500">
      or
    </span>
  </div>
);

const RegisterNumber = ({
  cc,
  setCc,
  phone,
  setPhone,
  displayName,
  setDisplayName,
  method,
  setMethod,
  stage,
  otp,
  setOtp,
  countryOptions,
  canSendCode,
  onSendCode,
  onVerify,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200">
        ＋
      </span>
      <div className="text-sm font-semibold text-slate-900">Add & Register New Number</div>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Phone number */}
      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-medium text-slate-700">Phone Number</label>
        <div className="flex gap-2">
          <Select value={cc} onChange={setCc} options={countryOptions} />
          <Input placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      {/* Verification method */}
      <div>
        <div className="mb-1 text-xs font-medium text-slate-700">Verification Method</div>
        <div className="space-y-2 rounded-lg border border-slate-200 p-3">
          {["sms", "voice"].map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" name="verifyMethod" value={m} checked={method === m} onChange={() => setMethod(m)} />
              {m.toUpperCase()}
            </label>
          ))}
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

      {/* Verification buttons */}
      <div className="flex items-end">
        {stage === "idle" && (
          <Button
            variant="secondary"
            className="h-11 w-full cursor-pointer rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-60"
            disabled={!canSendCode}
            onClick={onSendCode}
          >
            Send Verification Code
          </Button>
        )}

        {stage === "code_sent" && (
          <div className="flex w-full items-center gap-2">
            <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <Button onClick={onVerify}>Verify & Register</Button>
          </div>
        )}

        {stage === "verified" && (
          <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Number verified & registered. Selected as current sender.
          </div>
        )}
      </div>
    </div>
  </div>
);
