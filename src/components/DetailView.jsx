import React from 'react';
import DynamicForm from './DynamicForm';
import styled from 'styled-components'; // Asegúrate de que styled-components esté instalado
import Swal from 'sweetalert2'; // Importa SweetAlert2
import AddDynamicForm from './AddDynamicForm';

const DetailView = ({ mode, item, onBack, onDelete, onSave, onSaveObjects,  jsonObject }) => {
    if (!item) return null; // Si no hay item seleccionado, no renderiza nada

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: `¿Estás seguro de que deseas borrar ${item.key?(item.key):(item)}?`,
            text: "¡Esta acción no se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Borrar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            onDelete(item.id?(item.id):(item)); // Llama a la función para borrar el objeto
            onBack();
            Swal.fire(
                '¡Borrado!',
                `${item.key?(item.key):(item)} ha sido borrado.`,
                'success'
            );

        }
    };

    return (
        <div>

            { (mode) ? (
                <>
                    <button className="btn btn-outline-primary m-2" onClick={onBack}>Regresar a la lista</button> {/* Botón para regresar */}
                </>)
                :(
                <>
                    <button className="btn btn-outline-primary m-2" onClick={onBack}>Regresar a la lista</button> {/* Botón para regresar */}
                    <button className="btn btn-outline-primary m-2" onClick={handleDelete}>Borrar</button> {/* Botón para borrar el objeto */}
                    { item.key?(<button className="btn btn-outline-primary m-2" onClick={onSaveObjects}>Guardar</button>):(<></>)} 
                </>
            )}
            <ScrollableContainer>

                {mode? (<>
                            <AddDynamicForm name={item} internalJson={jsonObject} onBack={onBack}/> 
                        </>)
                      :(<>
                            <DynamicForm name={item.key?(item.key):(item) } internalJson={jsonObject} onSave={onSave} />
                        </>)}

            </ScrollableContainer>
        </div>
    );
};

// Estilos al final
const ScrollableContainer = styled.div`
    max-height: 400px; /* Altura máxima del contenedor para activar el scroll */
    overflow-y: auto; /* Habilita el scroll vertical */
    padding: 16px; /* Espaciado interno */
    border: 1px solid #ccc; /* Borde opcional */
    border-radius: 4px; /* Esquinas redondeadas opcionales */
`;

export default DetailView;
