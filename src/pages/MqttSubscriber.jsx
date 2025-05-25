import React, { useEffect, useState, useRef, useContext } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import simuladorNode from '../api/SimuladorNodes';
import styled from 'styled-components';
import RelaySwitch from '../components/RelaySwitch';
import { ThemeContext } from '../context/ThemeContext'; 

Modal.setAppElement('#root');
const Light = {
    background: '#ffffff',
    textColor: '#333333',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
};

const Dark = {
    background: '#2c2c2c',
    textColor: '#f0f0f0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
};

const FixedMenu = styled.div`
    
    top: 0;
    z-index: 900;
    
    background: ${({ themeStyle }) => themeStyle.background};
    color: ${({ themeStyle }) => themeStyle.textColor};
    padding: 20px;
    box-shadow: ${({ themeStyle }) => themeStyle.boxShadow};
    border-radius: 12px 12px 12px 12px;
`;

const GraphsContainer = styled.div`
    padding-top: 20px;
    margin-top: 20px;
    margin-bottom: 20px;
    padding-bottom: 20px;
`;

const WebSocketComponent = () => {
    const { theme, setTheme } = useContext(ThemeContext);  
    const themeStyle = theme === "light" ? Light : Dark;
    const [sensorData, setSensorData] = useState({
        s1: { v: [], c: [], p: [], e: [], f: [], pf: [] },
        s2: { v: [], c: [], p: [], e: [], f: [], pf: [] },
        s3: { v: [], c: [], p: [], e: [], f: [], pf: [] },
    });
    const [timestamps, setTimestamps] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrace, setSelectedTrace] = useState(null);
    const [modalTimestamps, setModalTimestamps] = useState([]);
    const [modalTraceData, setModalTraceData] = useState([]);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [filteredData, setFilteredData] = useState([]);
    const [activeSensor, setActiveSensor] = useState('s1');
    const [relayState, setRelayState] = useState({
        r1: "OFF",
        r2: "OFF",
        r3: "OFF",
        r4: "OFF",
        r5: "OFF",
        r6: "OFF"
    });
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3000');
        socketRef.current = socket;
        socket.onmessage = (event) => {
            const received = JSON.parse(event.data);
            const sensors = ['s1', 's2', 's3'];
            setSensorData((prevSensorData) => {
                const updatedSensorData = { ...prevSensorData };
                sensors.forEach((sensor) => {
                    if (received[sensor]) {
                        const sensorReceived = received[sensor];
                        updatedSensorData[sensor] = {
                            v: [...prevSensorData[sensor].v, sensorReceived.v].slice(-100),
                            c: [...prevSensorData[sensor].c, sensorReceived.c].slice(-100),
                            p: [...prevSensorData[sensor].p, sensorReceived.p].slice(-100),
                            e: [...prevSensorData[sensor].e, sensorReceived.e].slice(-100),
                            f: [...prevSensorData[sensor].f, sensorReceived.f].slice(-100),
                            pf: [...prevSensorData[sensor].pf, sensorReceived.pf].slice(-100),
                        };
                    }
                });
                return updatedSensorData;
            });

            const currentTime = new Date().toLocaleTimeString();
            setTimestamps((prevTimestamps) => {
                const updatedTimestamps = [...prevTimestamps, currentTime];
                if (updatedTimestamps.length > 100) {
                    updatedTimestamps.shift();
                }
                return updatedTimestamps;
            });

            if (isModalOpen && selectedTrace) {
                setModalTimestamps((prevTimestamps) => {
                    const updatedTimestamps = [...prevTimestamps, currentTime];
                    if (updatedTimestamps.length > 100) {
                        updatedTimestamps.shift();
                    }
                    return updatedTimestamps;
                });

                setModalTraceData((prevData) => {
                    const newValue = received[activeSensor] ? received[activeSensor][selectedTrace.dataKey] : null;
                    const updatedData = [...prevData, newValue].slice(-100);
                    return updatedData;
                });
            }
        };

        return () => {
            socket.close();
        };
    }, [isModalOpen, selectedTrace, activeSensor]);

    const toggleRelay = (relay) => {
        setRelayState((prevState) => {
            const newState = { ...prevState, [relay]: prevState[relay] === "OFF" ? "ON" : "OFF" };
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify(newState));
            }
            return newState;
        });
    };

    const fetchFilteredData = async () => {
        try {
            const response = await simuladorNode.get('/api/livepanel', {
                params: {
                    desde: startDate.toISOString(),
                    hasta: endDate.toISOString(),
                },
            });
            // Se espera que la respuesta tenga la forma: { s1Data, s2Data, s3Data }
            const { s1Data, s2Data, s3Data } = response.data;
            // Actualiza filteredData y, para manejo de timestamps, toma el del sensor 1 (o podrías usar el activo)
            setFilteredData({ s1Data, s2Data, s3Data });
            setTimestamps(s1Data.map(item => item.timestamp));
        } catch (error) {
            console.error("Error al obtener los datos filtrados:", error);
        }
    };

    const exportToCSV = async () => {
        setIsExportModalOpen(true);
    };

    const downloadCSV = async () => {
        try {
            let csvContent = "data:text/csv;charset=utf-8,";
            // Se incluye la cabecera con las 7 columnas
            csvContent += "Timestamp,Voltaje,Corriente,Potencia,Energia,Frecuencia,Factor Potencia\n";

            // Selecciona los datos del sensor activo (ejemplo 's1Data' si activeSensor es 's1')
            const sensorKey = `${activeSensor}Data`;
            const sensorData = filteredData[sensorKey] || [];

            sensorData.forEach(item => {
                csvContent += `${item.timestamp},${item.v},${item.c},${item.p},${item.e},${item.f},${item.pf}\n`;
            });

            const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `filtered_livepanel_data_${activeSensor}.csv`);
            setIsExportModalOpen(false);
        } catch (error) {
            console.error("Error al exportar los datos CSV:", error);
        }
    };

    const downloadPlayerFile = async () => {
        try {
            let fileContent = "data:text/plain;charset=utf-8,";
            // Cabecera con las 7 columnas
            fileContent += "Timestamp,Voltaje,Corriente,Potencia,Energia,Frecuencia,Factor Potencia\n";

            const sensorKey = `${activeSensor}Data`;
            const sensorData = filteredData[sensorKey] || [];

            sensorData.forEach(item => {
                // Formatea el timestamp si es necesario
                const formattedDate = new Date(item.timestamp).toISOString().replace('T', ' ').slice(0, 19);
                fileContent += `${formattedDate},${item.v},${item.c},${item.p},${item.e},${item.f},${item.pf}\n`;
            });

            const blob = new Blob([decodeURIComponent(encodeURI(fileContent))], { type: 'text/plain;charset=utf-8;' });
            saveAs(blob, `filtered_livepanel_data_${activeSensor}.player`);
            setIsExportModalOpen(false);
        } catch (error) {
            console.error("Error al exportar los datos del player:", error);
        }
    };

    const currentData = sensorData[activeSensor];
    const traces = [
        {
            data: currentData.v,
            name: 'Voltaje',
            color: 'blue',
            yTitle: 'Voltaje (V)',
            dataKey: 'v'
        },
        {
            data: currentData.c,
            name: 'Corriente',
            color: 'red',
            yTitle: 'Corriente (A)',
            dataKey: 'c'
        },
        {
            data: currentData.pf,
            name: 'Factor de Potencia',
            color: 'green',
            yTitle: 'Factor de Potencia',
            dataKey: 'pf'
        },
        {
            data: currentData.f,
            name: 'Frecuencia',
            color: 'orange',
            yTitle: 'Frecuencia (Hz)',
            dataKey: 'f'
        },
        {
            data: currentData.p,
            name: 'Potencia',
            color: 'black',
            yTitle: 'Potencia (W)',
            dataKey: 'p'
        },
        {
            data: currentData.e,
            name: 'Energia',
            color: 'black',
            yTitle: 'Energia (J)',
            dataKey: 'e'
        },
    ];

    const openModal = (trace) => {
        setSelectedTrace(trace);
        setModalTimestamps(timestamps);
        setModalTraceData(trace.data);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTrace(null);
        setModalTimestamps([]);
        setModalTraceData([]);
    };

    return (
        <div style={{ margin: '0 auto', padding: '0 20px', maxWidth: '90%', minHeight: '100vh' }}>
            <FixedMenu themeStyle={themeStyle}>
                <h1 className="text-center mb-4">Panel Data</h1>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    {Object.keys(relayState).map((relayKey) => (
                        <RelaySwitch
                            key={relayKey}
                            relayKey={relayKey}
                            isOn={relayState[relayKey] === "ON"}
                            toggleRelay={toggleRelay}
                        />
                    ))}
                </div>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <button className={`btn ${activeSensor === 's1' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveSensor('s1')}>
                        Sensor 1
                    </button>
                    <button className={`btn ${activeSensor === 's2' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveSensor('s2')}>
                        Sensor 2
                    </button>
                    <button className={`btn ${activeSensor === 's3' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveSensor('s3')}>
                        Sensor 3
                    </button>
                    <button onClick={exportToCSV} className="btn btn-primary btn-lg shadow">
                        Download Data
                    </button>
                </div>
                <div className="text-center mt-4">

                </div>
            </FixedMenu>

            <GraphsContainer>
                <div className="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
                    {traces.map((trace, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '10px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '15px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                            }}
                            onClick={() => openModal(trace)}
                        >
                            <Plot
                                data={[
                                    {
                                        x: timestamps,
                                        y: trace.data,
                                        mode: 'lines+markers',
                                        name: trace.name,
                                        line: { color: trace.color },
                                    },
                                ]}
                                layout={{
                                    title: trace.name,
                                    xaxis: { title: 'Hora' },
                                    yaxis: { title: trace.yTitle },
                                    showlegend: true,
                                    autosize: true,
                                }}
                                style={{ width: '700px', height: '400px' }}
                            />
                        </div>
                    ))}
                </div>
            </GraphsContainer>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Gráfica Ampliada"
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        height: '80%',
                        padding: '20px',
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                }}
            >
                {selectedTrace && (
                    <>
                        <h2>{selectedTrace.name}</h2>
                        <Plot
                            data={[
                                {
                                    x: modalTimestamps,
                                    y: modalTraceData,
                                    mode: 'lines+markers',
                                    name: selectedTrace.name,
                                    line: { color: selectedTrace.color },
                                },
                            ]}
                            layout={{
                                title: selectedTrace.name,
                                xaxis: { title: 'Hora' },
                                yaxis: { title: selectedTrace.yTitle },
                                showlegend: true,
                                autosize: true,
                            }}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </>
                )}
                <button onClick={closeModal} style={{ marginTop: '20px' }} className="btn btn-danger">
                    Cerrar
                </button>
            </Modal>
            <Modal
                isOpen={isExportModalOpen}
                onRequestClose={() => setIsExportModalOpen(false)}
                contentLabel="Export Data"
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        transform: 'translate(-50%, -50%)',
                        width: '50%',
                        height: '60%',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                }}
            >
                <h2 style={{ textAlign: 'center', marginBottom: '60px' }}>Export Data</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'center', flex: '1', marginRight: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>From:</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            dateFormat="yyyy/MM/dd HH:mm"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ textAlign: 'center', flex: '1', marginLeft: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>To:</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            dateFormat="yyyy/MM/dd HH:mm"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '100px' }}>
                    <button onClick={fetchFilteredData} className="btn btn-primary">
                        Filter Data
                    </button>
                    <button onClick={downloadPlayerFile} className="btn btn-success">
                        Download .player
                    </button>
                    <button onClick={downloadCSV} className="btn btn-success">
                        Download CSV
                    </button>
                    <button onClick={() => setIsExportModalOpen(false)} className="btn btn-danger">
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
};

const Container = styled.div`
    min-height: 100vh;
    max-width: 100vw;
`;

export default WebSocketComponent;

