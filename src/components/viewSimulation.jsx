import { useNavigate, useParams } from "react-router-dom"
import { useFetch } from "../hooks/useFetch";
import ReactJson from "react-json-view";

export const ViewSimulation = () => {
    const{projectId} = useParams();
    const {onSetDataSend, dataSend, loading, dataReceive, }= useFetch(`http://localhost:3000/results/${projectId}`, {});
    const nav = useNavigate();

    const onNavigateBack = () =>{
        nav(-1);
    }
    return (
        <div>
            <h1>View Project  </h1>
            <h4>{projectId}</h4>
            <hr/>
            {dataReceive &&(
                <ReactJson src={dataReceive} theme="monokai" collapsed={true}/>
            )}
            <button className="btn btn-outline-primary"
                    onClick={onNavigateBack}>
                        Return
            </button>
        </div>
    )
}
