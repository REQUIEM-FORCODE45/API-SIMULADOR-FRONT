import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Simulacion } from "../pages/Simulacion";
import { useState } from "react";
import { ProjectManagePage } from "../pages/ProjectManagePage";
import { View } from "../components/viewProject";
import { ViewSimulation } from "../components/viewSimulation";
import { ProjectForm } from "../components/projectForm";
import { Newproject } from "../pages/Home";
import { AppGraph } from "../pages/selectGraphPage";

export function MyRoutes() {
  
  const [sim, setSim] = useState({});

  const onSetData = (value) =>{
    setSim(value);
  }


  return (     
    
      <Routes>

        {/*<Route path="/" element={<Newproject setData={onSetData} />} />*/}
        <Route path="/" element={<ProjectForm />} />
        <Route path="/Simulacion" element={<Simulacion data={sim}  />}/>
        <Route path="/Visualizacion" element={<AppGraph />}/>
        <Route path="/projects" element={<ProjectManagePage />}/>
        <Route path="/results" element={<Newproject />}/>
        <Route path="/view/:projectId" element={<View />}/>
        <Route path="/viewresult/:projectId" element={<ViewSimulation />}/>

      </Routes>
    
  );
}
