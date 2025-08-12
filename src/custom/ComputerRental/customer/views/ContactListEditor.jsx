import React, { useState } from "react";
import { ControlledPhoneInput } from "@components/index";

// Contact fields (excluding phone, WhatsApp, handled specially)
const CONTACT_FIELDS = [
  { name: "contact_person_name", label: "Contact Person Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "contact_type", label: "Contact Type", type: "select", options: ["personal","work","other"] },
  { name: "contact_type_other", label: "Contact Type Other", type: "text" },
];

export default function ContactListEditor({ value, onChange }) {
  const [contacts, setContacts] = useState(() => {
    try {
      if (value) {
        const obj = typeof value === "string" ? JSON.parse(value) : value;
        return Object.entries(obj).map(([k, v]) => ({ ...v, _key: k }));
      }
    } catch { }
    return [{
      _key: "contact_1",
      contact_person_name: "",
      country_code: "91",
      wa_country_code: "91",
      mobile_no: "",
      Whatsapp_no: "",
      email: "",
      contact_type: "personal",
      contact_type_other: "",
      is_primary: true,
    }];
  });

  // Always keep primary at top
  const sortContacts = arr => [...arr].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

  // Update parent as JSON
  const pushToParent = arr => {
    const toObj = {};
    arr.forEach((c, idx) => {
      const out = { ...c };
      delete out._key;
      toObj[`contact_${idx + 1}`] = out;
    });
    onChange && onChange(JSON.stringify(toObj));
  };

  // Add new contact
  const addContact = () => {
    const newContact = {
      _key: "contact_" + (contacts.length + 1),
      contact_person_name: "",
      country_code: "91",
      wa_country_code: "91",
      mobile_no: "",
      Whatsapp_no: "",
      email: "",
      contact_type: "personal",
      contact_type_other: "",
      is_primary: false,
    };
    const newContacts = sortContacts([...contacts, newContact]);
    setContacts(newContacts);
    pushToParent(newContacts);
  };

  // Update a contact field
  const updateContact = (idx, field, val) => {
    let newContacts = contacts.map((c, i) =>
      i === idx ? { ...c, [field]: field === "is_primary" ? val : val } : c
    );
    // Primary handling
    if (field === "is_primary" && val) {
      newContacts = newContacts.map((c, i) => ({ ...c, is_primary: i === idx }));
    }
    newContacts = sortContacts(newContacts);
    setContacts(newContacts);
    pushToParent(newContacts);
  };

  // Remove contact
  const removeContact = idx => {
    let newContacts = contacts.filter((c, i) => i !== idx);
    // Ensure at least one primary
    if (newContacts.length && !newContacts.some(c => c.is_primary)) newContacts[0].is_primary = true;
    setContacts(sortContacts(newContacts));
    pushToParent(sortContacts(newContacts));
  };

  return (
    <div>
      {contacts.map((contact, idx) => (
        <div key={contact._key} className="mb-5 bg-transparent relative px-0">
          {/* Primary badge on top */}
          <div className="flex items-center mb-1">
            {contact.is_primary && (
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-semibold mr-2">Primary</span>
            )}
            <button
              type="button"
              onClick={() => updateContact(idx, "is_primary", true)}
              disabled={contact.is_primary}
              className={`ml-2 text-xs px-2 py-0.5 rounded border ${contact.is_primary ? "border-gray-300 text-gray-400" : "border-blue-300 text-blue-700 hover:bg-blue-50"}`}
            >
              {contact.is_primary ? "Primary Contact" : "Make Primary"}
            </button>
            {contacts.length > 1 && (
              <button
                type="button"
                onClick={() => removeContact(idx)}
                className="ml-2 text-xs px-2 py-0.5 border border-red-200 rounded text-red-500 hover:bg-red-50"
                title="Remove contact"
              >Remove</button>
            )}
          </div>
          {/* Two rows layout */}
          <div className="grid grid-cols-4 md:grid-cols-4 gap-x-6 gap-y-1 mb-2">
            {/* Row 1: Name, Email */}
            <div>
              <label className="text-xs font-regular mb-0.5 text-gray-700 flex items-center gap-1">Contact Person Name</label>
              <input
                type="text"
                className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded-none focus:outline-none text-sm px-3 py-2 pr-1"
                value={contact.contact_person_name || ""}
                onChange={e => updateContact(idx, "contact_person_name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-regular mb-0.5 text-gray-700 flex items-center gap-1">Email</label>
              <input
                type="email"
                className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded-none focus:outline-none text-sm px-3 py-2 pr-1"
                value={contact.email || ""}
                onChange={e => updateContact(idx, "email", e.target.value)}
              />
            </div>
            {/* Row 2: Phone, WhatsApp (country code + number side by side) */}
            <div className="flex gap-2 items-end">
              <div className="w-full">
                <label className="text-xs font-regular mb-0.5 text-gray-700 flex items-center gap-1">Phone Number</label>
                <ControlledPhoneInput
                    label=""
                    country="in"
                    value={contact.country_code && contact.mobile_no ? `${contact.country_code}${contact.mobile_no}` : contact.country_code || "+91"}
                    onChange={(val, countryData) => {
                        console.log(val);
                        updateContact(idx,"mobile_no",val);
                        updateContact(idx,"country_code","+",countryData.dialCode);
                    }}
                    />
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <div>
                <label className="text-xs font-regular mb-0.5 text-gray-700 flex items-center gap-1">WhatsApp Number</label>
                <ControlledPhoneInput
                    label=""
                    country="in"
                    value={contact.wa_country_code && contact.Whatsapp_no ? `${contact.wa_country_code}${contact.Whatsapp_no}` : contact.wa_country_code || "+91"}
                    onChange={(val, countryData) => {
                        updateContact(idx,"Whatsapp_no",val);
                        updateContact(idx,"wa_country_code","+",countryData.dialCode);
                    }}
                    />
                </div>
            </div>
            {/* Row 3: Contact type, contact type other */}
            <div>
              <label className="text-xs font-regular mb-0.5 text-gray-700 flex items-center gap-1">Contact Type</label>
              <select
                className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded-none focus:outline-none text-sm px-3 py-2 pr-1"
                value={contact.contact_type || "personal"}
                onChange={e => updateContact(idx, "contact_type", e.target.value)}>
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            {contact.contact_type === "other" && (
              <div>
                <label className="text-xs font-regular mb-0.5 text-gray-700 flex items-center gap-1">Contact Type Other</label>
                <input
                  type="text"
                  className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded-none focus:outline-none text-sm px-3 py-2 pr-1"
                  value={contact.contact_type_other || ""}
                  onChange={e => updateContact(idx, "contact_type_other", e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="bg-blue-600 text-white rounded-md px-4 py-2 mt-2 text-sm shadow hover:bg-blue-700"
        onClick={addContact}
      >
        + Add Contact
      </button>
    </div>
  );
}
