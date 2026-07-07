import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardTitle,
  Flex,
  Title,
  Label,
  Tooltip,
  Popover,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  CardBody,
  Spinner,
  Button,
  Icon,
} from '@patternfly/react-core';
import { formatDate } from '../Cells';
import { execStatus, toValidDate } from './helpers';
import useRemediations from '../../Utilities/Hooks/api/useRemediations';
import { getOrgConfig } from '../api';
import { capitalize, pluralize } from '../../Utilities/utils';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { calculateExpiresInDays, textualizeExpiresInDays } from '../helpers';

const getExpirationState = ({
  expiresAtDate,
  warningDays,
  hasOrgConfigError,
}) => {
  if (!expiresAtDate) {
    return {
      key: 'unknown',
      label: 'Expiration date unknown',
      labelStatus: 'danger',
      text: 'Expiration date unknown',
      icon: 'danger',
      hasTooltip: false,
    };
  }

  const expiresInDays = calculateExpiresInDays(expiresAtDate);
  if (expiresInDays < 0) {
    return {
      key: 'expired',
      label: 'Expired',
      labelStatus: 'warning',
      text: 'Expired',
      icon: 'warning',
      hasTooltip: true,
    };
  }

  const remainingText = capitalize(
    `${textualizeExpiresInDays(expiresInDays)} remaining`,
  );
  const isWarningWindowKnown = !hasOrgConfigError && warningDays > 0;
  const isWithinWarningWindow =
    isWarningWindowKnown && expiresInDays <= warningDays;
  if (isWithinWarningWindow) {
    return {
      key: 'warning',
      label: `Expires in ${textualizeExpiresInDays(expiresInDays)}`,
      labelStatus: 'warning',
      text: remainingText,
      icon: 'warning',
      hasTooltip: true,
    };
  }

  return {
    key: 'normal',
    label: null,
    labelStatus: null,
    text: remainingText,
    icon: null,
    hasTooltip: true,
  };
};

const ActivityCard = ({
  details,
  onNavigateToTab,
  lastRemediationPlaybookRun,
  isPlaybookRunsLoading,
  retentionPolicyRefreshNonce = 0,
}) => {
  // Get organization configuration
  const {
    result: orgConfig,
    error: orgConfigError,
    refetch: refetchOrgConfig,
  } =
    useRemediations(getOrgConfig);

  useEffect(() => {
    if (retentionPolicyRefreshNonce > 0 && refetchOrgConfig) {
      refetchOrgConfig();
    }
  }, [retentionPolicyRefreshNonce, refetchOrgConfig]);

  // Transform timestamp fields into dates
  // If the timestamp is invalid, set to null
  const updatedAtDate = toValidDate(lastRemediationPlaybookRun?.updated_at);
  const expiresAtDate = toValidDate(details?.expires_at);

  const warningDays = orgConfig?.plan_warning_days;
  const expirationState = getExpirationState({
    expiresAtDate,
    warningDays,
    hasOrgConfigError: Boolean(orgConfigError),
  });

  // Build the retention period text from effective config
  const retentionDays = orgConfig?.plan_retention_days;
  const retentionDurationText =
    retentionDays != null
      ? pluralize(retentionDays, 'day')
      : 'an unknown period';

  return (
    <Card isFullHeight>
      <CardTitle>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
        >
          <Title headingLevel="h4" size="xl">
            Activity
          </Title>
          {expirationState.label && (
            <Label status={expirationState.labelStatus} variant="outline">
              {expirationState.label}
            </Label>
          )}
        </Flex>
      </CardTitle>
      <CardBody>
        <DescriptionList>
          {/* Last Execution Status */}
          <DescriptionListGroup>
            <DescriptionListTerm>Latest execution status</DescriptionListTerm>
            <DescriptionListDescription>
              {isPlaybookRunsLoading ? (
                <Spinner size="md" />
              ) : (
                <Button
                  variant="link"
                  isInline
                  onClick={() => onNavigateToTab(null, 'executionHistory')}
                >
                  {execStatus(
                    lastRemediationPlaybookRun?.status,
                    updatedAtDate,
                  )}
                </Button>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Created */}
          <DescriptionListGroup>
            <DescriptionListTerm>Created</DescriptionListTerm>
            <DescriptionListDescription>
              {formatDate(details?.created_at)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Expiration */}
          <DescriptionListGroup>
            <DescriptionListTerm>
              <Flex
                spaceItems={{ default: 'spaceItemsXs' }}
                alignItems={{ default: 'alignItemsCenter' }}
              >
                <span>Expiration</span>
                <Popover
                  aria-label="Retention policy help popover"
                  headerContent="Retention policy"
                  bodyContent={
                    <div>
                      Remediation plans are automatically deleted after{' '}
                      {retentionDurationText} of inactivity. An administrator
                      can change this period for your organization by editing
                      the retention policy.
                    </div>
                  }
                >
                  <Button
                    variant="plain"
                    icon={<OutlinedQuestionCircleIcon />}
                    aria-label="Retention policy help"
                    hasNoPadding
                  />
                </Popover>
              </Flex>
            </DescriptionListTerm>
            <DescriptionListDescription>
              <Flex
                spaceItems={{ default: 'spaceItemsSm' }}
                alignItems={{ default: 'alignItemsCenter' }}
              >
                {expirationState.icon === 'danger' ? (
                  <Icon status="danger" data-testid="icon">
                    <ExclamationCircleIcon />
                  </Icon>
                ) : expirationState.icon === 'warning' ? (
                  <Icon status="warning" data-testid="icon">
                    <ExclamationTriangleIcon />
                  </Icon>
                ) : null}
                {expirationState.hasTooltip ? (
                  <Tooltip content={formatDate(expiresAtDate)} position="top">
                    <span
                      style={{
                        textDecorationLine: 'underline',
                        textDecorationStyle: 'dashed',
                        textDecorationColor:
                          'var(--pf-t--global--border--color--default)',
                        textUnderlineOffset: '2px',
                        cursor: 'pointer',
                      }}
                    >
                      {expirationState.text}
                    </span>
                  </Tooltip>
                ) : (
                  <span>{expirationState.text}</span>
                )}
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Last Modified */}
          <DescriptionListGroup>
            <DescriptionListTerm>Last modified</DescriptionListTerm>
            <DescriptionListDescription>
              {formatDate(details?.updated_at)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Last Execution */}
          <DescriptionListGroup>
            <DescriptionListTerm>Last execution</DescriptionListTerm>
            <DescriptionListDescription>
              {updatedAtDate ? formatDate(updatedAtDate) : 'Never'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

ActivityCard.propTypes = {
  details: PropTypes.object.isRequired,
  onNavigateToTab: PropTypes.func.isRequired,
  lastRemediationPlaybookRun: PropTypes.object,
  isPlaybookRunsLoading: PropTypes.bool,
  retentionPolicyRefreshNonce: PropTypes.number,
};

export default ActivityCard;
