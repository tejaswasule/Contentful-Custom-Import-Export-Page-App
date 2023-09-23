import {EN_US,EMPTY_WORD} from './constants'; 

const removeDuplicates = (arr:Array<String>)=> {
    return arr.filter((item:any,index:Number) => arr.indexOf(item) === index);
}
const isPublished = (entity:any) => {
    return !!entity.sys.publishedVersion &&
      entity.sys.version == entity.sys.publishedVersion + 1
  }
const isSameObject = ( obj1:any, obj2:any )=> {
    return Object.keys( obj1 ).every( function( prop ) {
     let value = true
      if(obj2[prop]!=undefined && obj1[prop]!=undefined && JSON.stringify(obj2[prop])!==JSON.stringify(obj1[prop])){
         value=false;
     }
      
    return value;  
   });
 }

const transformValueFromCsv = (value:any) =>{
    if(value){
        
        if(value==="\r" || value ==='\r' ){
            return false;
        }
        if(!Number.isNaN(Number(value))){
            return Number(value);
        }else if(value.toLowerCase()==='true' || value.toLowerCase()==='true\r'){
            return true;
        }else if(value.toLowerCase()==='false' || value.toLowerCase()==='false\r'){
            return false;
        }else{
            return value.toString();
        }
    }
  } 
  const validateField = (type:string,required:boolean,value:string | Number | boolean) =>{
 
    switch (type) {
        case "Symbol":
            return checkNull(required,value?.toString());
            break;
        case "Integer":
            if(required){
                return Number.isInteger(value) && value!=0;
            }else{
                if(value===undefined || (Number.isInteger(value) && value!=0)){
                    return true;
                }else{
                    return false;
                }
            }
            
        break; 
        case "Date":
            return true;
        break;    
        break;
        case "Boolean":
            console.log(value);
            if(value===''){
                return true;
            }
            if(required){
                return typeof value === "boolean";
            }else{
                if(value==='' || value===undefined){
                    return true;
                }
                else if(typeof value === "boolean" || value===0){
                    return true;
                }else{
                    return false;
                }
            }
            
        break;

        default:
            break;
    }
  }
  const checkNull = (required:boolean,value:string) =>{
    console.log(value);
    if((value === undefined || value?.trim()=== '' || value?.trim()=== "") && required===true){
        return false;
    }else{
        return true;
    }
  }
  const validateEntry = (entry:any,validations:Array<any>,localizedAttributes:Array<string>,localesData:Array<any>) =>{
    console.log(localizedAttributes);
    let isValid = true;
    let validationPropertyNames=[];
    let validationPropertyValues=[];
    const entryX = Object.keys(entry);
    entryX.forEach((propertyName)=>{
    const currentAttributeRef = entry[propertyName];   
        if(localizedAttributes.includes(propertyName)){
            console.log(localesData)
            localesData.forEach((locale)=>{
                 
                if(!validateEntryBasedOnLocale(validations,propertyName,entry,locale.code)){
                    
                    isValid=false;
                    validationPropertyNames.push(propertyName+"["+locale.code+"]");
                    validationPropertyValues.push(currentAttributeRef[locale.code]?currentAttributeRef[locale.code]:EMPTY_WORD);   
                }            
            })
        }else{
            if(!validateEntryBasedOnLocale(validations,propertyName,entry,EN_US)){
                isValid=false;
                validationPropertyNames.push(propertyName+"["+EN_US+"]");
                validationPropertyValues.push(currentAttributeRef[EN_US]?currentAttributeRef[EN_US]:EMPTY_WORD);
            }
        }
    });
        return {isValid,validationPropertyName:validationPropertyNames.join(','),value:validationPropertyValues.join(',')};
    }
    function validateEntryBasedOnLocale(validations:Array<any>,propertyName:string,entry:any,locale:string){
        let returnValue = true;
        for(var validationPropertyName in validations) {
            if(validations[validationPropertyName].id===propertyName){ 
                if(!validateField(validations[validationPropertyName].type,validations[validationPropertyName].required,entry[propertyName][locale])){
                    returnValue=false;
                }  
            }
        }
        return returnValue; 
    }
    
    export  {checkNull,isSameObject,removeDuplicates,transformValueFromCsv,validateEntry,validateField,isPublished};