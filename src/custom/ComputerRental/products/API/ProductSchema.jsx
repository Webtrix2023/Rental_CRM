export const defaultFormTemplate = {
    product_id: null,
    product_name:null,
    product_description: null,
    purchase_price:null,
    quantity:0,
    unit:null,
    barcode:null,
    product_type:null,
    track_quantity:"no",
    product_serial_no:null,
    processor:null,
    generation:null,
    memory:null,
    hdd_capacity:null,
    screensize:null,
    operating_system:null,
    purchase_date:null,
    model_number: null,
    model_name: null,
    modified_by: null,
    created_by: null,
    created_date: null,
    modified_date: null,
    warranty_up_to:null,
    current_status:'in_inventory',
    asset_condition:'new',
    status: 'active',
};
export const validationRules = {
  product_name: { required: true, maxLength: 100 },
  product_type: { required: true,},
  product_serial_no: { required: true,},
  product_description:{maxLength: 500 },
};
 export const  skipFields=['cover_image','sr_number_req','is_amc','barcode','free_servicing','amc_duration','compare_price','product_object','price'];
export const  filterSkipFields=["cover_image","cat_color",'sr_number_req','is_amc','barcode','free_servicing','amc_duration','compare_price','product_object','price'];
export const defaultColumns = [
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"product_name","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"product_type","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"product_description","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"current_status","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"quantity","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"barcode","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"product_serial_no","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"processor","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"generation","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"memory","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"hdd_capacity","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"screensize","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"operating_system","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"purchase_date","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"model_number","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"model_name","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"created_date","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"created_by","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
];
export const columnLabels = {
        product_name:'Product / Service Name',
        product_description:'Description',
        product_type: 'Product Type',
        quantity: 'Quantity',
        product_serial_no: 'Product Serial No',
        processor: 'Processor',
        generation:'Generation',
        memory :'Memory',
        hdd_capacity:'HDD Capacity',
        screensize: 'Screen Size',
        operating_system: 'Operating System',
        purchase_date:'Purchase Date',
        model_number: 'Model No.',
        model_name: 'Model Name',
        created_date: 'Created Date',
        modified_by:'Modified By',
        modified_date : 'Modified Date',
        asset_condition :'Condition',
        created_by: 'Created By'
      };
export  const fieldOverrides = {
            product_description:{
                type:'editor',
            },
            price:{
                type: 'number',
            },
             gst:{
                type: 'number',
            },
            product_name: {
              type: 'smartSelectInput',
              config:{label: '',type: 'category',source: 'product_names',placeholder: 'Select Product Name',allowAddNew: true,preload: true,cache: true,showRecent: true,getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,}
            },
            product_type: {
              type: 'smartSelectInput',
              config:{label: '',type: 'category',source: 'product_types',placeholder: 'Select Product Type',allowAddNew: true,preload: true,cache: true,showRecent: true,getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,}
            },
            processor: {
              type: 'smartSelectInput',
              config:{label: '',type: 'category',source: 'processor_types',placeholder: 'Select Processer',allowAddNew: true,preload: true,cache: true,showRecent: true,getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,}
            },
              memory: {
              type: 'smartSelectInput',
              config:{label: '',type: 'category',source: 'memory',placeholder: 'Select Memory',allowAddNew: true,preload: true,cache: true,showRecent: true,getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,}
            },
              model_number: {
              type: 'smartSelectInput',
              config:{label: '',type: 'category',source:'model_number',placeholder: 'Select Model Number',allowAddNew: true,preload: true,cache: true,showRecent: true,getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,}
            },

               model_name: {
              type: 'smartSelectInput',
              config:{label: '',type: 'category',source:'model_names',placeholder: 'Select Model Name',allowAddNew: true,preload: true,cache: true,showRecent: true,getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,}
            },
                 generation: {
              type: 'smartSelectInput',
              config:{label: '',type: 'category',source: 'generation_types',placeholder: 'Select Generation',allowAddNew: true,preload: true,cache: true,showRecent: true,getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,}
            },
                 hdd_capacity: {
              type: 'smartSelectInput',
              config:{label: '',type: 'category',source: 'hdd_capacity',placeholder: 'Select HDD Capacity',allowAddNew: true,preload: true,cache: true,showRecent: true,getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,}
            },
                 operating_system: {
              type: 'smartSelectInput',
              config:{label: '',type: 'category',source: 'operating_system',placeholder: 'Select Operating System',allowAddNew: true,preload: true,cache: true,showRecent: true,getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,}
            },
            screensize: {
              type: 'smartSelectInput',
              config:{label: '',type: 'category',source: 'screensizes',placeholder: 'Select Screen Size',allowAddNew: true,preload: true,cache: true,showRecent: true,getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,}
            },
            unit: {
              type: 'smartSelectInput',
              config:{label: '',type: 'category',source:'product_units',placeholder: 'Select Unit',allowAddNew: true,preload: true,cache: true,showRecent: true,getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,}
            },
            purchase_date:{
                type:'date',
                defaultToday: false,
                preventPast: false, // disallow selecting past dates
                preventFuture: true // disallow selecting future dates
                //limitTo: 'month' // 'week' or 'year' also supported
               // preventBefore: '2025-06-10'
                //preventAfter: '2025-12-31'
            },
            warranty_up_to:{
                type:'date',
                defaultToday: false,
                preventPast: true, // disallow selecting past dates
                preventFuture: false // disallow selecting future dates
                //limitTo: 'month' // 'week' or 'year' also supported
               // preventBefore: '2025-06-10'
                //preventAfter: '2025-12-31'
            },
            with_gst: {
              type: 'radio',
              label: 'With TAX?',
              options: [
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' }
                ]
              },
              asset_condition: {
              type: 'dropdown',
              label: 'Condition',
              options: [
                  { value: 'new', label: 'New' },
                  { value: 'refurbished', label: 'Refurbished' },
                  { value: 'used', label: 'Used' },
                  { value: 'open_box', label: 'Open Box'},
                ]
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
  { Field: 'product_id', Type: 'varchar' },
  { Field: 'product_name', Type: 'varchar' },
  { Field: 'product_description', Type: 'editor' },
  { Field: 'product_serial_no', Type: 'varchar' },
  { Field: 'purchase_price', Type: 'float' },
  { Field: 'warranty_up_to', Type: 'date' },
  { Field: 'quantity', Type: 'number' },
  { Field: 'unit', Type: 'smartSelectInput' },
  { Field: 'barcode', Type: 'varchar' },
  { Field: 'product_type', Type: 'smartSelectInput' },
  { Field: 'model_number', Type: 'smartSelectInput' },
  { Field: 'model_name', Type: 'smartSelectInput' },
  { Field: 'processor', Type: 'smartSelectInput' },
  { Field: 'generation', Type: 'smartSelectInput' },
  { Field: 'hdd_capacity', Type: 'smartSelectInput' },
  { Field: 'screensize', Type: 'smartSelectInput' },
  { Field: 'operating_system', Type: 'smartSelectInput' },
  { Field: 'model_name', Type: 'smartSelectInput' },
  { Field: 'model_number', Type: 'smartSelectInput' },
  { Field: 'track_quantity', Type: 'int' },
  { Field: 'modified_by', Type: 'varchar' },
  { Field: 'created_by', Type: 'varchar' },
  { Field: 'created_date', Type: 'date' },
  { Field: 'modified_date', Type: 'date' },
  { Field: 'purchase_date', Type: 'date' },
  { Field: 'memory', Type: 'smartSelectInput' },
  { Field: 'current_status',Type:`ENUM('in_inventory','on_rent','damaged','sold','in_maintenance')` },
  { Field: 'asset_condition',Type:`ENUM('new','refurbished','used','open_box')`},
  { Field: 'status', Type: `ENUM('active','inactive')` }
];
 
export const layout = [
    {
      label: 'Basic Info',
      row: [
        { field: 'product_name',colSize:'w-full mb-3 md:w-1/3' },
        { field: 'product_type' ,colSize:'w-full mb-3 md:w-1/3'},
        { field: 'unit'},
      ]
    },
    {
      row: [
       { field: 'product_serial_no',colSize:'w-full mb-3 md:w-1/3'}, 
       { field: 'model_name',colSize:'w-full mb-3 md:w-1/3' },
        { field: 'model_number'},
      ]
    },
    {
      row: [
        { field: 'generation',colSize:'w-full mb-3 md:w-1/3' },
        { field: 'hdd_capacity' ,colSize:'w-full mb-3 md:w-1/3'},
        { field: 'memory'},
        
      ]
    },
    {
      row: [
        { field: 'operating_system',colSize:'w-full mb-3 md:w-1/3' },
        { field: 'screensize' ,colSize:'w-full mb-3 md:w-1/3'},
        { field: 'processor'},
        
        
      ]
    },
    {
      row: [
        { field: 'purchase_date',colSize:'w-full mb-3 md:w-1/3'},
        { field: 'purchase_price',colSize:'w-full mb-3 md:w-1/3' },
        { field: 'warranty_up_to' },
        
      ]
    },
    {
      row: [
        { field: 'asset_condition',colSize:'w-full mb-3 md:w-1/3'},
      ]
    },
 
    {
      row: [
        { field: 'product_description'}
      ]
    },
 
    {
      row: [
       { addcustomFieldBtn: true },{ customFieldsPlaceholder: true }
      ]
    },
  ];
  export const infoIcons = {
};