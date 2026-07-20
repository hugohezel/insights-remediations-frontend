import React from 'react';
import { Icon, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { wrappable, breakWord } from '@patternfly/react-table';
import {
  Name as NameCell,
  LastExecutedCell,
  ExecutionStatusCell,
  ActionsCell,
  SystemsCell,
  CreatedCell,
  LastModifiedCell,
  ExpirationCell,
} from './Cells.js';

export const ExpirationColumnHeader = () => {
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      Expiration
      <Tooltip content="Time remaining until the remediation plan is automatically deleted due to inactivity.">
        <Icon status="custom" className="pf-v6-u-ml-xs">
          <OutlinedQuestionCircleIcon color="var(--pf-t--global--icon--color--subtle)" />
        </Icon>
      </Tooltip>
    </span>
  );
};

export const Name = {
  title: 'Name',
  transforms: [wrappable],
  cellTransforms: [wrappable, breakWord],
  sortable: 'name',
  exportKey: 'name',
  Component: NameCell,
};

export const LastExecuted = {
  title: 'Last executed',
  transforms: [wrappable],
  sortable: 'last_run_at',
  exportKey: 'last_run_at',
  Component: LastExecutedCell,
};

export const ExecutionStatus = {
  title: 'Execution status',
  transforms: [wrappable],
  sortable: 'status',
  exportKey: 'status',
  Component: ExecutionStatusCell,
};

export const Actions = {
  title: 'Actions',
  transforms: [wrappable],
  sortable: 'issue_count',
  exportKey: 'Actions',
  Component: ActionsCell,
};

export const Systems = {
  title: 'Systems',
  transforms: [wrappable],
  sortable: 'system_count',
  exportKey: 'system_count',
  Component: SystemsCell,
};

export const Expiration = {
  title: <ExpirationColumnHeader />,
  transforms: [wrappable],
  sortable: 'expires_at',
  exportKey: 'expires_at',
  Component: ExpirationCell,
};

export const Created = {
  title: 'Created',
  transforms: [wrappable],
  sortable: 'created_at',
  exportKey: 'created_at',
  Component: CreatedCell,
};

export const LastModified = {
  title: 'Last modified',
  transforms: [wrappable],
  sortable: 'updated_at',
  exportKey: 'updated_at',
  Component: LastModifiedCell,
};

export default [
  Name,
  LastExecuted,
  ExecutionStatus,
  Actions,
  Systems,
  Expiration,
  Created,
  LastModified,
];
