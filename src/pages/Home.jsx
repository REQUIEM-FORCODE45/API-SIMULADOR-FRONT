
import { useState, useEffect }  from 'react';
import { saveAs } from 'file-saver';
import ReactTable from 'react-table-v6';
import 'react-table-v6/react-table.css';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-github';
import styled from "styled-components";
import "./App.css"

export const Newproject = ({setData}) => {

  const [myValue, setMyValue] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState([]);


  const onDataChange = ({target}) =>{
    setMyValue( target.value ); 
  }

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ glm:myValue})
      };
      
      fetching('http://localhost:5000/glm2json', requestOptions);
    }
  };

  const fetching = async(url, ops) =>{
      const resp = await fetch(url, ops);
      const data = await resp.json();
      setShowTable(true);
      setData(data);
      const formattedData = data.objects.map(obj => {
        return {
          name: obj.attributes.name,
          nominal_voltage: obj.attributes.nominal_voltage,
          phases: obj.attributes.phases
        };
      });

      console.log(formattedData);
      setTableData(formattedData);      
  }


  const readFile = (e) => {
    const file = e.target.files[0];
    if ( !file ) return;
    const fileReader = new FileReader();

    fileReader.readAsText( file );
    fileReader.onload = () => {
      setMyValue( fileReader.result);
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ glm:fileReader.result})
      };
      
      fetching('http://localhost:5000/glm2json', requestOptions);
    }

    fileReader.onerror = () => {
      console.log( fileReader.error );
    }
  }




  return (
    <Container>
    <div className="App">
      <header className="App-header">
       
        <h1>Edición simulación </h1>

      
        <input 
          className="btn btn-outline-secondary"
          type="file"
          multiple={ false }
          onChange={ readFile }
        />

        <br/> <br/>
        {/*<AceEditor
          mode="c_cpp"
          theme="github"
          name="code_editor"
          fontSize={14}
          value={ myValue }
          onChange={onDataChange}
          onKeyDown={onKeyPress}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
          }}
          style={{ width: '100%', height: '320px' }}
        />*/}

        <textarea
          className='form-control'
          cols="100"
          rows="10"
          placeholder="Ingrese lo que desea grabar"
          value={ myValue }
          onChange={onDataChange}
          onKeyDown={onKeyPress}>

        </textarea>
        
        {showTable && (
          <ReactTable
            data={tableData}
            columns={[
              {
                Header: 'Nombre',
                accessor: 'name'
              },
              {
                Header: 'Voltaje Nominal',
                accessor: 'nominal_voltage'
              },
              {
                Header: 'Fases',
                accessor: 'phases'
              }
            ]}
            defaultPageSize={10}
            className="-striped -highlight"
          />
        )}

      </header>
    </div>
    </Container>
  );
}

const Container = styled.div`
 height:100vh;`;