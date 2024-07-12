export const organizeByType = (data) =>{

    const types = [...new Set(Object.values(data).map(item => item.class))];
    const organizedData = {};

 
    types.forEach(type => {
    organizedData[type] = [];
    });


    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const item = data[key];
            if (organizedData[item.class]) {
                organizedData[item.class].push( {name:key , ...item } );
            }
        }
    }

    const columns = types.reduce((acc, type) => {
        if (organizedData[type].length > 0) {
        acc[type] = Object.keys(organizedData[type][0]).map(key => {
            return {
            Header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            accessor: key
            };
        });
        }
        return acc;
    }, {});


    return {organizedData, columns, types};
}