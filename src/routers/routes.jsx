import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Simulacion } from "../pages/Simulacion";
import { useContext, useState } from "react";
import { ProjectManagePage } from "../pages/ProjectManagePage";
import { View } from "../pages/viewProject";
import { ViewSimulation } from "../components/viewSimulation";
import { ProjectForm } from "../pages/projectForm";
import { NewProject } from "../pages/NewProject";
import { AppGraph } from "../pages/selectGraphPage";
import { Sidebar } from "../components/Sidebar";
import { ThemeContext } from "../context/ThemeContext";
import { InitPage } from "../pages/InitPage";
import Graph from "../components/GraphComponent";
import { GraphPage } from "../pages/GraphPage";
import DynamicForm from "../components/DynamicForm";
import WebSocketComponent from "../pages/MqttSubscriber";
import FileManager from "../pages/FileManager";

export function MyRoutes() {
  
  const {sidebarOpen, setSidebarOpen} = useContext( ThemeContext );
  const [sim, setSim] = useState({});

  const onSetData = (value) =>{
    setSim(value);
  }


  return (     
      <>             
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />  
        <Routes>

          {/*<Route path="/" element={<Newproject setData={onSetData} />} />*/}
          <Route path="/" element={<InitPage />} />
          <Route path="/Simulacion" element={<Simulacion data={sim}  />}/> 
          <Route path="/GraphNetwork/:projectId" element={<GraphPage/> }/>
          <Route path="/Visualizacion/:projectId" element={<AppGraph />}/>
          <Route path="/DynamicForm" element={<DynamicForm />}/>
          <Route path="/projects" element={<ProjectManagePage />}/>
          <Route path="/EditProject/:projectId" element={<NewProject />}/>
          <Route path="/NewProject" element={<ProjectForm />}/>
          <Route path="/view/:projectId" element={<View />}/>
          <Route path="/viewresult/:projectId" element={<ViewSimulation />}/>
          <Route path="/Livepanel" element={<WebSocketComponent />}/>
          <Route path="/FileManager/:projectId" element={<FileManager />}/>
          <Route path="/*" element={ <Navigate to="/" /> } />

        </Routes>
      </>
     
    
  );
}
