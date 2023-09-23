

import CustomTable from "../components/custom/CustomTable";
import Loader from "../components/custom/Loader";
import { useCMA } from '@contentful/react-apps-toolkit';
import { useEffect, useState } from 'react';
import { Box, Paragraph,Accordion,Text } from '@contentful/f36-components';

export default function Export() {
 
    const [contentTypes, setContentTypes] = useState([]);

    const cma = useCMA();
 
    useEffect(() => {
        console.log("useEffect main Effect");
        function getAllContentTypes() {
        cma.contentType.getMany({}).then((entries:any) => {
            setContentTypes(entries.items);
            })
            .catch(() => []);
        }
        getAllContentTypes();
    }, []);

    return(
      <Box marginTop="spacingXl">
        <Paragraph>Please select Content Type to export </Paragraph>
          <Accordion>
          {contentTypes?.length===0 && <Loader/>}  
          {contentTypes?.length!==0 && contentTypes.map((c_type:any,index:number)=>{return (<Accordion.Item key={index+Math.random()} title={c_type.name}><Text><CustomTable contentTypeEntry={c_type}/></Text></Accordion.Item>)})}       
          </Accordion>
      </Box>
    );
}