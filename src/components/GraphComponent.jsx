import React, { useContext, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SidebarContext } from '../context/SidebarContext';
import { ThemeContext } from '../context/ThemeContext';


const Graph = ({ nodes, links }) => {
  const svgRef = useRef();
  const gRef = useRef();
  const zoomRef = useRef(d3.zoomIdentity);
  const [visibleCharacteristics, setVisibleCharacteristics] = useState({});
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const width = 1500;
    const height = 600;
  
    const svg = d3.select(svgRef.current)
      .attr('width', '80vw')
      .attr('height', '88vh')
      .style('border', '1px solid black');
    
    const g = svg.append('g');
    gRef.current = g;

    const zoom = d3.zoom()
      .scaleExtent([0.1, 100])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        zoomRef.current = event.transform;
      });

    svg.call(zoom)
      .on("dblclick.zoom", null);  // Desactivar zoom con doble clic
    
    // Aplicar el zoom guardado
    svg.call(zoom.transform, zoomRef.current);
 
    const calculateFontSize = (text) => {
      const baseSize = 14;
      const maxLength = 10;
    
      if (text.length > maxLength) {
        return baseSize - (text.length - maxLength);
      }
      
      return baseSize;
    }
  
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 4);
  
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        event.stopPropagation();
        setVisibleCharacteristics(prev => ({
          ...prev,
          [d.id]: !prev[d.id]
        }));
      });
  
    const circleRadius = 15;
  
    node.append('circle')
      .attr('r', circleRadius)
      .attr('fill', '#007bff');
  
    node.append('text')
      .attr('y', -25)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', d => `${calculateFontSize(d.label)}px`)
      .attr('fill', (theme === 'dark') ? '#fff' : '#000')
      .text(d => d.label);
  
    node.append('text')
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', (theme === 'dark') ? '#fff' : '#000')
      .selectAll('tspan')
      .data(d => visibleCharacteristics[d.id] ? d.characteristics : [])
      .enter()
      .append('tspan')
      .attr('x', 0)
      .attr('dy', '1.5em')
      .text(d => d);
  
    const linkLabels = g.append('g')
      .selectAll('text')
      .data(links)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', (theme === 'dark') ? '#fff' : '#000')
      .text(d => d.label)
      .style('opacity', 0);
  
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .alphaDecay(0.05) // Aumenta la inercia
      .on('tick', updatePositions);


    setTimeout(() => {
      simulation.alphaTarget(1).restart();  // Reducir el alphaTarget a 0 para que la simulación se detenga
    }, 5);     

    // Detener la simulación después de 3 segundos (ajusta el tiempo según tus necesidades)
    setTimeout(() => {
      simulation.alphaTarget(0);  // Reducir el alphaTarget a 0 para que la simulación se detenga
    }, 8000); 

    function updatePositions() {
      node.attr('transform', d => `translate(${d.x},${d.y})`);
      link.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
  
      linkLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);
    }
 
    simulation.stop();
    updatePositions();
  
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.5).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
  
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
  
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      // No reseteamos d.fx y d.fy a null, manteniendo la posición fija
    }
  
    link.on('mouseover', function () {
      d3.select(this).style('stroke', 'red');
      linkLabels.style('opacity', 1);
    })
      .on('mouseout', function () {
        d3.select(this).style('stroke', '#999');
        linkLabels.style('opacity', 0);
      });
  
    return () => {
      svg.selectAll('*').remove();
    };
  }, [visibleCharacteristics, nodes, links, theme]);
  
  return <svg ref={svgRef}></svg>;
};


export default Graph;