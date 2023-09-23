import { Fragment, useState } from "react";
import { Checkbox, Table,Button} from '@contentful/f36-components';
import CheckboxControlled from "./CheckboxControlled";
import { getCSVFile } from "../../utils/csvActions";
import { useCMA } from '@contentful/react-apps-toolkit';
import {ACCEPTABLE_TYPE,FALSE_AS_STRING,TRUE_AS_STRING} from "../../utils/constants";
import {isPublished} from "../../utils/validations";
const CustomTable = (props:any) =>{

  const [isLoading,setIsLoading]  = useState(false);

  const cma = useCMA();
  
  async function getEntriesByContentType(contentType:string,selectString:string) {
    
    if(contentType===undefined){return}
    return await cma.entry.getMany({
      query: {
        content_type: contentType,
        select:selectString,
        locale:'*'
      },
    });
  }
  
  const exportHandler = (contentType:string,selectString:string,contentTypeEntry:any,localesArray:Array<any>) =>{
    setIsLoading(true);
    getEntriesByContentType(contentType,selectString).then((entries) => {

      const initialData = entries?.items?.filter((item)=>{
        return isPublished(item);
      });
      const data = initialData?.map((entry) => {
        const object:any = {};
        object[contentType]=  {'en-US': entry?.sys?.id};
        
        const temp = entry.fields;
        return { ...object, ...temp };
      });
    
      if(data && data?.length>=1){
        getCSVFile(data, contentType,selectString,contentTypeEntry,localesArray);
        setIsLoading(false);    
      }else{
        console.error("No entries available")
      }
    });
  }
  const submit = (contentTypeEntry:any,event:any)=>{
    event.preventDefault();
    const contentTypeID = contentTypeEntry?.sys?.id
    const formData = new FormData(event.target);
    const user:any = {};
    for (let entry of formData.entries()) {
        user[(entry[0])] = Boolean(entry[1]); 
    }
    const selectString = Object.keys(user).toString();
   
    cma.locale.getMany({}).then((locales)=>{
      exportHandler(contentTypeID,selectString,contentTypeEntry,locales.items);
    })
    
    
  }

  
    return (
      <Fragment>
        <form onSubmit={submit.bind({},props?.contentTypeEntry)}>
          <Table>
            <Table.Head>
              <Table.Row>
                  <Table.Cell>#</Table.Cell>  
                  <Table.Cell>Name</Table.Cell>
                  <Table.Cell>ID</Table.Cell>    
                  <Table.Cell>Type</Table.Cell>
                  <Table.Cell>Required</Table.Cell>          
                  <Table.Cell>Localized</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
            
            {props?.contentTypeEntry?.fields?.map((row:any,index:Number) => {
              return <Table.Row key={index.toString()+Math.random()}>
                <Table.Cell> 
                  {ACCEPTABLE_TYPE.includes(row.type)?<CheckboxControlled  helpText={row.localized} name={"fields."+row.id}/>:<Checkbox name={row.id} isDisabled/>}
                
                </Table.Cell>
                <Table.Cell>{row.name}</Table.Cell>
                <Table.Cell>{row.id}</Table.Cell>
                <Table.Cell>{row.type}</Table.Cell>
                <Table.Cell>{row.required?TRUE_AS_STRING:FALSE_AS_STRING}</Table.Cell>
                <Table.Cell>{row.localized?TRUE_AS_STRING:FALSE_AS_STRING}</Table.Cell>
              </Table.Row>})}
              
            </Table.Body>
          </Table>
          <Button style={{margin:"10px",float:"right"}} type="submit" variant="positive" value={isLoading?"Exporting":"Export"}>Export</Button>
      
        </form> 
      </Fragment>
    );
  }
  export default CustomTable;


