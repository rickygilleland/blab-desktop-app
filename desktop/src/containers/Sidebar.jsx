import React from 'react';
import { userLogout } from '../actions/auth';
import { updateUserDetails } from '../actions/user';
import { 
  getOrganizations, 
  getOrganizationUsers, 
  inviteUsers, 
  createRoom,
  createCall
} from '../actions/organization';
import { 
  getAvailableDevices, 
  updateDefaultDevices,
  updateExperimentalSettings, 
  updateRoomSettings,
} from '../actions/settings';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { withRouter } from 'react-router-dom'
import Sidebar from '../components/Sidebar';

function mapStateToProps(state, ownProps) {
    return {
        user: state.user,
        organization: state.organization.organization,
        billing: state.organization.billing,
        organizationUsers: state.organization.users,
        organizationLoading: state.organization.loading,
        inviteUsersSuccess: state.organization.inviteUsersSuccess,
        createRoomSuccess: state.organization.createRoomSuccess,
        lastCreatedRoomSlug: state.organization.lastCreatedRoomSlug,
        teams: state.organization.teams,
        auth: state.auth,
        currentURL: ownProps.location.pathname,
        settings: state.settings
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        userLogout,
        updateUserDetails,
        getOrganizations,
        getOrganizationUsers,
        inviteUsers,
        createRoom,
        createCall,
        getAvailableDevices,
        updateDefaultDevices,
        updateExperimentalSettings,
        updateRoomSettings,
        push,
      },
      dispatch
    );
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidebar))