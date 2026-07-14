import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Label } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  InProgressIcon,
  ExclamationCircleIcon,
  BanIcon,
} from '@patternfly/react-icons';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { pluralize } from '../Utilities/utils';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const STATUS_META = {
  success: {
    text: 'Succeeded',
    color: 'green',
    status: 'success',
    Icon: CheckCircleIcon,
  },
  running: {
    text: 'In progress',
    color: 'orange',
    status: 'info',
    Icon: InProgressIcon,
  },
  failure: {
    text: 'Failed',
    color: 'red',
    status: 'danger',
    Icon: ExclamationCircleIcon,
  },
  canceled: {
    text: 'Canceled',
    color: 'red',
    Icon: BanIcon,
  },
};

export const getStatusMeta = (status = '') => {
  if (!status || typeof status !== 'string') return null;
  return STATUS_META[status.toLowerCase()] ?? null;
};

export const calculateExpiresInDays = (expiresAtDate) => {
  // Expects a valid Date. Unknown or invalid expiration values are handled
  // before this helper is called.
  const msUntilExpiration = expiresAtDate.getTime() - Date.now();
  const daysUntilExpiration = msUntilExpiration / DAY_IN_MS;

  // Future expirations round up so partial days still read as time remaining:
  // e.g. +19.5 days => 20 days remaining.
  // Past expirations round down so anything already expired stays negative:
  // e.g. -0.5 day => -1, not -0/0.
  // This keeps "expired earlier today" in the expired state instead of
  // showing it as if the plan still had 0 days remaining.
  return msUntilExpiration < 0
    ? Math.floor(daysUntilExpiration)
    : Math.ceil(daysUntilExpiration);
};

export const parseExpiresAt = (expiresAt) => {
  if (!expiresAt) {
    return null;
  }

  const expiresAtDate = new Date(expiresAt);
  return isNaN(expiresAtDate.getTime()) ? null : expiresAtDate;
};

export const getExpiresInDays = (expiresAt) => {
  const expiresAtDate = parseExpiresAt(expiresAt);
  return expiresAtDate ? calculateExpiresInDays(expiresAtDate) : null;
};

export const textualizeExpiresInDays = (expiresInDays) => {
  if (expiresInDays < 30) {
    return pluralize(expiresInDays, 'day');
  }

  return pluralize(Math.floor(expiresInDays / 30), 'month');
};

export const shouldShowExpirationWarning = (expiresInDays, warningDays) => {
  const normalizedWarningDays = Number(warningDays);

  if (!Number.isFinite(expiresInDays)) {
    return false;
  }

  if (expiresInDays < 0) {
    return true;
  }

  return Number.isFinite(normalizedWarningDays)
    ? expiresInDays <= normalizedWarningDays
    : false;
};

export const StatusLabel = ({ status = '' }) => {
  const meta = getStatusMeta(status);
  if (!meta) return null;
  const { color, text, status: pfStatus, Icon: PFIcon } = meta;

  return (
    <Label
      color={color}
      icon={<PFIcon />}
      isCompact
      variant="filled"
      {...(pfStatus && { status: pfStatus })}
    >
      {text}
    </Label>
  );
};

StatusLabel.propTypes = { status: PropTypes.string };

export const StatusIcon = ({ status = '', size = 'sm' }) => {
  const meta = getStatusMeta(status);
  if (!meta) return null;
  const { Icon: PFIcon } = meta;

  return <PFIcon size={size} aria-label={status} />;
};

StatusIcon.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.string,
};

export const ConnectionStatus = ({ status }) => {
  const plain = (text) => (
    <p className="pf-v6-u-mb-0" data-testid="text">
      {text}
    </p>
  );
  switch (status) {
    case 'connected':
      return (
        <p>
          <Icon status="success">
            <StatusIcon status="success" />
          </Icon>{' '}
          Ready
        </p>
      );

    case 'disconnected':
      return plain('Connection issue ‒ RHC not responding');

    case 'no_executor':
      return (
        <div data-testid="text-content">
          {plain('Cannot remediate ‒ direct connection')}
          <small>
            Connect your systems to Satellite to automatically remediate.
          </small>
        </div>
      );

    case 'no_source':
      return plain('Cannot remediate ‒ Satellite not configured');

    case 'no_receptor':
      return (
        <div data-testid="text-content">
          {plain('Cannot remediate ‒ Cloud Connector not defined')}
          <small>Configure Cloud Connector to automatically remediate.</small>
        </div>
      );

    case 'no_rhc':
      return (
        <div data-testid="text-content">
          {plain('Cannot remediate ‒ Cloud Connector not defined')}
          <small>
            Remediation from Red Hat Lightspeed requires Cloud Connector. Cloud
            Connector can be enabled via Satellite, or through&nbsp;
            <InsightsLink app="connector" to="/">
              RHC
            </InsightsLink>
          </small>
        </div>
      );

    case 'loading':
      return plain('Checking …');

    default:
      return plain('Not available');
  }
};

ConnectionStatus.propTypes = {
  status: PropTypes.string,
};

// Keep the old function for backward compatibility, but it will just render the component
export const renderConnectionStatus = (status) => (
  <ConnectionStatus status={status} />
);
