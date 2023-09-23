
import { Box, Button, Paragraph, TextInput, Stack, Note } from "@contentful/f36-components";
import React,{ useEffect, useState } from "react";
import { useCMA } from '@contentful/react-apps-toolkit';
import { WorkflowsIcon} from '@contentful/f36-icons';
import {EN_US} from '../utils/constants'; 
import {isSameObject,removeDuplicates,transformValueFromCsv,validateEntry} from "../utils/validations";
import  ErrorTable  from "../components/custom/ErrorTable";
import { title } from "process";



export default function Import (): JSX.Element{
    
    const [selectedFile, setSelectedFile] = useState(null);

    const [rowCount, setRowCount] = useState(0);

	const [isSelected, setIsSelected] = useState(false);

    const [massage,setMassage] = useState('');

    const [isLoading,setIsLoading] = useState(false);

    const [inValidEntries,setInValidEntries] = useState(Array<{invalidField:string,id:string}>);

    const [runTimeErrors,setRunTimeErrors] = useState(Array<any>);



    const cma= useCMA();
    
    useEffect(()=>{
        console.log("Updated rowCount-->"+rowCount);
    },[rowCount])

	async function csvToJSON(csv:string) {
        const lines = csv?.split('\n');
        let result:Array<any>=[];
        let headers:Array<string>;
        headers = lines[0].split(",");
        const contentTypeRead = headers[0];
        //setContentTypeRead(headers[0]);
       

        //GET ALL ATTRIBUTES OF CONTENT TYPE
        let contentTypeFieldEntries:Array<any>=[];
        let localizedAttributes:Array<string>=[];

        const resp = await cma.contentType.get({contentTypeId:contentTypeRead});
        contentTypeFieldEntries = resp.fields; 
        console.log(contentTypeFieldEntries);
        contentTypeFieldEntries.forEach((itemY)=>{
            if(itemY.localized){
                localizedAttributes.push(itemY?.id);
            }
        });
        console.log(localizedAttributes);
        
        
        // GET LOCALE DATA
        let localesData:Array<any> =[]; 
        const locales = await cma.locale.getMany({});
        localesData = locales.items;

        const selectFieldAttribute = removeDuplicates(lines[0].split(","));
        console.log(selectFieldAttribute)
        const selectStringArray = selectFieldAttribute.filter((item:String,index:number)=>{
            if(index!=0){
                return item;
            }
        }).map((item:String,index:Number)=>{
            return "fields."+item;  
      });
      const selectString = selectStringArray.toString().trim();
      console.log(selectString)
        for (var i = 2; i < lines.length; i++) {
          var obj:any = {};
          if (lines[i] == undefined || lines[i].trim() == "") {
            continue;
          }
          var words = lines[i].split(",");
          console.log(words);
          let sampleObj:any;
          for (var j = 0; j < words.length; j++) {
           const headersJ = headers[j];
           let initialObject:any={}; 
            if(headersJ!=undefined){
                if(localizedAttributes.includes(headersJ) ){
                   
                    console.log("DUPLICATE HEADER--->"+headersJ);
                    localesData.forEach((locale)=>{
                        let attr = locale?.code;
                        if(Object.keys(initialObject).length === 0){
                            initialObject = {
                                ...initialObject,
                                [attr.trim()]:transformValueFromCsv(words[j]),
                                
                            }
                            console.log("initialObject"+JSON.stringify(initialObject))
                            j++;
                        }else{
                            initialObject = {
                                ...initialObject,
                                [attr.trim()]:transformValueFromCsv(words[j]),
                                
                            }
                            console.log("initialObject"+JSON.stringify(initialObject))
                            
                        }
                         
                    })
                    sampleObj = {...sampleObj,[headersJ.trim()]:initialObject};
                    console.log(sampleObj);
                }else if(!localizedAttributes.includes(headers[j])){
                    console.log("Not Duplicate "+headers[j]);
                    sampleObj = {
                        ...sampleObj,
                        [headers[j].trim()]:{
                            [EN_US]: transformValueFromCsv(words[j]),
                        },
                    }
                }
                
            }
        }
        console.dir(sampleObj)
        result.push(sampleObj);
      }
      console.log(result)
      updateEntries(result,contentTypeRead,selectString,localizedAttributes,localesData);
    }
    const hasUniqueEntryIDs = (csvEntries:Array<any>,contentTypeRead:string,validations:Array<any>) =>{
       
        const uniqueAttributes:Array<any>= [];
        validations.forEach((item:any,index:number)=>{
            item?.validations?.forEach((itemV:any,indexV:number)=>{
                if(itemV.hasOwnProperty('unique') && itemV?.unique){
                    uniqueAttributes.push(item.id);
                }
            })
        });
        if(uniqueAttributes.length===0){
            return true
        }else{ 
            const set = new Set();
            console.log(uniqueAttributes);
            let returnValue = true;
            uniqueAttributes.forEach((uAttr)=>{
            set.clear();
            
            return csvEntries.concat().forEach((entry)=>{
                
                if(entry[uAttr] && !set.has(entry[uAttr][EN_US])){
                    console.error("NOT DUPLICATE ID");
                    set.add(entry[uAttr][EN_US])
                }else if(entry[uAttr]){
                    console.log(entry)
                    console.error("DUPLICATE ID ATTRIBUTE -->"+uAttr+" Duplicate ID--->"+entry[uAttr][EN_US]);
                    setInValidEntries((prev:any)=>{
                        return [
                            ...prev,
                            {
                                invalidField:uAttr,
                                id:entry[contentTypeRead][EN_US],
                                "message":"Duplicate ID found",
                                value:entry[uAttr][EN_US]
                            }

                        ]
                    })
                    returnValue = false;
                    return returnValue;
                }   
            });
        });
        
        return returnValue;
        }
    }
    const validateEntries = (csvEntries:Array<any>,contentTypeRead:string,validations:Array<any>,localizedAttributes:Array<string>,localesData:Array<any>) =>{
    let returnValue = true;
    csvEntries.map((entry)=>{ 
        const obj = validateEntry(entry,validations,localizedAttributes,localesData);
        console.log(entry)
        if(!obj.isValid){
            setInValidEntries((prevState:any)=>{
                return [
                    ...prevState,
                    {
                        invalidField:obj?.validationPropertyName,
                        id:entry[contentTypeRead][EN_US],
                        message:"Validation failed",
                        value:obj?.value
                    }
                ]
            });
            returnValue = false;
        }  
    })
    return returnValue;
  }
    
   async function updateEntries(result:any,contentTypeRead:string,selectString:string,localizedAttributes:Array<string>,localesDataArray:Array<any>) {
    const removableAttribute = contentTypeRead;
    let validations;
    const validationsResponse = await cma.contentType.get({contentTypeId:contentTypeRead})
    validations=validationsResponse.fields;
    console.log(validationsResponse.fields);

    if(validateEntries(result.concat(),contentTypeRead,validations,localizedAttributes,localesDataArray) && hasUniqueEntryIDs(result.concat(),contentTypeRead,validations)){
        
        result.map((csvEntry:any) => {
        const entryIDx = csvEntry[contentTypeRead][EN_US];
        console.log("entryIDx-->"+entryIDx);
        console.log(csvEntry);
        
        validationsResponse.fields.length===Object.keys(csvEntry)?.length?console.log("select string is fine"):console.log("select string is not -fine")
        cma.entry.getMany({query:{"sys.id":entryIDx,content_type:contentTypeRead,limit: 1}}).then((entries)=>{
                const cmaEntry = entries?.items[0];
                console.log(entries);
                delete csvEntry[removableAttribute];
                console.log(csvEntry);
                console.log(cmaEntry.fields);
                if(!isSameObject(csvEntry,cmaEntry.fields)){
                    
                        cmaEntry.fields={...cmaEntry.fields,...csvEntry}//setting cvs values to CMA Entry
                        console.log("Inside IF")
                        console.log(cmaEntry.fields);
                        if(entryIDx===undefined){
                            
                            cma.entry.create({contentTypeId:contentTypeRead},cmaEntry).then((cmaEntryPublish)=>{
                                console.log(cmaEntryPublish)
                                cma.entry.publish({entryId:cmaEntryPublish.sys.id},cmaEntryPublish).then((cmaEntryPublished)=>{
                                    console.log("cmaEntryPublished"+cmaEntryPublished);
                                    setRowCount(prevState => prevState + 1);
                                }).catch((error)=>{

                                    console.log('error while publishing new entry'+entryIDx);
                                    console.log(error);
                                    setRunTimeErrors((prevState)=>{
                                        return [
                                            ...prevState,
                                        {
                                            ...error,
                                            title:'Error while publishing new entry'
                                        }
                                        ]
                                    })
                                });
                            }).catch((error)=>{
                                console.log('Error while creating new entry'+entryIDx);
                                console.log(error);
                                setRunTimeErrors((prevState)=>{
                                    return [
                                        ...prevState,
                                        {
                                            ...error,
                                            title:'Error while creating new entryID'+entryIDx
                                        }
                                    ]
                                })
                            });;
                        }else{
                            cma.entry.update({entryId:entryIDx},cmaEntry).then((cmaEntryPublish)=>{
                                cma.entry.publish({entryId:entryIDx},cmaEntryPublish).then((cmaEntryPublished)=>{
                                    console.log("cmaEntryPublished"+cmaEntryPublished);
                                    setRowCount(prevState => prevState + 1);
                                }).catch((error)=>{
                                    console.log('error while publishing updated old entryID->'+entryIDx);
                                console.log(error);
                                setRunTimeErrors((prevState)=>{
                                    return [
                                        ...prevState,
                                        {
                                            ...error,
                                            title:'Error while publishing updated entryID'+entryIDx
                                        }
                                    ]
                                })
                                });
                            }).catch((error)=>{
                                console.log('error while updating old entryID->'+entryIDx);
                                console.log(error);
                                setRunTimeErrors((prevState)=>{
                                    return [
                                        ...prevState,
                                        {
                                            ...error,
                                            title:'Error while updating entryID '+entryIDx
                                        }
                                    ]
                                })
                            });
                        }
                        
                    
                }else{
                    console.log("No Updates required entry ID"+entryIDx);
                }
            });
            
        });
        
    }else{
        //setMassage("Validation erros found in file");
        setIsSelected(false);
        setSelectedFile(null);
        setIsLoading(false);    
    }    
    setMassage("Rows affected are ");
        setIsSelected(false);
        setSelectedFile(null);
        setIsLoading(false);
    }
 
	const handleSubmission = () => {
        setIsLoading(true);
        setRowCount(0);
        setInValidEntries((prevState)=>{
            return [];
        })
        const file = selectedFile;

        if(file!=undefined){

            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function (event) {
            let csvData = event?.target?.result?.toString();
            if(csvData){
                csvToJSON(csvData);
            }else{
                console.error("Error while reading file input");
            }
             
        };
        }
    };

    
    return (<Box marginTop="spacingM">
            <TextInput accept=".csv" type="file" name="file"  onChange={(e) => {
                const target= e.target as HTMLInputElement;
                const file: File = (target.files as FileList)[0];
                    
                if(file){
                    setSelectedFile(file);
                    setIsSelected(true);
                    setMassage('');
                    setIsLoading(false)
                }else{
                    setSelectedFile({});
                    setIsSelected(false);
                    setMassage('')
                    setIsLoading(false)
                }
            }}/>
			
            <div>
				<Button startIcon={<WorkflowsIcon variant="muted" />}  style={{margin:"10px"}} isDisabled = {!isSelected} variant="primary" onClick={handleSubmission}>{isLoading?"Importing":"Import"}</Button>
			</div>
            
            {
                runTimeErrors?.length===0 && inValidEntries?.length===0 && massage!='' &&
                <Stack flexDirection="column">
                    <Note title="File imported successfully" variant="positive">{massage}{rowCount}</Note>
                </Stack>
            }
            {
                inValidEntries?.length>=1 && 
                <Stack marginTop="spacingS" flexDirection="column">
                    <Note title={`Validation Errors found in imported cvs file, Rows affected ${rowCount}`} variant="negative">
                        <Paragraph>Please find below details for invalid entries</Paragraph>
                        <ErrorTable list={inValidEntries}/>
                    </Note>
                </Stack>
            }
            
            {runTimeErrors?.length>=1 && runTimeErrors?.map((error)=>{
                return (<Stack marginTop="spacingS" flexDirection="column">
                    <Note  title= {`Run Time Error: ${error?.title} ,Rows affected ${rowCount}`}variant="negative">
                        <Paragraph>Error Code : {error?.code}</Paragraph>
                        <Paragraph>Message : {error?.message}</Paragraph>
                    </Note>
                    </Stack>)
            })}

            </Box>)
}
