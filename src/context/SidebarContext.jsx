// SidebarContext.js
import React, { createContext, useState, useContext } from 'react';
import { useEffect } from 'react';

export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {

  const [concatenatedText, setConcatenatedText] = useState("");
  const [NewGlmlist, setNewGlmlist] = useState({})
  const [links, setLinks] = useState([]);
  const [Nodes, setNodes] = useState({
    nodes: [
      { id: '1', label: 'Generator 1', characteristics: ['generator'], voltage: '138 kV' },
      { id: '2', label: 'Generator 2', characteristics: ['generator'], voltage: '138 kV' },
      { id: '3', label: 'Generator 2', characteristics: ['generator'], voltage: '138 kV' },

    ],

    links:  [
      { source: '1', target: '3', label: 'Transmission Line 1' },
      { source: '2', target: '3', label: 'Transmission Line 2' },
    ]
 });

  const updateLinks = (newLinks) => {
    setLinks(newLinks);
  };

  const updateNodes = ( Nodes ) =>{
    setNodes(Nodes);
  }

  const appendToText = (newText) => {
    setConcatenatedText((prevText) => `${prevText}\n\n${newText}`);
  };

  const clearConcatenatedText = () => {
    setConcatenatedText("");
  };

  const setList = ( List ) =>{
    setNewGlmlist(List);
  };

  const clearList = () =>{
    setNewGlmlist({});
  };

  useEffect(() => {
    console.log("Updated concatenatedText:", concatenatedText); // Ahora tienes el estado actualizado
  }, [concatenatedText]);

  return (
    <SidebarContext.Provider value={{ 
        links,
        updateLinks,
        Nodes,
        updateNodes,
        concatenatedText,
        appendToText,
        clearConcatenatedText,
        NewGlmlist,
        setList,
        clearList
    }}>

      {children}

    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
