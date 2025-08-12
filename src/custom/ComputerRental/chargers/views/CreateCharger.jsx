import React, { useEffect, useState, useMemo } from 'react';
import {
  defaultFormTemplate,
  directSchemaTemplate,
  columnLabels,
  fieldOverrides,
  validationRules,
  skipFields,
  infoIcons,
  layout
} from '../API/ChargersSchema';
import { API_BASE_URL } from 'config';
import { useChargerCreateStore } from '../store/useChargerCreateStore';
import { fetchCustomFieldsByMenuId } from '@utils/customFields';
import PreBuildFormNew from '@components/form-elements/PreBuidFormNew';
import { fetchJson, useGetMetaData, useMatchedMenu } from '@utils/fetchJson';
import { toast } from 'react-toastify';
import FormSkeleton from '@components/form-elements/FormSkeleton';
const CreateCharger = ({ onClose, onSave }) => {
  // This is used to get menuid from the module name /link
  const menuId = useMatchedMenu('chargeserialnumber');
  // use this function to get the module metadata
  const  menuData = useGetMetaData('chargeserialnumber');
  // This is use to open create module globally. Payload use to trasfer the data
  const { isOpen, payload: payloadWrapper, close } = useChargerCreateStore();
  //const payload = payloadWrapper?.payload || payloadWrapper || {};
  const payload = useMemo(
  () => payloadWrapper?.payload || payloadWrapper || {},
  [payloadWrapper]
  );
  
  // use this to set default fields for the module
  const [defaultFormData, setDefaultFormData] = useState(defaultFormTemplate);
  const memoFormData = useMemo(() => defaultFormData, [defaultFormData]);
  // memorise the default data to rerender againa and again
  
  //Note: Merage all custom feilds with default
  const [mergedFieldOverrides, setMergedFieldOverrides] = useState(fieldOverrides);
  const [mergedValidationRules, setMergedValidationRules] = useState(validationRules);
  const [mergedColumnLabels, setMergedColumnLabels] = useState(columnLabels);
  const [mergedSchemaTemplate, setMergedSchemaTemplate] = useState(directSchemaTemplate);
  const [mergedLayout, setMergedLayout] = useState(layout);
  const [customFields, setCustomFields] = useState([]);
  const [initialData, setInitialData] = useState(false);
  
  // use this to overrite any feild
  const customeModules ={
  }
  // use this to set default data and edit record data.
  useEffect(() => {
    const setupFormData = async () => {
      // 1. Editing existing record
      if (payload?.record_id) {
        setInitialData(false);
        try {
          const res = await fetchJson(`${API_BASE_URL}/chargerMaster/${payload.record_id}?menuId=${menuId}`, {
            method: 'GET',
          });
          const recordData = res?.data?.[0] || {};
          setDefaultFormData(prev => ({...prev,...payload,...recordData,menuId,}));
        } catch (err) {
          setDefaultFormData(prev => ({...prev,...payload, menuId }));
        }
        setInitialData(true);
      }
      else {
        // 2. Creating new record
        setDefaultFormData(prev => ({...prev,...payload, menuId }));
        setInitialData(true);
      }
    };
    setupFormData();
  }, [payload, menuId]);


// this useEffect use to get all the dynamic and statis fields from the server and update default values 
useEffect(() => {
  if (!isOpen || !menuId) return;

  const loadFields = async () => {
    try {
      const {
        injectedLayout,
        customFields,
        extendedDefaults,
        extendedValidations,
        extendedLabels,
        extendedOverrides,
        extendedSchema,
        generatedLayout
      } = await fetchCustomFieldsByMenuId(menuId, menuData, {
        defaultFormTemplate,
        validationRules,
        fieldOverrides,
        columnLabels,
        directSchemaTemplate,
        layout,
        autoInjectLayout: true,
      });

      setCustomFields(customFields);
      setMergedValidationRules(extendedValidations);
      setMergedColumnLabels(extendedLabels);
      setDefaultFormData(prev => ({
        ...extendedDefaults,
        ...prev,
      }));
      setMergedFieldOverrides(extendedOverrides);
      setMergedSchemaTemplate(extendedSchema);
      setMergedLayout(injectedLayout);
    } catch (err) {
      toast.error('Failed to load custom fields');
    }
  };
  loadFields();
}, [isOpen, menuId, menuData, payload?.parent_id, payload?.is_parent]);

// use this to create slug
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_') 
    .replace(/[^\w_]/g, '');
}
const updateData = (updater) => {
  console.log(updater);
  setDefaultFormData(prev => {
    // If updater is a function, call it (React state API)
    const next = typeof updater === 'function' ? updater(prev) : updater;

    // If cat_name has changed, update slug
    if (next.charger_serial_no !== prev.charger_serial_no) {
      return {
        ...next,
        slug: slugify(next.charger_serial_no)
      };
    }
    return next;
  });
};
  if (!isOpen) return null;
  const loading = payload?.record_id && !initialData;
  
  // PreBuildFormNew use to create form for the module.
  /*
  * directSchema : used to show form feilds
  * getDefApi this is used to get the datatabel feilds details like name,type default value etc.
  * saveApi : this is used to save the data
  * updateApi : use to update the record.
  * formDataPre: this is the form data
  * primaryKey: this identified the which is the primary key for module.
  * sidebarSize : this is used to define the module sixe. lg is large. md is medium
  * title : this is used to show the from title
  * onClose : do action on close.
  * skipFields : this is used to skip the feilds.
  * fieldOverrides : if you want to add new module or override any filed behaviour use this.
  * validationRules : add form validation
  * labels: if you want to override the lable use this.
  * editId : this is used to identified the edit key
  * recordId: this is used to identified the primary key.
  */
  return (
    <> {loading ? (
      <div className='modal-panel size-lg fixed top-[50px] right-0 h-[calc(100vh-56px)] bg-white shadow-lg z-50 flex flex-col w-screen max-w-full md:w-full md:w-[700px]'>
      <FormSkeleton /> </div>
    ) : (
    <PreBuildFormNew
      menuId={menuId}
      directSchema={mergedSchemaTemplate}
      getDefApi={`${API_BASE_URL}/getDefinations`}
      saveApi={`${API_BASE_URL}/chargerMaster`}
      updateApi={`${API_BASE_URL}/chargerMaster/${memoFormData?.id}`}
      //formDataPre={memoFormData}
      formData={defaultFormData}
      setFormData={updateData}
      primaryKey="id"
      sidebarSize="lg"
      title="Add Chargers"
      onClose={() =>{ setDefaultFormData(defaultFormTemplate);close()}}
      skipFields={skipFields}
      fieldOverrides={mergedFieldOverrides}
      validationRules={mergedValidationRules}
      labels={mergedColumnLabels}
      infoIcons={infoIcons}
      layout={mergedLayout}
      editId={memoFormData?.id}
      recordId={memoFormData?.id}
      customModules={(customeModules ? customeModules : {})}
    />
    )}
  </>
  
  );
};
export default CreateCharger;