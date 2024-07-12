import { useState } from "react";
import { organizeByType } from "../helpers/organizeByType";


export const usePowerData = (data = {}) => {
    const [formatPower, setFormatPower] = useState({
        formattedData:{},
        listData:{}, 
    });

    const formater = ( ) =>{
        const fData = organizeByType( data );
        setFormatPower({
            formattedData:fData,
            listData:{},
        })
    }
    
    return;    
}