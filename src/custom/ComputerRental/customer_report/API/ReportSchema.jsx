// Common fields (can be reused/shared)
const defaultCommonFields = {
  product_id: null,
  customer_id: null,
  action: null,
  invoice_id: null,
  itemID: null,
  reason: null,
  gr_no: null,
};

// Return Action Model
export const defaultReturnModel = {
  ...defaultCommonFields,
  remark: null,
  return_date: new Date().toISOString().substring(0, 10),
  charger_return: null,
};

// Upgrade Action Model
export const defaultUpgradeModel = {
  ...defaultCommonFields,
  upgrade_date: new Date().toISOString().substring(0, 10),
  upgrade_charges: null,
  upgrade_type: null,
  charges_apply_from: 'this_month',
  
  screensize: null,
  operating_system: null,
  memory: null,
  hdd_capacity: null,
  
  old_screensize: null,
  old_operating_system: null,
  old_memory: null,
  old_hdd_capacity: null,
};

// Replace Action Model
export const defaultReplaceModel = {
  ...defaultCommonFields,
  replaced_row_id: null,
  replace_date: new Date().toISOString().substring(0, 10),
};
