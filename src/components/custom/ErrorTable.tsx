import {Table} from '@contentful/f36-components';
export default function ErrorTable({list}){
     
    return<Table>
        <Table.Head>
            <Table.Row>
                <Table.Cell>#</Table.Cell>  
                <Table.Cell>Row ID</Table.Cell>
                <Table.Cell>Invalid Field</Table.Cell>
                <Table.Cell>Invalid/Duplicate Value</Table.Cell>
            </Table.Row>
        </Table.Head>
        
        <Table.Body>
        {list?.map((item:any,index:number)=>{
            console.log(item);
            return <Table.Row key={index + Math.random()}>
                        <Table.Cell>{index+1}</Table.Cell>  
                        <Table.Cell>{item?.id}</Table.Cell>
                        <Table.Cell>{item?.invalidField}</Table.Cell>
                        <Table.Cell>{item?.value}</Table.Cell>
                    </Table.Row>
        })}
        </Table.Body>
    </Table>

    }