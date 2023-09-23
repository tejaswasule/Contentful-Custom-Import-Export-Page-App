
import { Box,EntityList, EntityListItem } from '@contentful/f36-components';

const Loader = () =>{
    return  (<Box marginTop="spacingM">
    <EntityList>
      {Array(3)
        .fill('')
        .map((_, i) => (
          <EntityListItem key={i} title="loading" className="entity-loading" isLoading />
        ))}
    </EntityList>
  </Box>);
}
export default Loader;