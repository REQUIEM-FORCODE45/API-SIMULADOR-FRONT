import React from 'react';
import styled from 'styled-components';

const ToggleSwitch = styled.label`
    position: relative;
    display: inline-block;
    width: 100px;
    height: 50px;
`;

const SwitchInput = styled.input`
    opacity: 0;
    width: 0;
    height: 0;
    &:not(:checked) + span {
        background-color: #87CEEB; /* azul oscuro para OFF */
    }
    &:checked + span {
        background-color: #77dd77; /* verde pastel para ON */
    }
    &:checked + span:after {
        display: block;
    }        
`;

const Slider = styled.span`
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: 0.4s;
    border-radius: 50px;
    /* Para el estado OFF: la etiqueta "OFF" se muestra a la derecha */
    &:not(:checked)::before {
        content: "OFF";
        position: absolute;
        right: 12px;
        top: 12px;
        font-size: 16px;
        color: white;
        font-weight: bold;
    }
    /* Cuando está encendido, se muestra "ON" y se ubica a la izquierda */
    ${SwitchInput}:checked + &::before {
        content: "ON";
        position: absolute;
        left: 1px;
        top: 12px;
        font-size: 16px;
        color: white;
        font-weight: bold;
    }
    /* La bola siempre se muestra y cambia de posición */
    &:after {
        content: "";
        position: absolute;
        width: 30px;
        height: 30px;
        left: 6px;
        bottom: 10px;
        background-color: white;
        border-radius: 50%;
        transition: transform 0.15s ease;
    }
    ${SwitchInput}:checked + &::after {
        left: calc(100% - 36px);  // 36px = 30px (bola) + 6px margen
    }        
`;

const RelaySwitch = ({ relayKey, isOn, toggleRelay }) => (
    <ToggleSwitch>
        <SwitchInput
            type="checkbox"
            checked={isOn}
            onChange={() => toggleRelay(relayKey)}
        />
        <Slider />
    </ToggleSwitch>
);

export default React.memo(RelaySwitch);