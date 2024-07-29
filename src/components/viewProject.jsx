import { useNavigate, useParams } from "react-router-dom"
import { useFetch } from "../hooks/useFetch";
import styled from "styled-components";
import ReactJson from "react-json-view";
import { organizeObjects } from "../helpers/organizeObjects";
import { TablePower2 } from "./showTablePower2";
import { ShowClassPower } from "./showClassPower";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../App";
import { organizeByType } from "../helpers/organizeByType";
import { CgLock } from "react-icons/cg";
import { TfiControlShuffle } from "react-icons/tfi";

export const View = () => {
    const { setTheme, theme } = useContext(ThemeContext);
    const{projectId} = useParams();
    const nav = useNavigate();
    const {onSetDataSend, dataSend, loading, dataReceive, } = useFetch(`http://localhost:3000/networks/${projectId}`, {});
    const [Input, setInput] = useState({
        classifiedObjects: {}, 
        columns: {}, 
        uniqueNames:[]
    })

    const [postResult, setPostResult] = useState({
        organizedData:{}, 
        columns:{}, 
        types:[],
    } ); 
    const columns2 = postResult.columns;
    const {organizedData,  types} = postResult;
    const {classifiedObjects, columns, uniqueNames}  = Input;

    const onNavigateBack = () =>{
        nav(-1);
    }

    const onNavigateResults = () =>{
        nav("/results");
    }

    useEffect(() => {
        const data =  organizeObjects(dataReceive.objects);
        console.log(data);
        setInput(data);
    }, [dataReceive]);
    
    
    const onSetTableData = (name, stat) =>{
        const data = uniqueNames.map(obj=>{
            return (obj.name == name)?({name, status:stat}):(obj);
        });

        setInput({...Input, uniqueNames:data});
    }

    const handleButtonClick = async() => {
        const {application, version, modules, types, header, classes, globals, schedules, objects, _id} = dataReceive;
        const mods = modules.map;
        const input_value ={ 
            application, 
            version, 
            modules, 
            types, 
            header, 
            classes, 
            globals, 
            schedules, 
            objects
        };
        
        console.log(input_value);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {
                inputData:input_value,
                id: _id,
            }),
        };

        const resp = await fetch('http://localhost:3000/', requestOptions)
        if (!resp.ok) {
            throw new Error('Network response was not ok');
        }
        const resp_data = await resp.json();
        const formData = organizeByType(resp_data.objects);
        setPostResult(formData);
    }; 

    return (
        <Container >
            <div className="p-4">
                <h1>View Project  </h1>
                <h4>{projectId}</h4>
                <hr/>

                <div className="row rows-cols-1 row-cols-md-6 g-3">
                    { !false && (uniqueNames.map( ({name})=>{ return  <ShowClassPower title={name} length={classifiedObjects[name].length} setTable={onSetTableData} key={`${name}-card`} />; } )) }
                </div>


                { /*dataReceive &&(
                    <ReactJson src={dataReceive} theme="monokai" collapsed={true}/>
                ) */}

                { !(loading)  && ( uniqueNames.map( ({name, status}) =>status?<TablePower2 data={classifiedObjects[name]} columns={columns[name]} list={name} key={`${name}-table`}/>:<></> )) } 
                
                <button className="btn btn-outline-primary"
                        onClick={onNavigateResults}
                    >Edit Network
                </button>

                <div className="p-0 justify-content-center" >
                    <h1>Simulate project result</h1>
                    <h4>{projectId}</h4>
                    <button className="btn btn-outline-primary"
                            onClick={handleButtonClick}
                    >Get result
                    </button>
                    { postResult  && ( types.map( (list) =><TablePower2 data={organizedData[list]} columns={columns2[list]} list={list}/> )) } 
                </div>

                <hr/>                
                <button className="btn btn-outline-primary"
                        onClick={onNavigateBack}>
                            Return
                </button>
                
            </div>
        </Container>
    )
}

const Container = styled.div`
 min-height:100vh;
 max-width: 200vh;`;