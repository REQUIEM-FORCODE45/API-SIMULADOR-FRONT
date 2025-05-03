import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import simuladorNode from '../api/SimuladorNodes';
import styled from 'styled-components';

Modal.setAppElement('#root');

const WebSocketComponent = () => {
    const [data, setData] = useState({
        /*
        voltage: [],
        corriente: [],
        factor_potencia: [],
        fase: [],*/
        v:[],
        c:[],
        p:[],
        e:[],
        f:[],
        pf:[],
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

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3000');

        socket.onmessage = (event) => {
            const received = JSON.parse(event.data);
            const receivedData = received.s1 
            const currentTime = new Date().toLocaleTimeString();

            setData((prevData) => {
                const updatedData = {
                    v: [...prevData.v, receivedData.v],
                    c: [...prevData.c, receivedData.c],
                    p: [...prevData.p, receivedData.p],
                    e: [...prevData.e, receivedData.e],
                    f: [...prevData.f, receivedData.f],
                    pf: [...prevData.pf, receivedData.pf],
                };
                const maxDataLength = 100;
                for (const key in updatedData) {
                    if (updatedData[key].length > maxDataLength) {
                        updatedData[key] = updatedData[key].slice(-maxDataLength);
                    }
                }
                return updatedData;
            });

            setTimestamps((prevTimestamps) => {
                const updatedTimestamps = [...prevTimestamps, currentTime];
                if (updatedTimestamps.length > 100) {
                    updatedTimestamps.shift();
                }
                return updatedTimestamps;
            });

            // Actualizar los datos del modal si está abierto
            if (isModalOpen) {
                setModalTimestamps((prevTimestamps) => {
                    const updatedTimestamps = [...prevTimestamps, currentTime];
                    if (updatedTimestamps.length > 100) {
                        updatedTimestamps.shift();
                    }
                    return updatedTimestamps;
                });

                setModalTraceData((prevData) => {
                    const updatedData = [...prevData, selectedTrace.dataKey ? receivedData[selectedTrace.dataKey] : null];
                    if (updatedData.length > 100) {
                        updatedData.shift();
                    }
                    return updatedData;
                });
            }
        };

        return () => {
            socket.close();
        };
    }, [isModalOpen, selectedTrace]);


    const fetchFilteredData = async () => {
        try {
            const response = await simuladorNode.get('/api/livepanel', {
                params: {
                    desde: startDate.toISOString(),
                    hasta: endDate.toISOString(),
                },
            });
            const filteredData = response.data;
    
            setTimestamps(filteredData.map(item => item.timestamp));
            setFilteredData({
                voltage: filteredData.map(item => item.voltaje),
                corriente: filteredData.map(item => item.corriente),
                factor_potencia: filteredData.map(item => item.factor_potencia),
                fase: filteredData.map(item => item.fase),
            });
        } catch (error) {
            console.error("Error al obtener los datos filtrados:", error);
        }
    };
    

    const filterDataByDate = () => {
        const filteredTimestamps = timestamps.filter((timestamp, index) => {
            const timestampDate = new Date(timestamp);
            return timestampDate >= startDate && timestampDate <= endDate;
        });
        
        const filteredVoltage = data.voltage.filter((_, index) => filteredTimestamps.includes(timestamps[index]));
        const filteredCorriente = data.corriente.filter((_, index) => filteredTimestamps.includes(timestamps[index]));
        const filteredFactorPotencia = data.factor_potencia.filter((_, index) => filteredTimestamps.includes(timestamps[index]));
        const filteredFase = data.fase.filter((_, index) => filteredTimestamps.includes(timestamps[index]));

        setFilteredData({
            voltage: filteredVoltage,
            corriente: filteredCorriente,
            factor_potencia: filteredFactorPotencia,
            fase: filteredFase,
        });
    };

    const exportToCSV = async () => {
        setIsExportModalOpen(true);
    };

    const downloadCSV = async () => {
        try {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Timestamp,Voltaje,Corriente,Factor Potencia,Fase\n";

            filteredData.voltage.forEach((item, index) => {
                csvContent += `${timestamps[index]},${item},${filteredData.corriente[index]},${filteredData.factor_potencia[index]},${filteredData.fase[index]}\n`;
            });

            const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'filtered_livepanel_data.csv');
            setIsExportModalOpen(false);
        } catch (error) {
            console.error("Error al exportar los datos:", error);
        }
    };

    const downloadPlayerFile = async () => {
        try {
            let fileContent = "data:text/plain;charset=utf-8,";
            fileContent += "Timestamp,Voltaje,Corriente,Factor Potencia,Fase\n";
    
            // Formatear las fechas y construir el contenido del archivo
            filteredData.voltage.forEach((item, index) => {
                const formattedDate = new Date(timestamps[index]).toISOString().replace('T', ' ').slice(0, 19);
                fileContent += `${formattedDate},${item},${filteredData.corriente[index]},${filteredData.factor_potencia[index]},${filteredData.fase[index]}\n`;
            });
    
            // Crear el archivo .player
            const blob = new Blob([decodeURIComponent(encodeURI(fileContent))], { type: 'text/plain;charset=utf-8;' });
            saveAs(blob, 'filtered_livepanel_data.player');
            setIsExportModalOpen(false);
        } catch (error) {
            console.error("Error al exportar los datos:", error);
        }
    };
    

    if (timestamps.length === 0) {
        return <div> <Container> Cargando datos... </Container></div>;
    }

    const traces = [
        { 
            data: data.v, 
            name: 'Voltaje', 
            color: 'blue', 
            yTitle: 'Voltaje (V)', 
            dataKey: 'v'
        },
        { 
            data: data.c, 
            name: 'Corriente', 
            color: 'red', 
            yTitle: 'Corriente (A)', 
            dataKey: 'c'
        },
        { 
            data: data.pf, 
            name: 'Factor de Potencia', 
            color: 'green', 
            yTitle: 'Factor de Potencia', 
            dataKey: 'pf'
        },
        { 
            data: data.f, 
            name: 'Fase', 
            color: 'orange', 
            yTitle: 'Fase (°)', 
            dataKey: 'f'
        },
        { 
            data: data.p, 
            name: 'Potencia', 
            color: 'black', 
            yTitle: 'Potencia (W)', 
            dataKey: 'p'
        },
        { 
            data: data.e, 
            name: 'Energia', 
            color: 'black', 
            yTitle: 'Energi (J)', 
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
    
        <div
            style={{
                margin: '0 auto',
                padding: '0 20px',
                maxWidth: '100%',
                minHeight: '100vw',
            }}
        >   
                <h1 className="text-center mb-4">Panel Data</h1>

                <div
                    className="row"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '40px',
                    }}
                >
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

                <div className="text-center mt-4">
                    <button
                        onClick={exportToCSV}
                        className="btn btn-primary btn-lg shadow"
                    >
                        Download Data
                    </button>
                </div>
            
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

