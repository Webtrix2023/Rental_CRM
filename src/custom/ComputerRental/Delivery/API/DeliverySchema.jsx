export const defaultFormTemplate = {
    invoiceID: null,
      invoiceNumber: null,
      customer_id:null,
      processingMonth: null,
      processingYear: null,
      reportMonth: null,
      reportYear: null,
      record_type:"delivery",
      traineeCount: null,
      company_id: null,
      invoiceDate: null,
      paymentTerms: null,
      invoiceTotal: null,
      stateGstPercent: null,
      interGstPercent: null,
      centralGstPercent: null,
      stateGstAmount: null,
      interGstAmount: null,
      centralGstAmount: null,
      roundOff: null,
      grossAmount: null,
      narrList: null,
      isEdit: 'yes',
      companyList: null,
      invoiceLine: null,
        sgst: "no",
        cgst: "no",
        igst: "no",
      buyers_order_no: null,
    destination: null,
    dispatch_doc_no: null,
    dispatch_date:null,
    dispatch_through: null,
    order_date:null,
    mode_or_terms_of_payment:null,
    other_reference: null,
    ref_note:null,
    supplier_ref:null,
    terms_of_delivery:null,
    is_replacement:"n",
    status:"draft",
};
export const validationRules = {
  product_name: { required: true, maxLength: 100 },
  product_type: { required: true,},
};

export const defaultColumns = [
    {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"invoiceID","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
    {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"invoiceNumber","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
    {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"customer_id","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  
  
];
export const columnLabels = {
        invoiceID:'Sr. no.',
        customer_id:'Customer ID',
        invoiceNumber:'Delivery Challan No.',
        invoiceTotal:'Delivery Amount',
        invoiceDate:"Delivery Date",
        project_id:"Project name",
        grossAmount:"Gross Amount",
      };

export const  skipFields=['state_id','record_type','related_to','paymentTerms','project_id','adminID','company_id','customer_id','valid_until_date','is_shipping','stateGstPercent','interGstPercent','centralGstPercent','stateGstAmount','interGstAmount','centralGstAmount','roundOff','is_close','is_gst_billing','is_reminder_send','customer_s_mobile','customer_s_address','ship_to','reminder_send_date','shipping_address','show_on_pdf','terms','isEdit','pending_amount','payment_date','additional_char','payment_status','receipts_details','receipts_details'];
export const  filterSkipFields=['state_id','record_type','related_to','paymentTerms','project_id','adminID','company_id','customer_id','valid_until_date','is_shipping','stateGstPercent','interGstPercent','centralGstPercent','stateGstAmount','interGstAmount','centralGstAmount','roundOff','is_close','is_gst_billing','is_reminder_send','customer_s_mobile','customer_s_address','ship_to','reminder_send_date','shipping_address','show_on_pdf','terms','isEdit','pending_amount','payment_date','additional_char','payment_status','receipts_details','receipts_details'];
export  const fieldOverrides = {
          };
export const directSchemaTemplate = [
  { Field: 'modified_by', Type: 'varchar' },
  { Field: 'created_date', Type: 'date' },
  { Field: 'modified_date', Type: 'date' },
  { Field: 'status', Type: 'radio' }
];

 export const layout = [
  ];
  export const infoIcons = {
  status: { show: true, text: 'Select how often this task should repeat. Useful for automating follow-ups, reports, or routine actions.' },
};