import {EN_US} from './constants'; 


const getCSVFile = async function (data:any, contentType:string , selectString:string,contentTypeEntry:any,localesArray:Array<any>) {
  const csvdata = csvmaker(data,selectString,contentType,contentTypeEntry,localesArray);
  download(csvdata, contentType);
};

function arrayToObject(arr:Array<any>,contentTypeEntry:any,localesArray:Array<any>){ 
  
  let obj:any={};

  contentTypeEntry?.fields.forEach((attr:any)=>{
    if(attr.localized){
      for(let i=0;i<arr.length;i++){
        if(arr[i]?.id===attr?.id && attr?.localized){
          localesArray.forEach((locale)=>{
            obj[arr[i]]={
              ...obj[arr[i]],
              [locale.code]:'',
            }
          });
            
        }else{
          obj[arr[i]]={[EN_US]:''}  
        }
      }
    }
  });
  
  return obj
}

const csvmaker = function (data:any,selectString:string,contentType:string,contentTypeEntry:any,localesArray:Array<any>) {
  
  console.log(localesArray)
  
  let csvRows = [];
  //HEADER ROW 1
  let headersSelectSTring = contentType+","+selectString.replaceAll("fields.",'');
  
  //HEADER ROW 2
  let headersSubString = headersSelectSTring;
  
  //UPDATE HEADER STRING 1 BASED ON Locales

  contentTypeEntry?.fields.forEach((attr:any)=>{
    if(attr.localized){
      headersSelectSTring = headersSelectSTring.replace(attr.id,attr.id+","+attr.id);
    }else{
      headersSubString = headersSelectSTring.replace(attr.id,EN_US);
    }
  });
  headersSubString = headersSelectSTring.concat();
  
  //UPDATE HEADER STRING 2 BASED ON Locales

  contentTypeEntry?.fields.forEach((attr:any)=>{
    if(attr.localized){
      localesArray.forEach((locale)=>{
        headersSubString = headersSubString.replace(attr.id,locale.code);
      });
    }else{
      headersSubString = headersSubString.replace(attr.id,EN_US);
      headersSubString = headersSubString.replace(contentType,EN_US);
    }
  });

  //PUSH HEADER1 and HEADER 2 to CSV Rows

  csvRows.push(headersSelectSTring);
  csvRows.push(headersSubString);
  
  //CREATING SAMPLE OBJECT WHICH HAS ALL THE FIELDS (OPTIONAL + MANDATORY)

  const sampleRowObject = arrayToObject(headersSelectSTring.split(","),{...contentTypeEntry},localesArray);
  let values:string='';
  console.log(sampleRowObject)
  // PUSH ALL FIELDS TO DATA
 
  const modifiedData = data.map((item:any)=>{
   return {...sampleRowObject,...item};
  });
  console.log(modifiedData)
  //CREATE ARRAY OF LOCALIZED ATTRIBUTES
  const localizedAttributes:Array<string> =[]; 

  contentTypeEntry?.fields?.forEach((entry:any)=>{
    if(entry.localized){
      localizedAttributes.push(entry.id);
    }
  });
console.log(modifiedData)
   //PUSH DATA TO VALUES BASED ON LOCALIZATION
  modifiedData.map((item:any) => {
    let entry = Object.entries(item);
    entry.forEach((itemX:any)=>{    
      let itemxKey = itemX[0];
      let itemXValue = itemX[1];
      if(localizedAttributes.includes(itemxKey)){
        localesArray.forEach((locale)=>{
          if(typeof itemXValue[locale.code]==='boolean'){
            values += (itemXValue[locale.code]?true:false) +",";
          }else{
            values += (itemXValue[locale.code]?itemXValue[locale.code]:'') +",";
          } 
        })
      }else{
        console.log(itemXValue['en-US'])
        if(typeof itemXValue[EN_US]==='boolean'){
          values += (itemXValue[EN_US]?true:false) +",";
        }else{
          values += (itemXValue[EN_US]?itemXValue[EN_US]:'') +",";
        }   
      }
    });
    console.log(values)
    csvRows.push(values);
    values = '';
  });
  return csvRows.join("\n");
};
const download = function (data:any, contentType:string) {
  const a = document.createElement("a");
  a.setAttribute("href", "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURI(data));
  a.setAttribute("target","_blank")
  a.setAttribute(
    "download",
    contentType + "-" + new Date().toString() + ".csv"
  );
  a.click();
};

export { getCSVFile };
