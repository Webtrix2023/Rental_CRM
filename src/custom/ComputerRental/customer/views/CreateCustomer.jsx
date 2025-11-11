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
} from '../API/CustomerSchema';
import { API_BASE_URL } from 'config';
import { useCustomerCreateStore } from '../store/useCustomerCreateStore';
import { fetchCustomFieldsByMenuId } from '@utils/customFields';
import PreBuildFormNew from '@components/form-elements/PreBuidFormNew';
import { fetchJson, useGetMetaData, useMatchedMenu } from '@utils/fetchJson';
import { toast } from 'react-toastify';
import FormSkeleton from '@components/form-elements/FormSkeleton';
import ContactListEditor from './ContactListEditor';
import { ControlledPhoneInput } from "@components/index";
import PermissionGuard from '@utils/PermissionGuard';
const CreateCustomer = ({ onClose, onSave }) => {
  // This is used to get menuid from the module name /link
  const menuId = useMatchedMenu('customer');
  // use this function to get the module metadata
  const  menuData = useGetMetaData('customer');
  // This is use to open create module globally. Payload use to trasfer the data
  const { isOpen, payload: payloadWrapper, close } = useCustomerCreateStore();
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
  //const customeModules ={};
  const customeModules ={
    mobile_no: () => <ControlledPhoneInput
                        label="Mobile Number"
                        country="in"
                        value={defaultFormData.mobile_no}
                        onChange={(val, countryData) => {
                            setDefaultFormData(prev => ({...prev,mobile_no:`${countryData.dialCode}${val}`}));
                        }}
                        />,
    wa_number: () => <ControlledPhoneInput
    label="Whats App Number"
    country="in"
    value={defaultFormData.wa_number}
    onChange={(val, countryData) => {
        setDefaultFormData(prev => ({...prev,wa_number:`${countryData.dialCode}${val}`}));
    }}
    />
  }
  // use this to set default data and edit record data.
  useEffect(() => {
    const setupFormData = async () => {
      // 1. Editing existing record
      if (payload?.record_id) {
        setInitialData(false);
        try {
          const res = await fetchJson(`${API_BASE_URL}/customerMaster/${payload.record_id}?menuId=${menuId}`, {
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

const updateData = (updater) => {
  console.log(updater);
  setDefaultFormData(prev => {
    const next = typeof updater === 'function' ? updater(prev) : updater;
    return next;
  });
};
  if (!isOpen) return null;
  const loading = payload?.record_id && !initialData;
  return (
    
    <PermissionGuard module="customer" action={payload?.record_id ? "edit" : "add"} isFlyout={true} onClose={close}>
    {loading ? (
      <div className='modal-panel size-lg fixed top-[50px] right-0 h-[calc(100vh-56px)] bg-white shadow-lg z-50 flex flex-col w-screen max-w-full md:w-full md:w-[700px]'>
      <FormSkeleton /> </div>
    ) : (
    <PreBuildFormNew
      menuId={menuId}
      directSchema={mergedSchemaTemplate}
      getDefApi={`${API_BASE_URL}/getDefinations`}
      saveApi={`${API_BASE_URL}/customerMaster`}
      updateApi={`${API_BASE_URL}/customerMaster/${memoFormData?.customer_id}`}
      //formDataPre={memoFormData}
      formData={defaultFormData}
      setFormData={updateData}
      primaryKey="customer_id"
      sidebarSize="lg"
      title="Create Customer"
      onClose={(res) =>{ setDefaultFormData(defaultFormTemplate);close(res)}}
      skipFields={skipFields}
      fieldOverrides={mergedFieldOverrides}
      validationRules={mergedValidationRules}
      labels={mergedColumnLabels}
      infoIcons={infoIcons}
      layout={mergedLayout}
      editId={memoFormData?.customer_id}
      recordId={memoFormData?.customer_id}
      customModules={(customeModules ? customeModules : {})}
    />
    )}
  </PermissionGuard>
  
  );
};
export default CreateCustomer;