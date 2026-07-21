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
import { capitalize } from '../../Utilities/utils';
import { formatDuration } from '../../Utilities/retentionPolicy';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { getExpirationState } from '../helpers';

const getActivityExpirationDisplay = (expiration) => {
  if (expiration.status === 'unknown') {
    return {
      key: 'unknown',
      label: 'Expiration date unknown',
      labelStatus: 'danger',
      text: 'Expiration date unknown',
      icon: 'danger',
      hasTooltip: false,
    };
  }

  if (expiration.status === 'expired') {
    return {
      key: 'expired',
      label: 'Expired',
      labelStatus: 'warning',
      text: 'Expired',
      icon: 'warning',
      hasTooltip: true,
    };
  }

  const remainingText = capitalize(`${expiration.durationText} remaining`);

  if (expiration.status === 'warning') {
    return {
      key: 'warning',
      label: `Expires in ${expiration.durationText}`,
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
  } = useRemediations(getOrgConfig);

  useEffect(() => {
    if (retentionPolicyRefreshNonce > 0 && refetchOrgConfig) {
      refetchOrgConfig();
    }
  }, [retentionPolicyRefreshNonce, refetchOrgConfig]);

  // Transform timestamp fields into dates
  // If the timestamp is invalid, set to null
  const updatedAtDate = toValidDate(lastRemediationPlaybookRun?.updated_at);
  const warningDays = orgConfig?.plan_warning_days;
  const expirationState = getExpirationState({
    expiresAt: details?.expires_at,
    warningDays,
    isWarningWindowEnabled: !orgConfigError && warningDays > 0,
  });
  const expirationDisplay = getActivityExpirationDisplay(expirationState);

  // Build the retention period text from effective config
  const retentionDays = orgConfig?.plan_retention_days;
  const retentionDurationText =
    retentionDays != null ? formatDuration(retentionDays) : 'an unknown period';

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
          {expirationDisplay.label && (
            <Label status={expirationDisplay.labelStatus} variant="outline">
              {expirationDisplay.label}
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
                {expirationDisplay.icon === 'danger' ? (
                  <Icon status="danger" data-testid="icon">
                    <ExclamationCircleIcon />
                  </Icon>
                ) : expirationDisplay.icon === 'warning' ? (
                  <Icon status="warning" data-testid="icon">
                    <ExclamationTriangleIcon />
                  </Icon>
                ) : null}
                {expirationDisplay.hasTooltip ? (
                  <Tooltip
                    content={formatDate(expirationState.expiresAtDate)}
                    position="top"
                  >
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
                      {expirationDisplay.text}
                    </span>
                  </Tooltip>
                ) : (
                  <span>{expirationDisplay.text}</span>
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
          {/* Last Executed */}
          <DescriptionListGroup>
            <DescriptionListTerm>Last executed</DescriptionListTerm>
            <DescriptionListDescription>
              {isPlaybookRunsLoading ? (
                <Spinner size="md" />
              ) : updatedAtDate ? (
                formatDate(updatedAtDate)
              ) : (
                'Never'
              )}
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
