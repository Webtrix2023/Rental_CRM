import {React,useState,useEffect,useRef} from 'react';
import DynamicTable from '@components/dynamicTables/dynamicTable';
import { API_BASE_URL } from '../../../../config';
import DynamicFilter from '@components/filter/DynamicFilter';
import { fetchJson, useMatchedMenu } from '@utils/fetchJson';
import { getModuleMetaData } from '@utils/api';
import ToolbarActions from '@components/ToolbarActions';
import { HistoryIcon, InfoIcon, List, LucideMail, LucideSend, Pencil, Plus, Trash2 } from 'lucide-react';
import { getDaynamicData } from '@utils/utils';
import {defaultFormTemplate,directSchemaTemplate,fieldOverrides,columnLabels,defaultColumns,skipFields,filterSkipFields} from '../API/ProductSchema';
import { useModuleMetaData } from '@utils/useModuleMetaData';
import { useProductCreateStore } from '../store/useProductCreateStore';
import TableSkeleton from '@components/form-elements/TableSkeleton';
import { getPlainTextFromHtml } from '@utils/getPlainTextFromHtml';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { canUser } from '@utils/usePermission';
const ProductsView = () => {
  const menuId = useMatchedMenu('products');
  const {metadata,moduleData,c_metadata,definitions,loading,error} = useModuleMetaData(menuId);
  const [defaultFormData, SetDefaultFormData] = useState(defaultFormTemplate);
  const [filterData, setFilterData] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [freetext, setFreeTextChange] = useState("");
  const [sortState, setSortState] = useState({ column: 'created_date', direction: 'desc' });
  const { openProductCreate } = useProductCreateStore();
  const [selectedLeadId, setSelectedLeadId] = useState(null);
    const navigate = useNavigate();
  
  const filterRefresh = useRef();
   const refreshFilterList = () => {
    if (filterRefresh.current) {
      filterRefresh.current.refreshRecords();
    }
  };
  const handleEdit = (rowData) => {
  setSelectedLeadId(rowData.record_id)
   openProductCreate({payload:rowData},(result) => {
    refreshFilterList();
  });

};
const MySwal = withReactContent(Swal);
  const confirmDelete = async (action) => {
  const result = await MySwal.fire({
    title: 'Are you sure?',
    text: `Do you want to set the product status to ${action}?`,
    icon: 'warning',
    customClass: {
    title: 'swal2-title-lg',     // custom class for title
    popup: 'swal2-popup-md',     // for dialog box
    icon: 'swal2-icon-md',       // for the icon
    confirmButton: 'swal2-btn-lg', // for buttons
    cancelButton: 'swal2-btn-lg'
  },
    confirmButtonColor: '#2563eb', // Tailwind blue-600
    cancelButtonColor: '#64748b',  // Tailwind slate-500
    showCancelButton: true,
    confirmButtonText: `Yes, ${action}`,
    width: 350,
  });
  return result;
  // if (result.isConfirmed) {
  //   updateRecords(action);
  // }
};

  const updateProductStatus = async (rowData,value) => {
    const label = value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    const result  = await confirmDelete(label);
    console.log(result);
    if (result.isConfirmed) {
      const data = {"current_status":value};
      setSelectedLeadId(rowData.record_id);
      await fetchJson(`${API_BASE_URL}/updateRecordDetails`, {
                method: 'POST',
                body: JSON.stringify({record_data:data,record_id:rowData.product_id })
            });
      refreshFilterList();
    }
    //updateRecordDetails
    
  };

const handleDelete =async (rowData) => {
  if (window.confirm(`Delete "${rowData.product_name}"?`)) {
          await fetchJson(`${API_BASE_URL}/multipleproductChangeStatus`, {
              method: 'POST',
              body: JSON.stringify({ action: "delete",menuId:"",list:rowData.product_id })
          });
          refreshFilterList();
      }
};
const renderRowActions = ({ row, rowKey }) => (
  <div className="sticky min-w-[28px] w-full right-0 z-10 bg-white border-l text-right p-2 group-hover:bg-gray-50 transition-colors">
    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-in bg-white shadow rounded p-1 flex gap-2 z-10">
    {canUser("products", "edit") && (
      <button onClick={() => handleEdit({ record_id: row[rowKey] })} className="text-blue-500 hover:text-blue-700 p-1">
        <Pencil size={16} />
      </button>
    )}
     {canUser("products", "view") && (
      <button title="Product Report" onClick={(e) =>{  e.stopPropagation(); navigate(`/product-report/${row[rowKey]}`);}} className="text-blue-900 hover:text-blue-700 p-1">
        <HistoryIcon size={16} />
      </button>
     )}
       {canUser("products", "delete") && (
      <button title="Delete" onClick={(e) =>{  e.stopPropagation(); handleDelete(row);}} className="text-red-500 hover:text-red-700 p-1">
        <Trash2 size={16} />
      </button>
       )}
    </div>
  </div>
);
useEffect(() => {
    const updateMenuId = () => {
    SetDefaultFormData(prev => ({
      ...prev,
      menuId: menuId
    }));
  };
  updateMenuId();
  },[menuId]);
  useEffect(() => {
    // const newFilterData = {
    //   freeTextSearch: freetext,
    //   orderBy: sortState.column,
    //   order: sortState.direction,
    //   menuId: menuId,
    //   company_id: localStorage.getItem('active_company') || 1,
    //   curpage: currentPage,
    // };
    // setFilterData(newFilterData);
     setFilterData(prev => ({
      ...prev,
        freeTextSearch: freetext,
      orderBy: sortState.column,
      order: sortState.direction,
      menuId: menuId,
      company_id: localStorage.getItem('active_company') || "",
      curpage: currentPage,
    }));

  },[freetext,sortState,currentPage,menuId]);

  const filters = {}; // pull from global filter state if needed
  // const handleRefresh = () => {
  //   //renderListAgain(filterData);

  // };
  const renderListAgain = (rowData) => {
    setFilterData(prev => ({
      ...prev,
      filters: rowData.filters || {},
      filterJson: JSON.stringify(rowData.filters || {})
    }));
  };

  const fieldEditors={
  assignee: {
    type: 'admin',
    source: 'admin',
    check: 'name',
    list: 'name,adminID,photo'
  },
  customer_id: {
    type: 'customer',
    source: 'customer',
    check: 'name',
    list: 'name,customer_id,type'
  },
  task_type:{
    type: 'category',
    source: 'category',
    check: 'categoryName',
    list: 'categoryName,category_id'
  }
}
  return (
    <>
    <div className="p-4">
      <div className='flex justify-between items-center mb-4'>
        <h1 className="text-xl font-regular mb-4">{moduleData?.menuName}&nbsp;<small className='text-gray-500 text-xs'>{moduleData?.module_desc}</small></h1>
        <div className="flex gap-2">
          {canUser("chargeserialnumber", "add") && (
          <button onClick={() => {
            // setShowForm(true)
             openProductCreate({},(result) => {
    refreshFilterList();
  });
            } }
            className='p-1.5 pl-3 pr-3 bg-primary text-white rounded flex items-center'> <Plus className="inline mr-2" size={16} />Create</button>
          )}  
        </div>
      </div>
      {metadata?.[0] && definitions?.length ? (
      <div className="bg-white pl-3 pr-3 pb-3 border rounded shadow mb-2">
        <ToolbarActions viewMode={false} viewSettings={false}/>
      <DynamicFilter
      menuId={menuId}
      fields={directSchemaTemplate}
      onApply={renderListAgain}
      handleRefresh={refreshFilterList}
      filters={filters}
      onFreeTextChange={(textSearch) => {
          setFreeTextChange(textSearch);
      }}
      overrideFields={fieldOverrides}
      columnMappings={columnLabels}
      skipFields={filterSkipFields}
      onFilterChange={(filters) => console.log(filters)}
      onReset={() => console.log('Reset')}
      initialFilters={{}}
      /></div>
      ) : (
      <div className="p-4 text-sm text-gray-500">Loading filter options...</div>
      )}
      {metadata && definitions ? (
        <div className='flex flex-col h-[calc(100vh-320px)]'>
      <DynamicTable
        ref={filterRefresh}
        menuId={menuId}
        metadata={metadata}
        c_metadata={c_metadata}
        fieldDefinitions={definitions}
        fieldEditors={fieldEditors}
        rowActions={renderRowActions}
        onPageChange={(page) => {
            setCurrentPage(page);
          }}
          onSortChange={(newSort) => {
          setSortState(newSort);
          //fetchDataWithSort(newSort); // your function that refetches
        }}
        recordsApi={{
          url: `${API_BASE_URL}/rentalproductMasterList`,
          method: 'POST',
          body:filterData,
        }}
        columnMetaSaveApi={`${API_BASE_URL}/c_metadata`}
        columnWidthSaveApi={`${API_BASE_URL}/setModuleDefaultView`}
        definitionApi={`${API_BASE_URL}/getDefinations`}
        rowKey="product_id"
        defaultColumns={defaultColumns}
        bulkeditfields={[]}
        skipFields={skipFields}
        columnMappings={columnLabels}
       // bulkActions={['active','inactive','delete']}
       bulkActions={[
                  ...(canUser('products', 'active') ? ['active'] : []),
                  ...(canUser('products', 'inactive') ? ['inactive'] : []),
                 ...(canUser('products', 'delete') ? ['delete'] : [])
               ]}
        bulkStatusAPI={`${API_BASE_URL}/multipleproductChangeStatus`}
        handleRefresh={refreshFilterList}
        handleEdit={handleEdit}
        //rowEdit={true}
         rowEdit={canUser("products", "edit")}
        columnRenderers={{
        product_description: (row) => (
          <div className="flex gap-1 items-center">
               {getPlainTextFromHtml(row.product_description)}
          </div>
        ),
        parent_id:(row)=>(
          <span>{row.parentCatName}</span>
        ),
        current_status: (row) =>
          (row.current_status !== "on_rent" && row.current_status !== "sold") ? (
            <select onClick={e =>{e.stopPropagation();}} onChange={e => {
              e.stopPropagation();
    updateProductStatus(row, e.target.value);
  }} name="change_current_status" value={row.current_status} className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10">
              <option value="in_inventory">In Inventory</option>
              <option value="damaged">Damaged</option>
              <option value="in_maintenance">In Maintenance</option>
            </select>
          ) : (<span>
              {row.current_status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </span>),
        
      }}
      />
</div>
) : (
  <TableSkeleton></TableSkeleton>
)}
  </div>
  </>);
};
export default ProductsView;