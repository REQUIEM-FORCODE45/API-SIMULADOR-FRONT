import ReactTable from 'react-table-v6';
import 'react-table-v6/react-table.css';
import styled from "styled-components";

const StyledTableWrapper = styled.div`
  overflow-x: auto;
  max-width: 1600px;;
`;

export const TablePower2 = ({ data, columns, list }) => {
  return (
    <StyledTableWrapper>
        <hr/>
        <h2>{list}</h2>  
        <ReactTable
          data={data}
          columns={columns}
          defaultPageSize={10} // Puedes ajustar el tamaño de página según tus necesidades
          className="-striped -highlight"
        />
        <hr/>
    </StyledTableWrapper>
  );
};
