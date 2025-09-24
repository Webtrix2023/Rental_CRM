export const defaultFormTemplate = {
    invoiceID: null,
      invoiceNumber: null,
      customer_id:null,
      processingMonth: null,
      processingYear: null,
      reportMonth: null,
      reportYear: null,
      record_type:"quotation",
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
      state_id: null,
      company_state_id: null,
      sgst: "no",
      cgst: "no",
      igst: "no",
      isInterGst: 'no',
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
    terms_of_quotation:null,
    is_replacement:"n",
    status:"draft",
};
export const validationRules = {
};

export const defaultColumns = [
    {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"invoiceID","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
    {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"invoiceNumber","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
    {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"customer_id","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  
  
];
export const columnLabels = {
        invoiceID:'Sr. no.',
        customer_id:'Customer',
        invoiceNumber:'Quotation No.',
        invoiceTotal:'Quotation Amount',
        invoiceDate:"Quotation Date",
        project_id:"Project name",
        grossAmount:"Gross Amount",
        ref_note:"Reference Note",
        dispatch_doc_no:"Dispatch Doc. No.",
        supplier_ref:"Supplier Reference",
      };
export const  skipFields=['state_id','record_type','related_to','paymentTerms','project_id','adminID','company_id','customer_name','customer_address','customer_state','valid_until_date','is_shipping','stateGstPercent','interGstPercent','centralGstPercent','stateGstAmount','interGstAmount','centralGstAmount','roundOff','is_close','is_gst_billing','is_reminder_send','customer_s_mobile','customer_s_address','ship_to','reminder_send_date','shipping_address','show_on_pdf','terms','isEdit','pending_amount','payment_date','additional_char','payment_status','receipts_details','receipts_details','customer_mobile','customer_address','customer_gst','gst_state_code','po_number','po_date','ref_quot_no','mode_or_terms_of_payment'];
export const  filterSkipFields=['state_id','record_type','related_to','paymentTerms','customer_name','customer_address','project_id','adminID','customer_state','company_id','valid_until_date','is_shipping','stateGstPercent','interGstPercent','centralGstPercent','stateGstAmount','interGstAmount','centralGstAmount','roundOff','is_close','is_gst_billing','is_reminder_send','customer_s_mobile','customer_s_address','ship_to','reminder_send_date','shipping_address','show_on_pdf','terms','isEdit','pending_amount','payment_date','additional_char','payment_status','receipts_details','receipts_details','customer_mobile','customer_address','customer_gst','gst_state_code','po_number','po_date','ref_quot_no','mode_or_terms_of_payment'];
export  const fieldOverrides = {
        is_replacement:{
              type: 'radio',
              label: 'Is Replacement',
              options: [
                  { value: 'y', label: 'Yes' },
                  { value: 'n', label: 'No' }
                ]
              },
          };
export const directSchemaTemplate = [
{ Field: 'customer_id',Type: 'smartSelectInput' },
{ Field: 'invoiceDate',Type: 'date' },
{ Field: 'invoiceTotal',Type: 'float' },
{ Field: 'buyers_order_no',Type: 'varchar' },
{ Field: 'destination',Type: 'varchar' },
{ Field: 'dispatch_doc_no',Type: 'varchar' },
{ Field: 'dispatch_date',Type: 'date' },
{ Field: 'dispatch_through',Type: 'varchar' },
{ Field: 'order_date',Type: 'date' },
{ Field: 'mode_or_terms_of_payment',Type: 'varchar' },
{ Field: 'other_reference',Type: 'varchar' },
{ Field: 'ref_note',Type: 'varchar' },
{ Field: 'supplier_ref',Type: 'varchar' },
{ Field: 'terms_of_quotation',Type: 'varchar' },
{ Field: 'is_replacement',Type:"ENUM('y','n')" },
{ Field: 'customer_name',Type: 'varchar' },
{ Field: 'customer_address',Type: 'varchar' },
{ Field: 'customer_gst',Type: 'varchar' },
{ Field: 'customer_mobile',Type: 'varchar' },
{ Field: 'customer_state',Type: 'int' },
{ Field: 'customer_s_address',Type: 'varchar' },
  { Field: 'status', Type: "enum('draft', 'approved', 'cancel')" },
  { Field: 'modified_by', Type: 'smartSelectInput' },
  { Field: 'created_by', Type: 'smartSelectInput' },
  { Field: 'created_date', Type: 'date' },
  { Field: 'modified_date', Type: 'date' },
];


export const staticJoined = [
        {
          field: 'customer_id',
          fieldtype: 'customer',
          joinedTable: 'customer',
          select: 'customer_id,name',
          primaryKey: 'customer_id',
          slug: ''
        },
      ];
 export const layout = [
  ];
  export const infoIcons = {
  status: { show: true, text: 'Select how often this task should repeat. Useful for automating follow-ups, reports, or routine actions.' },
};