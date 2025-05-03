import React, { useContext, useEffect, useState } from 'react';
import Graph from '../components/GraphComponent';
import GraphMap from '../components/GraphComponentMaps';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import simuladorNode from '../api/SimuladorNodes';
import Modal from '../components/ModalComponent';
import DetailView from '../components/DetailView'; 
import { useSidebar } from '../context/SidebarContext';
import { ThemeContext } from '../context/ThemeContext';
import Swal from 'sweetalert2';
import ErrorBoundary from '../components/ErrorBoundary';

const EditObjects = [
    'battery', 'building', 'capacitor', 'central_dg_control',
    'controller_dg', 'dc_dc_converter', 'diesel_dg', 'emissions',
    'energy_storage', 'fuse', 'industrial', 'inverter', 'line',
    'line_configuration', 'line_sensor', 'line_spacing', 'link',
    'load', 'meter', 'metrics', 'microturbine', 'motor', 'node',
    'overhead_line', 'overhead_line_conductor', 'pole', 'pole_configuration',
    'power_electronics', 'pqload', 'recloser', 'rectifier', 'regulator',
    'regulator_configuration', 'solar', 'substation', 'switch',
    'switch_coordinator', 'transformer', 'transformer_configuration',
    'triplex_line', 'triplex_line_conductor', 'triplex_line_configuration',
    'triplex_load', 'triplex_meter', 'underground_line',
    'underground_line_conductor', 'vfd', 'volt_var_control', 'voltdump',
    'windturb_dg', 'multi_recorder'
];



export const GraphPage = () => {
    const { theme } = useContext(ThemeContext);
    const { updateLinks, appendToText, clearConcatenatedText, concatenatedText, NewGlmlist, setList, clearList } = useSidebar(); 
    const nav = useNavigate();
    const { projectId } = useParams();
    const [Links, setLinks] = useState({
        links: [],
        nodes: [],
    });
    const [Update, setUpdate] = useState({})
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [isModalOpen3, setIsModalOpen3] = useState(false);    
    const [groupedObjects, setGroupedObjects] = useState({});
    const [openDropdown, setOpenDropdown] = useState({});
    const [openDropdown3, setOpenDropdown3] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItem2, setSelectedItem2] = useState(null);
    const [selectedItem3, setSelectedItem3] = useState(null);    
    const [isListVisible, setIsListVisible] = useState(true);
    const [isListVisible2, setIsListVisible2] = useState(true);
    const [isListVisible3, setIsListVisible3] = useState(true);
    const [mapa, setMap] = useState(false);    
    const [objects, setObjects] = useState({});
    const [Change, setChange] = useState(false)

    const handleOpenModalView = async () => {
        try {
            const data = await simuladorNode.get(`networks/${projectId}`);
            const fetchedObjects = data.data.objects;
            setObjects(data.data);
            if (fetchedObjects && typeof fetchedObjects === 'object') {
                setGroupedObjects(groupByClass(fetchedObjects));
                console.log(groupedObjects);
            } else {
                setGroupedObjects({});
            }
            console.log(groupedObjects);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error al abrir el modal:", error);
        }
    };


    const handleOpenModalView2 = () => {
        try {

            setIsModalOpen2(true);
        } catch (error) {
            console.error("Error al abrir el modal:", error);
        }
    };

    const handleOpenModalView3 = () => {
        try {

            setIsModalOpen3(true);
        } catch (error) {
            console.error("Error al abrir el modal:", error);
        }
    };

    const handleSaveSimulation = async () => {
        if (Object.keys(NewGlmlist).length > 0) {
            try {
                // Mostrar aviso de guardando
                Swal.fire({
                    title: 'Guardando',
                    text: 'Por favor espera mientras se guarda la simulación.',
                    icon: 'info',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading(); // Mostrar animación de carga
                    },
                });
                
                let output = "";
                for (const [objectName, objectData] of Object.entries(NewGlmlist)) {
                    objectData.items.forEach(item => {
                        output += `object ${objectName} {\n`;
                        for (const [key, value] of Object.entries(item)) {
                            if (value !== "") {
                                const val = value;
                                output += `\t${key} \"${val}\";\n`;
                            }
                        }
                        output += `}\n\n`;
                    });
                };

                const url = `/addglm/${projectId}`;
                const response = await simuladorNode.post(url, {
                    additionalContent: output,
                    modelsContent: "",
                });
                //\n module generators;
                if(response.data.status == "ERROR"){
                    Swal.close();
                    Swal.fire({
                        icon: 'error',
                        title: 'No hemos guardado tu simulacion',
                        text: response.data.content,
                    });

                }else{
                    console.log("Inserción exitosa");
                    setUpdate(response.data.json);
                    clearList();
        
                    // Cerrar el aviso de guardando
                    Swal.close();
        
                    // Mostrar alerta de éxito
                    Swal.fire({
                        title: 'Éxito',
                        text: 'La simulación se guardó correctamente.',
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                    });
                }

            } catch (error) {
                console.error("Error al guardar la simulación", error);
    
                // Cerrar el aviso de guardando
                Swal.close();
    
                // Mostrar alerta de error
                Swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error al guardar la simulación. Inténtalo nuevamente.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                });
            }
        } else {
            //console.log(NewGlmlist);
            // Mostrar alerta indicando que falta contenido
            Swal.fire({
                title: 'Advertencia',
                text: 'El contenido está vacío. Por favor, ingresa datos antes de guardar.',
                icon: 'warning',
                confirmButtonText: 'Entendido',
            });
        }
    };
    

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null); 
        setIsListVisible(true); 
    };

    const handleCloseModal2 = () => {
        setIsModalOpen2(false);
        setSelectedItem2(null); 
        setIsListVisible2(true); 
    };

    const handleCloseModal3 = () => {
        setIsModalOpen3(false);
        setSelectedItem3(null); 
        setIsListVisible3(true); 
    };

    const handleBackToList = () => {
        setIsListVisible(true);     // Regresa a mostrar la lista
        setSelectedItem(null);      // Reinicia el item seleccionado
    };

    const handleBackToList2 = () => {
        setIsListVisible2(false);     // Regresa a mostrar la lista
        setSelectedItem2(null);      // Reinicia el item seleccionado
    };

    const handleBackToList3 = () => {
        setIsListVisible3(false);     // Regresa a mostrar la lista
        setSelectedItem3(null);      // Reinicia el item seleccionado
    };
    const { links, nodes } = Links;

    const onApiRequest = async (projectId) => {
        const data = await simuladorNode.get(`links/${projectId}`);
        setLinks(data.data);
    };

    useEffect(() => {
        onApiRequest(projectId);
        updateLinks([
            {
                label: "Graph Network",
                to: `/GraphNetwork/${projectId}`,
            },
            {
                label: "Graph Time series",
                to: `/Visualizacion/${projectId}`,
            },
            {
                label: "Edit Project",
                to: `/EditProject/${projectId}`,
            },
            {
                label: "View Result",
                to: `/view/${projectId}`,
            },
            {
                label: "Data panel",
                to: `/Livepanel`,
            },
            {
                label: "File Manager",
                to: `/FileManager/${projectId}`,
            },            
        ]);
    }, [projectId, Update, Change]);

    const groupByClass = (objects) => {
        return Object.entries(objects).reduce((acc, [key, obj]) => {
            const className = obj.class;

            if (!acc[className]) {
                acc[className] = { key: className, items: [] };
            }

            acc[className].items.push({ key, ...obj });

            return acc;
        }, {});
    };

    const handleDropdownToggle = (className) => {
        setOpenDropdown(prev => ({ ...prev, [className]: !prev[className] }));
    };

    const handleDropdownToggle3 = (className) => {
        setOpenDropdown3(prev => ({ ...prev, [className]: !prev[className] }));
    };

    const handleItemClick = (item) => {
        setSelectedItem(item); // Establece el item seleccionado
        setIsListVisible(false); // Oculta la lista
    };


    const handleItemClick2 = async (item) => {
        try {
            // Ruta del archivo JSON
            const response = await fetch(`/json2/${item}.json`);
    
            if (!response.ok) {
                throw new Error(`No se pudo cargar el archivo JSON para ${item}`);
            }
    
            const jsonData = await response.json();
            console.log(`Datos del archivo ${item}.json:`, jsonData);
    
            // Procesar los datos como necesites
            setSelectedItem2({ name: item, data: jsonData });
            setIsListVisible2(true);
        } catch (error) {
            console.error(`Error al cargar el archivo JSON:`, error);
        }
    };
       
    const handleItemClick3 =  (name, item) => {
        setSelectedItem3({name: name, index: item}); // Establece el item seleccionado
        setIsListVisible3(true); // Oculta la lista
    };

    const handleDeleteItem = async(id) => {

        setGroupedObjects(prev => {
            const updatedGroupedObjects = { ...prev };
            // Lógica para eliminar el objeto con la clave correspondiente
            for (const className in updatedGroupedObjects) {
                updatedGroupedObjects[className].items = updatedGroupedObjects[className].items.filter(item => item.id !== id);
            }
            return updatedGroupedObjects;
        });

        let EditObjects = { ...objects.objects }; 
        console.log();
        for (const className in EditObjects) { 
            if(EditObjects[className].id == id){
                console.log(EditObjects[className])
                delete EditObjects[className];
                break;
            }
        }
        
        const response = await simuladorNode.put(`updateNetwork/${projectId}`, {...objects, objects:EditObjects});

        console.log(id)
        console.log({...objects, objects:EditObjects});
    };
    

    const handleDeleteItem2 = (key) => {

    };

    const handleDeleteItem3 = (key) => {
        
        let data = NewGlmlist;
        data[selectedItem3?.name].items.splice(selectedItem3?.index, 1);

        if(data[selectedItem3?.name].items.length == 0){
            delete data[selectedItem3?.name];
        }

        setList(data);

    };
    
    const handleSave = (id, nameObject, editName, value) => {
        let EditObjects = { ...objects.objects }; 
        EditObjects[nameObject][editName] = value;

        setObjects({...objects, objects:EditObjects});
    };    

    const handleSave3 = (nameObject, index) =>{
        let data = NewGlmlist;

        data[selectedItem3?.name].items[selectedItem3?.index][nameObject] = index;

        setList(data);

    };

    const handleToggle = async () => {
        
        if(mapa){
            await onApiRequest(projectId);
        }
        setMap(!mapa);
    
    };

    const handleSimulate = async () => {
        
        // Muestra la alerta de carga
        const loadingAlert = Swal.fire({
            title: 'Cargando...',
            text: 'Por favor espera mientras se obtienen los resultados.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {

            const {data} = await simuladorNode.get(`testLinks/${projectId}`);
            setLinks(data);
            
        } catch (error) {
            console.error('Error:', error);
        } finally {
            // Cierra la alerta de carga
            loadingAlert.close();
        }
    }; 

    const handleSaveObject = async () => {
        try {
            // Mostrar aviso de "Guardando"
            Swal.fire({
                title: 'Guardando',
                text: 'Por favor espera mientras se guardan los datos.',
                icon: 'info',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading(); // Mostrar animación de carga
                },
            });
    
            // Realizar la solicitud para guardar
            const response = await simuladorNode.put(`updateNetwork/${projectId}`, objects);
            setChange((prevChange) => !prevChange);
            //setObjects(response.data);            
            console.log('Guardado con éxito', response);
    
            // Cerrar el aviso de "Guardando"
            Swal.close();
    
            // Mostrar aviso de éxito
            Swal.fire({
                title: 'Éxito',
                text: 'Los datos se han guardado correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
            });
        } catch (error) {
            console.error('Error al guardar los datos:', error);
    
            // Cerrar el aviso de "Guardando"
            Swal.close();
    
            // Mostrar aviso de error
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al guardar los datos. Por favor, intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
        }
    };
      
    const handleSaveObject3 = () => {

    }

    return (
        <Container>
            <div>

                <MenuBar>
                    <MenuButton onClick={handleSimulate}>Simulate</MenuButton>
                    <MenuButton onClick={handleOpenModalView}>Edit network</MenuButton>
                    <MenuButton onClick={handleOpenModalView2}>Add components</MenuButton>
                    <MenuButton onClick={handleOpenModalView3}>View new components</MenuButton>
                    <MenuButton onClick={handleSaveSimulation}>Save components</MenuButton>
                    <MenuButton onClick={handleToggle}>Maps</MenuButton>
                </MenuBar>
                <div className="row justify-content-start">
                    <div className="col-12" >
                        {/*<ErrorBoundary>*/}
                            {(links.length>0)?(      
                                (!mapa)?(<GraphMap nodes={nodes} links={links} />):(<Graph nodes={nodes} links={links} />)
                            ):(<h1>Loading...</h1>)}
                        {/*</ErrorBoundary>*/}
                    </div>
                </div>
            </div>

            {/* Modal para agregar o editar */}
            {isModalOpen && (
                <Modal onClose={handleCloseModal}>
                    <ModalTitle>Objects list</ModalTitle>
                    {isListVisible ? ( // Muestra la lista o el componente según la visibilidad
                        <ScrollableList>
                            {Object.entries(groupedObjects).map(([className, items]) => {
                                return (
                                    <div key={className}>
                                        <ClassTitle onClick={() => handleDropdownToggle(className)}>
                                            {className} ({items.items.length})
                                            <ToggleIcon>{openDropdown[className] ? '▼' : '▶'}</ToggleIcon>
                                        </ClassTitle>
                                        {openDropdown[className] && (
                                            <DropdownContent>
                                                <ul>
                                                    {items.items.map((item, index) => (
                                                        <li key={index} onClick={() => handleItemClick(item)}>
                                                            {item.key}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </DropdownContent>
                                        )}
                                    </div>
                                );
                            })}
                        </ScrollableList>
                    ) : (
                        // Si no se muestra la lista, muestra el componente DetailView
                        <DetailView mode={false} item={selectedItem} onBack={handleBackToList} onDelete={handleDeleteItem} onSave={handleSave} onSaveObjects={handleSaveObject} jsonObject={objects.objects[selectedItem.key]}/>
                    )}
                </Modal>
            )}


            {isModalOpen2 && (
                <Modal onClose={handleCloseModal2}>
                    <ModalTitle>{selectedItem2 ? `Details for ${selectedItem2.name}` : 'Add objects'}</ModalTitle>
                    
                    { (isListVisible2 && selectedItem2 ) ?(
                        <div>
                            <DetailView mode={true} item={selectedItem2.name} onBack={handleBackToList2} onDelete={handleDeleteItem2} onSave={handleSave} onSaveObjects={handleSaveObject}  jsonObject={selectedItem2.data[selectedItem2.name]}/>
                        </div>
                    ) : (
                        <ScrollableList>
                            {EditObjects.map((objectName, index) => (
                                <div key={index}>
                                    <ClassTitle onClick={() => handleItemClick2(objectName)}>
                                        {objectName}
                                    </ClassTitle>
                                </div>
                            ))}
                        </ScrollableList>
                    )}
                </Modal>
            )}

            {isModalOpen3 && (
                <Modal onClose={handleCloseModal3}>
                    <ModalTitle>Objects list</ModalTitle>
                    { (isListVisible3 && selectedItem3 ) ? ( // Muestra la lista o el componente según la visibilidad
                        // Si no se muestra la lista, muestra el componente DetailView
                        <DetailView mode={false} item={NewGlmlist[selectedItem3?.name].items[selectedItem3?.index].name} onBack={handleBackToList3} onDelete={handleDeleteItem3} onSave={handleSave3} onSaveObjects={handleSaveObject3} jsonObject={ NewGlmlist[selectedItem3?.name].items[selectedItem3?.index] }/>
                    ) : (

                        <ScrollableList>
                            {Object.entries(NewGlmlist).map(([className, items]) => {
                                return (
                                    <div key={className}>
                                        <ClassTitle onClick={() => handleDropdownToggle3(className)}>
                                            {className} ({items.items.length})
                                            <ToggleIcon>{openDropdown3[className] ? '▼' : '▶'}</ToggleIcon>
                                        </ClassTitle>
                                        {openDropdown3[className] && (
                                            <DropdownContent>
                                                <ul>
                                                    {items.items.map((item, index) => (
                                                        <li key={index} onClick={() => handleItemClick3(className,index)}>
                                                            {item.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </DropdownContent>
                                        )}
                                    </div>
                                );
                            })}
                        </ScrollableList>                        
                        
                    )}
                </Modal>
            )}

        </Container>
    );
};

// Estilos como los definidos anteriormente...
// Estilos como los definidos anteriormente...

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  max-width: 100vw;
  background-color: ${(props) => props.theme.bg}; /* Cambia el color de fondo según el tema */
  color: ${(props) => props.theme.text}; /* Cambia el color del texto según el tema */
`;



const ModalTitle = styled.h2`
  margin-bottom: 10px;
  color: ${(props) => props.theme.text}; /* Cambia el color del texto según el tema */
`;

const ScrollableList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
  background-color: ${(props) => props.theme.bg}; /* Cambia el color de fondo según el tema */

  h3 {
    margin: 10px 0;
  }

  ul {
    padding: 0;
    list-style: none;
  }

  li {
    padding: 8px 10px;
    border-bottom: 1px solid ${(props) => props.theme.border}; /* Cambia el borde basado en el tema */
  }
`;

const DropdownContent = styled.div`
  margin-bottom: 20px;
  border: 1px solid ${(props) => props.theme.border}; /* Cambia el borde según el tema */
  border-radius: 4px;
  padding: 10px;
  background-color: ${(props) => props.theme.bg}; /* Cambia el color de fondo según el tema */
`;

const ClassTitle = styled.div`
  cursor: pointer;
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${(props) => props.theme.border}; /* Cambia el borde según el tema */
  margin-bottom: 10px;
  background-color: ${(props) => props.theme.bg}; /* Cambia el color de fondo según el tema */
  color: ${(props) => props.theme.text}; /* Cambia el color del texto según el tema */
`;

const ToggleIcon = styled.span`
  margin-left: 10px;
`;

const MenuBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 20px;
  background-color: ${(props) => props.theme.bg};
  border-bottom: 2px solid ${(props) => props.theme.border};
  margin-bottom: 10px;
`;

const MenuButton = styled.button`
  background-color: transparent;
  border: 2px solid ${(props) => props.theme.primary || '#007bff'};
  color: ${(props) => props.theme.primary || '#007bff'};
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: ${(props) => props.theme.primary || '#007bff'};
    color: ${(props) => props.theme.bg};
  }
`;