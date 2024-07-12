import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Newproject } from "../pages/Home";
import { Simulacion } from "../pages/Simulacion";
import { Visualizacion } from "../pages/Visualizacion";
import { useState } from "react";

export function MyRoutes() {
  
  const [sim, setSim] = useState({});

  const onSetData = (value) =>{
    setSim(value);
  }


  return (     
      <Routes>
        <Route path="/" element={<Newproject setData={onSetData} />} />
        <Route path="/Simulacion" element={<Simulacion data={sim}  />}/>
        <Route path="/Visualizacion" element={<Visualizacion />}/>
      </Routes>
    
  );
}
