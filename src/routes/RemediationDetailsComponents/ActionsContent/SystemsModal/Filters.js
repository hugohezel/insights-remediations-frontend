import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

export const actionNameFilter = [
  {
    type: conditionalFilterType.text,
    label: 'Name',
    placeholder: 'Search by name',
    filterAttribute: 'description',
  },
];
