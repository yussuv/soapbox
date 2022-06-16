'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import Icon from 'soapbox/components/icon';
import { Text } from 'soapbox/components/ui';

const hasRestrictions = remoteInstance => {
  return remoteInstance
    .get('federation')
    .deleteAll(['accept', 'reject_deletes', 'report_removal'])
    .reduce((acc, value) => acc || value, false);
};

const mapStateToProps = state => {
  return {
    instance: state.get('instance'),
  };
};

export default @connect(mapStateToProps)
class InstanceRestrictions extends ImmutablePureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    remoteInstance: ImmutablePropTypes.map.isRequired,
    instance: ImmutablePropTypes.map,
  };

  renderRestrictions = () => {
    const { remoteInstance } = this.props;
    const items = [];

    const {
      avatar_removal,
      banner_removal,
      federated_timeline_removal,
      followers_only,
      media_nsfw,
      media_removal,
    } = remoteInstance.get('federation').toJS();

    const fullMediaRemoval = media_removal && avatar_removal && banner_removal;
    const partialMediaRemoval = media_removal || avatar_removal || banner_removal;

    if (followers_only) {
      items.push((
        <Text key='followers_only'>
          <Icon className='mr-2' src={require('@tabler/icons/icons/lock.svg')} />
          <FormattedMessage
            id='federation_restriction.followers_only'
            defaultMessage='Hidden except to followers'
          />
        </Text>
      ));
    } else if (federated_timeline_removal) {
      items.push((
        <Text key='federated_timeline_removal'>
          <Icon className='mr-2' src={require('@tabler/icons/icons/lock-open.svg')} />
          <FormattedMessage
            id='federation_restriction.federated_timeline_removal'
            defaultMessage='Fediverse timeline removal'
          />
        </Text>
      ));
    }

    if (fullMediaRemoval) {
      items.push((
        <Text key='full_media_removal'>
          <Icon className='mr-2' src={require('@tabler/icons/icons/photo-off.svg')} />
          <FormattedMessage
            id='federation_restriction.full_media_removal'
            defaultMessage='Full media removal'
          />
        </Text>
      ));
    } else if (partialMediaRemoval) {
      items.push((
        <Text key='partial_media_removal'>
          <Icon className='mr-2' src={require('@tabler/icons/icons/photo-off.svg')} />
          <FormattedMessage
            id='federation_restriction.partial_media_removal'
            defaultMessage='Partial media removal'
          />
        </Text>
      ));
    }

    if (!fullMediaRemoval && media_nsfw) {
      items.push((
        <Text key='media_nsfw'>
          <Icon className='mr-2' id='eye-slash' />
          <FormattedMessage
            id='federation_restriction.media_nsfw'
            defaultMessage='Attachments marked NSFW'
          />
        </Text>
      ));
    }

    return items;
  }

  renderContent = () => {
    const { instance, remoteInstance } = this.props;
    if (!instance || !remoteInstance) return null;

    const host = remoteInstance.get('host');
    const siteTitle = instance.get('title');

    if (remoteInstance.getIn(['federation', 'reject']) === true) {
      return (
        <Text>
          <Icon className='mr-2' id='times' />
          <FormattedMessage
            id='remote_instance.federation_panel.restricted_message'
            defaultMessage='{siteTitle} blocks all activities from {host}.'
            values={{ host, siteTitle }}
          />
        </Text>
      );
    } else if (hasRestrictions(remoteInstance)) {
      return [
        (
          <Text>
            <FormattedMessage
              id='remote_instance.federation_panel.some_restrictions_message'
              defaultMessage='{siteTitle} has placed some restrictions on {host}.'
              values={{ host, siteTitle }}
            />
          </Text>
        ),
        this.renderRestrictions(),
      ];
    } else {
      return (
        <Text>
          <Icon className='mr-2' id='check' />
          <FormattedMessage
            id='remote_instance.federation_panel.no_restrictions_message'
            defaultMessage='{siteTitle} has placed no restrictions on {host}.'
            values={{ host, siteTitle }}
          />
        </Text>
      );
    }
  }

  render() {
    return <div className='instance-restrictions'>{this.renderContent()}</div>;
  }

}
