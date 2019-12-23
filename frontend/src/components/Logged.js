import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loginUser } from '../actions/authentication';
import { withRouter } from 'react-router-dom';

class Logged extends Component {
    render() {
        const {isAuthenticated} = this.props.auth;
        const authLinks = (
            <p>Logged In!</p>
        )
        return(
            <div>
                {isAuthenticated ? authLinks : this.props.history.push('/login')}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth
})

export default connect(mapStateToProps, { loginUser })(withRouter(Logged));