import { useEffect, useState } from "react";

export const useFetch = (url, ops) => {

    const [dataReceive, setDataReceive] = useState([]);
    const [dataSend, setDataSend] = useState({});
    const [loading, setLoading] = useState(true);

    const onSetDataSend = async (url, ops) => {
      setLoading(true);
      const resp =  (ops.length === 0)?(await fetch(url)):(await fetch(url, ops));
      const data = await resp.json();
      setDataSend(ops.body);
      setDataReceive(data);
      setLoading(false)
    }

    useEffect(()=>{
        onSetDataSend(url, ops);
    },[])
  
    return ({
        onSetDataSend,
        dataSend,
        loading,
        dataReceive,
    })
}
