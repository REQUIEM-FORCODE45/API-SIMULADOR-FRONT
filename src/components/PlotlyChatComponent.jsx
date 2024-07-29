import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const PlotlyChartComponent = ({ projectId, filename }) => {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toISOString();
    };

    useEffect(() => {
        fetch(`http://localhost:3000/get-csv-data/${projectId}/${filename}`)
            .then(response => response.json())
            .then(data => {
                setData(data);
                if (data.length > 0) {
                    setColumns(Object.keys(data[0]).filter(key => key !== 'timestamp'));
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }, [projectId, filename]);

    const timestamps = data.map(entry => formatTimestamp(entry.timestamp));

    const plotData = columns.map(column => ({
        x: timestamps,
        y: data.map(entry => parseFloat(entry[column])),
        type: 'scatter',
        mode: 'lines',
        name: column,
        line: { color: getRandomColor() }
    }));

    function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, 1)`;
    }

    return (
        <div className='container-sm p-1'>
            <Plot
                data={plotData}
                layout={{
                    title: 'Data Over Time',
                    xaxis: {
                        title: 'Timestamp'
                    },
                    yaxis: {
                        title: 'Value'
                    },
                    autosize: true
                }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default PlotlyChartComponent;