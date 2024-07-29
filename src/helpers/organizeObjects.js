export const organizeObjects = (objects) => {

    if(!objects) return { classifiedObjects: [], columns: [], uniqueNames:[] };

    //const uniqueNames = [...new Set(objects.map(obj =>{return {name:obj.name, status:false }}))];
    const unique = [...new Set(Object.values(objects).map(item => item.class))];
    const uniqueNames = unique.map(name=>{return {name, status:false }});

    const classifiedObjects = uniqueNames.reduce((acc, obj) => {
        acc[obj.name] = [];
        return acc;
    }, {});
    
    console.log(classifiedObjects);
    /*
    objects.forEach(obj => {
        const name = obj.name.split(':')[0];
        classifiedObjects[name].push(obj.attributes);
    });*/

    for (const key in objects) {
        if (objects.hasOwnProperty(key)) {
            const item = objects[key];
            if (classifiedObjects[item.class]) {
                classifiedObjects[item.class].push( {name:key , ...item } );
            }
        }
    }    
    
    const columns = uniqueNames.reduce((acc, {name}) => {
        if (classifiedObjects[name].length > 0) {
            acc[name] = Object.keys(classifiedObjects[name][0]).map(key => {
                return {
                    Header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                    accessor: key
                };
            });
        }
        return acc;
    }, {});

   return { classifiedObjects, columns, uniqueNames };
}