export const defaultFormTemplate = {
      customer_id: null,
      salutation: null,
      first_name: null,
      name:null,
      record_type:"individual",
      middle_name: null,
      last_name: null,
      mobile_no: null,
      wa_number:null,
      birth_date: null,
      note: null,
      email: null,
      address: null,
      customer_image: null,
      billing_name: null,
      billing_address: null,
      branch_id: null,
      gst_no: null,
      adhar_number: null,
      website: null,
      countryCode:null,
      country: null,
      state: null,
      city:null,
      latitude: null,
      longitude: null,
      zipcode: null,
      assignee: null,
      assigneeName: null,
      office_land_line: null,
      stages: null,
      lead_source: null,
      gst_state: null,
      lead_priority: null,
      type: 'customer',
      status: 'active',
      pan_number:null,
      additional_contacts:'',
      preferred_communication:'email',
};
export const validationRules = {
  name: { required: true, maxLength: 100 },
  email:{type: { value: 'email', message: 'Please enter a valid email address.' },},
  pan_number:{ pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invaild PAN Number.' }},
  gst_no:{ pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invaild GST Number.' }},
  adhar_number:{ pattern: { value: /^[2-9]{1}[0-9]{11}$/, message: 'Invaild Aadhar Number.' }},
  
};
 
export const  skipFields=['password','assigneename','user_name','is_password_update','salutation','stages','birth_date','type','mailing_address','lead_priority','latitude','longitude','last_activity_date','last_activity_type','office_land_line','preferred_communication','contact_type','additional_contacts','customer_image','company_name','country','follow_up_date','state','city','branch_id','country_code','remark','one_drive_folder','customer_portal_access','company_id','record_type'];
export const  filterSkipFields=['customer_id','first_name','middle_name','last_name','password','assigneename','user_name','is_password_update','salutation','stages','birth_date','type','mailing_address','lead_priority','latitude','longitude','last_activity_date','last_activity_type','office_land_line','preferred_communication','contact_type','additional_contacts','customer_image','company_name','country','follow_up_date','state','city','branch_id','country_code','remark','one_drive_folder','customer_portal_access','company_id','record_type','note','address','countryCode','assigneeName'];

export const defaultColumns = [
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"customer_id","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
 
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"name","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
 
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"email","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
 
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"mobile_no","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
];
export const columnLabels = {
  customer_id: 'Customer ID',
  email: 'Customer Email',
  company_id: 'Company Name',
  project_id: 'Project',
  name: 'Customer Name',
  wa_number:'Whatsapp Number',
  lead_source:"Source",
  gst_no:"GST No.",
  gst_state:"GST State",
  pan_number:"PAN No.",
 };
export  const fieldOverrides = {
            lead_source: {
              type: 'smartSelectInput',
              config:{label: '',type: 'category',source: 'lead_source',placeholder: 'Source',allowAddNew: true,preload: true,cache: true,showRecent: true,getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,}
            },
            assignee: {
              type: 'smartSelectInput',
              config: { label: '',type: 'users',
                source: 'admin',
                valueKey:'adminID',
                placeholder: 'Select Assignee',
                check: 'name',
                getLabel: (item) => `${item.name}`,
                getValue: (item) => item.adminID,
                allowAddNew:false,preload: true,cache: true,showRecent: true,multi:false,
                list: 'name,adminID'
              }
            },
            gst_state: {
              type: 'smartSelectInput',
              config: { label: '',type: 'State',
                source: 'states',
                valueKey:'state_id',
                placeholder: 'Select GST State',
                check: 'state_name',
                getLabel: (item) => `${item.gst_state_code?item.gst_state_code:''}-${item.state_name}`,
                getValue: (item) => item.state_id,
                allowAddNew:false,preload: true,cache: true,showRecent: true,multi:false,
                list: 'state_name,state_id,gst_state_code'
              }
            },
            status: {
              type: 'radio',
              label: 'Status',
              options: [
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'In Active' }
                ]
              },
          };
export const directSchemaTemplate = [
  { Field: 'customer_id', Type: 'int' },
  { Field: 'salutation', Type: 'enum' },
  { Field: 'name', Type: 'varchar' },
  { Field: 'first_name', Type: 'varchar' },
  { Field: 'middle_name', Type: 'varchar' },
  { Field: 'last_name', Type: 'varchar' },
  { Field: 'mobile_no', Type: 'varchar' },
  { Field: 'wa_number', Type: 'varchar' },
  { Field: 'birth_date', Type: 'date' },
  { Field: 'note', Type: 'varchar' },
  { Field: 'email', Type: 'email' },
  { Field: 'record_type', Type: 'enum' },
  { Field: 'address', Type: 'varchar' },
  { Field: 'customer_image', Type: 'varchar' },
  { Field: 'billing_name', Type: 'varchar' },
  { Field: 'billing_address', Type: 'varchar' },
  { Field: 'branch_id', Type: 'int' },
  { Field: 'gst_no', Type: 'varchar' },
  { Field: 'adhar_number', Type: 'varchar' },
  { Field: 'website', Type: 'varchar' },
  { Field: 'countryCode', Type: 'varchar' },
  { Field: 'country', Type: 'varchar' },
  { Field: 'state', Type: 'varchar' },
  { Field: 'city', Type: 'varchar' },
  { Field: 'latitude', Type: 'varchar' },
  { Field: 'longitude', Type: 'varchar' },
  { Field: 'zipcode', Type: 'varchar' },
  { Field: 'assignee', Type: 'int' },
  { Field: 'assigneeName', Type: 'varchar' },
  { Field: 'office_land_line', Type: 'varchar' },
  { Field: 'stages', Type: 'int' },
  { Field: 'lead_source', Type: 'int' },
  { Field: 'gst_state', Type: 'int' },
  { Field: 'lead_priority', Type: 'int' },
  { Field: 'type', Type: 'int' },
  { Field: 'status', Type: 'enum' },
  { Field: 'pan_number', Type: 'varchar' },
  { Field: 'additional_contacts', Type: 'varchar' },
  { Field: 'preferred_communication', Type: 'varchar' },
];
export const layout = [
    {
      label: 'Basic Info',
      row: [
     { field: 'name',colSize:'w-full mb-3 md:w-1/3' },
     { field: 'assignee' ,colSize:'w-full mb-3 md:w-1/3'},
     { field: 'lead_source'},
      ]
    },
    {
      row: [
        { field: 'email',colSize:'w-full mb-3 md:w-1/3'},
        { custom: 'mobile_no' ,colSize:'w-full mb-3 md:w-1/3'},
        { custom: 'wa_number'},
      ]
    },
      {
      row: [
      { field: 'billing_name',colSize:'w-full mb-3 md:w-1/3' },
      { field: 'billing_address',colSize:'w-full mb-3 md:w-1/3' },
      { field: 'zipcode'},
      
       
      ]
    },
     {
      row: [
       { field: 'adhar_number',colSize:'w-full mb-3 md:w-1/3' },
       { field: 'pan_number',colSize:'w-full mb-3 md:w-1/3'}, 
       { field: 'website'},
       
        // { field: 'mailing_address' ,colSize:'w-full mb-3 md:w-1/3'},
      ]
    },
    {
      row: [
        { field: 'gst_no',colSize:'w-full mb-3 md:w-1/3' },
        { field: 'gst_state',colSize:'w-full mb-3 md:w-1/3' },
        // { field: 'mailing_address' ,colSize:'w-full mb-3 md:w-1/3'},
      ]
    },
    
     {
      row: [
       { custom:'additional_contacts'},
      ]
    },
    // {
    //   row: [
    //     { field: 'zipcode',colSize:'w-full mb-3 md:w-1/3'},
    //   ]
    // },
    {
      row: [
       { addcustomFieldBtn: true },{ customFieldsPlaceholder: true }
      ]
    },
  ];
  export const infoIcons = {
  //status: { show: true, text: 'Select how often this task should repeat. Useful for automating follow-ups, reports, or routine actions.' },
  //due_date: { show: true, text: 'Select the final deadline for this task.' },
  // ...
};