import {useLazyQuery} from '@luft/apollo';

import EXTRACT_DOB_FROM_NATIONAL_ID_QUERY from '../graphql/queries/ExtractDobFromNationalId.query.graphql';

export const useExtractDobFromNationalIdLazyQuery = (
    options,
    query = EXTRACT_DOB_FROM_NATIONAL_ID_QUERY
) => useLazyQuery(query, options);
