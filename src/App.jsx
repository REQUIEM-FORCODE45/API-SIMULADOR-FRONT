import { useState, useEffect }  from 'react';
import ReactJson from 'react-json-view';
import { saveAs } from 'file-saver';
import ReactTable from 'react-table-v6';
import 'react-table-v6/react-table.css';
import './App.css';

function App() {

  const [myValue, setMyValue] = useState('')
  const [data, setData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [postResult, setPostResult] = useState(null); 

  const createFile = () => {

    const blob = new Blob([ myValue ], { type: 'text/plain;charset=utf-8' });
    saveAs( blob, 'mi-archivo.txt' );
  }

  const handleButtonClick = () => {
    // Aquí puedes definir la lógica para la solicitud POST
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify( data ) // Enviar los datos que desees
    };

    fetch('http://localhost:3000/', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const {objects} = data
        setPostResult(objects); 
        console.log(data);
        
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }; 

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
      
      fetch('http://localhost:5000/glm2json', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        setShowTable(true);
        setData(data);

        // Aquí puedes convertir tu JSON en un formato que se pueda usar para la tabla
        const formattedData = data.objects.map(obj => {
          return {
            name: obj.attributes.name,
            nominal_voltage: obj.attributes.nominal_voltage,
            phases: obj.attributes.phases
          };
        });

        setTableData(formattedData);        

      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
      

    }

    fileReader.onerror = () => {
      console.log( fileReader.error );
    }

  }

  return (
    <div className="App">
      <header className="App-header">
       
        <h1>Edicion y visualizacion simulacion </h1>
        {/* Botón para realizar la solicitud POST */}
        <button onClick={handleButtonClick}>Obtener resultado simulacion</button>

         {/* Mostrar el resultado de la solicitud POST si hay datos */}
        {/*postResult && (
          <div>
            <h2>Respuesta del servidor:</h2>
            <pre>{JSON.stringify(postResult, null, 2)}</pre>
          </div>
        )*/}

        {postResult &&(
          <ReactJson src={postResult} theme="monokai" collapsed={true}/>
        )}
        <br/> <br/> 
        <button onClick={createFile}>Mostrar datos</button>
        <br/> <br/>       
        <input 
          type="file"
          multiple={ false }
          onChange={ readFile }
        />

        <br/> <br/>

        <textarea
          cols="50"
          rows="10"
          placeholder="Ingrese lo que desea grabar"
          value={ myValue }
          onChange={ ( e ) => setMyValue( e.target.value ) }
        ></textarea>

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
  );
}

export default App;
