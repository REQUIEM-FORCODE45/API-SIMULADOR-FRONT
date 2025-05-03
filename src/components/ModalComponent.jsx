import React from 'react';
import styled from 'styled-components';

const Modal = ({ onClose, children }) => {
    return (
        <ModalOverlay>
            <ModalContent>
                <CloseButton onClick={onClose}>X
                </CloseButton>
                {children} {/* Aquí se renderiza el contenido pasado como hijo */}
            </ModalContent>
        </ModalOverlay>
    );
}

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: ${(props) => props.theme.bg};
    padding: 20px;
    border-radius: 5px;
    width: 40vw;
    max-width: 100%;
    position: relative;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    color: ${(props) => props.theme.border};
    border: none;
    font-size: 18px;
    cursor: pointer;
`;

export default Modal;
