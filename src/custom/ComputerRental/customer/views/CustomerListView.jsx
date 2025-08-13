import {React,useState,useEffect,useRef} from 'react';
import DynamicTable from '@components/dynamicTables/dynamicTable';
import { API_BASE_URL } from '@config';
import DynamicFilter from '@components/filter/DynamicFilter';
import { fetchJson, useMatchedMenu } from '@utils/fetchJson';
import { getModuleMetaData } from '@utils/api';
import ToolbarActions from '@components/ToolbarActions';
import { History, List, LucideMail, LucideSend, Pencil, Plus, Trash2 } from 'lucide-react';
import { getDaynamicData } from '@utils/utils';
import {defaultFormTemplate,directSchemaTemplate,fieldOverrides,columnLabels,defaultColumns,skipFields,filterSkipFields} from '../API/CustomerSchema';
import { useModuleMetaData } from '@utils/useModuleMetaData';
import { useCustomerCreateStore } from '../store/useCustomerCreateStore';
import { useEmailCreateStore } from '@plugin/mail/store/useMailStore';
import TableSkeleton from '@components/form-elements/TableSkeleton';
import { useNavigate } from 'react-router-dom';

const CustomerListView = () => {
  const menuId = useMatchedMenu('customer');
  const {metadata,moduleData,c_metadata,definitions,loading,error} = useModuleMetaData(menuId);
  const [defaultFormData, SetDefaultFormData] = useState(defaultFormTemplate);
  const [filterData, setFilterData] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [freetext, setFreeTextChange] = useState("");
  const [sortState, setSortState] = useState({ column: 'created_date', direction: 'desc' });
  const { openCustomerCreate } = useCustomerCreateStore();
  const { openEmailCreate } = useEmailCreateStore();
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isOpen, setisOpen] = useState(false);
  const [subCatParent, setsubCatParent] = useState();
  const filterRefresh = useRef();
      const navigate = useNavigate();
  //const filterRefresh = React.createRef();
   const refreshFilterList = () => {
    if (filterRefresh.current) {
      //filterRef.current?.refreshRecords();
      filterRefresh.current.refreshRecords();
    }
  };
  const handleEdit = (rowData) => {
  setSelectedLeadId(rowData.record_id)
   openCustomerCreate({payload:rowData},(result) => {
    refreshFilterList();
  });

};
const handleDelete =async (rowData) => {
  if (window.confirm(`Delete "${rowData.name}"?`)) {
          await fetchJson(`${API_BASE_URL}/customerMaster/delete`, {
              method: 'POST',
              body: JSON.stringify({ action: "delete",menuId:"",list:rowData.customer_id })
          });
          refreshFilterList();
      }
};
const renderRowActions = ({ row, rowKey }) => (
  <div className="sticky min-w-[28px] w-full right-0 z-10 bg-white border-l text-right p-2 group-hover:bg-gray-50 transition-colors">
    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-in bg-white shadow rounded p-1 flex gap-2 z-10">
      <button onClick={() => handleEdit({ record_id: row[rowKey] })} className="text-blue-500 hover:text-blue-700 p-1">
        <Pencil size={16} />
      </button>
      <button title="Customer Rental Report" onClick={(e) =>{  e.stopPropagation(); navigate(`/customer-report/${row[rowKey]}`)}} className="text-blue-500 hover:text-blue-700 p-1">
        <History size={16} />
      </button>
      <button title="Delete" onClick={(e) =>{  e.stopPropagation(); handleDelete(row);}} className="text-red-500 hover:text-red-700 p-1">
        <Trash2 size={16} />
      </button>
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
    list: 'categoryName,customer_id'
  }
}
  return (
    <>
    <div className="p-4">
      <div className='flex justify-between items-center mb-4'>
        <h1 className="text-xl font-regular mb-4">{moduleData?.menuName}&nbsp;<small className='text-gray-500 text-xs'>{moduleData?.module_desc}</small></h1>
        <div className="flex gap-2">
          <button onClick={() =>{
            // setShowForm(true)
             openCustomerCreate({},(result) => {
    refreshFilterList();
  });
            } }
            className='p-1.5 pl-3 pr-3 bg-primary text-white rounded flex items-center'> <Plus className="inline mr-2" size={16} />Create</button>
        </div>
      </div>
      {metadata?.[0] && definitions?.length ? (
      <div className="bg-white pl-3 pr-3 pb-3 border rounded shadow mb-2"><ToolbarActions viewMode={false} viewSettings={false}/>
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
      initialFilters={{ subject: '', task_status: '', due_date: { from: '', to: '' } }}
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
        url: `${API_BASE_URL}/customerMasterList`,
        method: 'POST',
        body:filterData,
        }}
        columnMetaSaveApi={`${API_BASE_URL}/c_metadata`}
        columnWidthSaveApi={`${API_BASE_URL}/setModuleDefaultView`}
        definitionApi={`${API_BASE_URL}/getDefinations`}
        rowKey="customer_id"
        defaultColumns={defaultColumns}
        bulkeditfields={["start_date", "due_date",]}
        skipFields={skipFields}
        columnMappings={columnLabels}
        bulkActions={['active','inactive','delete']}
        bulkStatusAPI={`${API_BASE_URL}/customerMaster/delete`}
        handleRefresh={refreshFilterList}
        handleEdit={handleEdit}
        //isRowSelectable={row => row.is_sys_category === 'no'}
        rowEdit={true}
        columnRenderers={{
        cat_color: (row) => (
          <div className="flex gap-1 items-center">
            {row.cat_color
              ? <div className="w-6 h-6 rounded border m-auto" style={row.cat_color ? { backgroundColor: row.cat_color } : {}}/>
              : <span className="text-gray-400 m-auto">-</span>
            }
          </div>
        ),
      }}
      />
</div>
) : (
  <TableSkeleton></TableSkeleton>
)}
    </div>
  </>);
};

export default CustomerListView;