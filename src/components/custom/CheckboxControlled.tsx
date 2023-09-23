import { Checkbox } from "@contentful/f36-components";
import {useState } from "react";
import {FALSE_AS_STRING,TRUE_AS_STRING} from '../../utils/constants'

export default function CheckboxControlled(props:any) {
  const [checkboxState, setCheckboxState] = useState(true);
  

  const checkboxHandler = (event:React.ChangeEvent<HTMLInputElement>) =>{
    setCheckboxState(event?.target?.checked);
  }

  return (
    <Checkbox
      {...props}
      onChange={checkboxHandler}
      isChecked={checkboxState}
      value={checkboxState?TRUE_AS_STRING:FALSE_AS_STRING}
    >
      
    </Checkbox>
  );
}