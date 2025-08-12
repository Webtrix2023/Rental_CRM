export const defaultFormTemplate = {
      id: null,
      charger_serial_no: null,
      modified_by:null,
      created_date:null,
      modified_date:null,
      cat_color: null,
      parent_id:null,
      status: 'active',
};
export const validationRules = {
  charger_serial_no: { required: true, maxLength: 100 },
};
export const defaultColumns = [
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"id","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
  {"fieldID":"","fieldLabel":"","fieldType":"varchar(200)","column_name":"charger_serial_no","linkedWith":"","fieldOptions":"","dateFormat":"","displayFormat":"","parentCategory":""},
];
export const columnLabels = {
  id: 'Sr. No.',
  };

export const  skipFields=[];
export const  filterSkipFields=[];
export  const fieldOverrides = {};
export const directSchemaTemplate = [
  { Field: 'id', Type: 'int' },
  { Field: 'charger_serial_no', Type: 'varchar' },
  { Field: 'modified_by', Type: 'int' },
  { Field: 'created_by', Type: 'smartSelectInput' },
  { Field: 'created_date', Type: 'date' },
  { Field: 'modified_date', Type: 'date' },
];
export const layout = [
    {
      label: 'Basic Info',
      row: [
      { field: 'charger_serial_no'},
      ]
    },
  ];
  export const infoIcons = {
  };