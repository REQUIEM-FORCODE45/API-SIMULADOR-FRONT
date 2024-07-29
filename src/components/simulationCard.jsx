import { Link } from "react-router-dom"
import styled from "styled-components";

export const Card2 = ({modules_result ,objects_result, _id}) => {
  return (

        <div className="col">
            <div className="card">

                <div className="row no-gutters">
 
                    <div className="col-4">
                        <img src="/assets/casas-panel2.svg"  className="card-img" />
                    </div>     

                    <div className="col-8">

                        <div className="card-body">

                            <h5 className="card-title">  resultado </h5>
                            <p className="card-text">Result objects: {objects_result.length}</p>

                            <p className="card-text">
                                <small className="text-muted">Result modules: {modules_result.length}</small>
                            </p>

                            <Link to={`/viewresult/${ _id }`}>
                                Más..
                            </Link>

                        </div>

                    </div>

                </div>
            </div>
        </div>   

  )
}
