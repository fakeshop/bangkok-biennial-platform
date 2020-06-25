import React, { Component } from 'react';

import { navigate } from 'gatsby';

import { withFirebase } from '../../../../utils/Firebase';
import { PAVILION_INFO_REGISTER, REGISTRATION_STATUS, PAVILION_DETAIL_REGISTER } from '../../../../constants/routes';
import RegistrationStatus from '../../../../constants/registrationStatus';

import { FaGoogle } from 'react-icons/fa';

const ERROR_CODE_ACCOUNT_EXISTS =
  'auth/account-exists-with-different-credential';

const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with an E-Mail address to
  this social account already exists. Try to login from
  this account instead and associate your social accounts on
  your personal account page.
`;

class SignInGoogle extends Component {
  constructor(props) {
    super(props);

    this.state = { error: null };
  }

  onSubmit = async event => {
    event.preventDefault();
    try {
      const socialAuthUser = await this.props.firebase
        .doSignInWithGoogle()
      const userSnapshot = await this.props.firebase.getUser(socialAuthUser.user.uid)
      const user = userSnapshot.data()
      const status = user ? user.registrationStatus : RegistrationStatus.NEW_USER
      await this.props.firebase.user(socialAuthUser.user.uid)
        .set({
          username: socialAuthUser.user.displayName,
          email: socialAuthUser.user.email,
          roles: 'user',
          registrationStatus: status
        });
      await this.setState({ error: null });
      
      switch (status) {
        case RegistrationStatus.FINISHED_BASIC:
          await navigate(PAVILION_DETAIL_REGISTER);
          break;
        case RegistrationStatus.FINISHED_ADVANCE:
          await navigate(REGISTRATION_STATUS);
          break;
        default:
          await navigate(PAVILION_INFO_REGISTER);
      } 
    } catch (error) {
      if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
        error.message = ERROR_MSG_ACCOUNT_EXISTS;
      }
      this.setState({ error });
    }
    event.preventDefault();
  };

  render() {
    const { error } = this.state;

    return (
      <div className="login__content__providers__container">
        <form
          className="login__content__providers__item login__content__providers__item--google"
          onSubmit={this.onSubmit}
        >
          <button type="submit">
            <FaGoogle />
          </button>
        </form>
        { error &&  <p style={{ color: '#FC0000' }}>{error.message}</p> }
      </div>
    );
  }
}

export default withFirebase(SignInGoogle);
