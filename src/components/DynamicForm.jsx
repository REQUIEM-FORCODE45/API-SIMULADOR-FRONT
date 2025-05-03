import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "../context/ThemeContext";

const DynamicForm = ({ name, internalJson, onSave }) => {
    const [jsonFields, setJsonFields] = useState([]);
    const [formData, setFormData] = useState({});
    const { theme } = useContext(ThemeContext);
    // Lista de campos que serán de solo lectura
    const readOnlyFields = ["id", "class", "rank", "clock", "rng_state", "guid", "flags"];
    useEffect(() => {
        setJsonFields(Object.keys(internalJson));
        setFormData(internalJson);
        console.log(internalJson);
    }, [internalJson]);

   // Manejador de cambios en el formularioc
   const handleChange = (event) => {

        if(internalJson.id){

          const { name:nombre, value, type, checked } = event.target;
          const newValue = type === "checkbox" ? checked : value;
          setFormData({
          ...formData,
          [nombre]: newValue,
          });
          onSave(internalJson.id, name, nombre, value);

        }else{
          const { name:nombre, value, type, checked } = event.target;
          const newValue = type === "checkbox" ? checked : value;
          setFormData({
            ...formData,
            [nombre]: newValue,
          });

          onSave(nombre, value);

        }
   };

    return (
        <PageContainer>
            <FormContainer>
                <h1>{name}</h1>
                <hr />
                <form>
                {jsonFields.map((field) => (
                    <div className="mb-3 row" key={field}>
                    <label htmlFor={field} className="col-sm-4 col-form-label">
                        {field}
                    </label>
                    <div className="col-sm-8">
                        {typeof formData[field] === "boolean" ? (
                        <CheckboxContainer>
                            
                            <input
                            type="checkbox"
                            name={field}
                            checked={formData[field]}
                            onChange={handleChange}
                            disabled={readOnlyFields.includes(field)} // Si es de solo lectura, se desactiva
                            />
                        </CheckboxContainer>
                        ) : (
                        <input
                            type="text"
                            name={field}
                            value={formData[field]}
                            className="form-control"
                            onChange={handleChange}
                            readOnly={readOnlyFields.includes(field)} // Campo de solo lectura
                            style={{
                            backgroundColor: (theme == "light")?(readOnlyFields.includes(field) ? "#e9ecef" : "white"): (readOnlyFields.includes(field) ? "#9e9e9e":"#cfcfcf" ), // Fondo gris para solo lectura
                            }}
                        />
                        )}
                    </div>
                    </div>
                ))}
                </form>
                <Divider />
            </FormContainer>
        </PageContainer>
    );
};

export default DynamicForm;

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height-max: 200vh;
  width-max: 100vw;
  color: ${(props) => props.theme.text};
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 50vw;
  padding: 20px;
  background-color: ${(props) =>  props.theme.bg};
  border-radius: 8px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${(props) => props.theme.bg3};
  margin: 20px 0;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  height: 38px; /* Alinea el checkbox con los inputs de texto */
  input {
    width: 18px;
    height: 18px;
  }
`;
