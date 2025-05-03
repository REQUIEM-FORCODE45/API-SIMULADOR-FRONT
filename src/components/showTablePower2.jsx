import React, { useCallback, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';


export const TablePower2 = ({ data, columns, list }) => {
    const [gridApi, setGridApi] = useState(null);

    const onGridReady = useCallback((params) => {
        setGridApi(params.api);
    }, []);

    const columnDefs = useMemo(() => columns.map((col) => ({
        headerName: String(col.Header),
        field: String(col.accessor),
        sortable: true,
        filter: true,
        resizable: true
    })), [columns]);

    const defaultColDef = useMemo(() => ({
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
        sortable: true,
    }), []);

    const exportToCsv = useCallback(() => {
        if (gridApi) {
            gridApi.exportDataAsCsv({ fileName: `${list}_export.csv` });
        }
    }, [gridApi, list]);

    return (
        <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h3 className="mb-0">{list}</h3>
                <button 
                    onClick={exportToCsv}
                    className="btn btn-light"
                >
                    Exportar CSV
                </button>
            </div>
            <div className="card-body">
                <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
                    <AgGridReact
                        onGridReady={onGridReady}
                        rowData={data}
                        columnDefs={columnDefs}
                        pagination={true}
                        paginationPageSize={10}
                        defaultColDef={defaultColDef}
                        animateRows={true}
                        rowSelection="multiple"
                        enableCellTextSelection={true}
                        suppressDragLeaveHidesColumns={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default TablePower2;