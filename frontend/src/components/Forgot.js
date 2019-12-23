import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { forgot } from '../actions/authentication';
import classnames from 'classnames';

class Forgot extends Component {

    constructor() {
        super();
        this.state = {
            email: '',
            errors: {}
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleSubmit(e) {
        e.preventDefault();
        const user = {
            email: this.state.email
        }
        this.props.forgot(user, this.props.history);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.reset.emailThere) {
            this.props.history.push('/')
            console.log('email found');
        }
        if(nextProps.errors) {
            this.setState({
                errors: nextProps.errors
            });
            console.log('email not found');
        }
    }

    render() {
        const {errors} = this.state;
        return(
        <div className="container" style={{ marginTop: '50px', width: '700px'}}>
            <h2 style={{marginBottom: '40px'}}>Forgot Password</h2>
            <form onSubmit={ this.handleSubmit }>
                <div className="form-group">
                    <input
                    type="email"
                    placeholder="Email"
                    className={classnames('form-control form-control-lg', {
                        'is-invalid': errors.email
                    })}
                    name="email"
                    onChange={ this.handleInputChange }
                    value={ this.state.email }
                    />
                    {errors.email && (<div className="invalid-feedback">{errors.email}</div>)}
                </div>
                <div className="form-group mt-3">
                    <button type="submit" className="btn btn-primary">
                        Update Password 
                    </button>
                </div>
            </form>
        </div>
        )
    }
}

Forgot.propTypes = {
    forgot: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    errors: state.errors,
    reset: state.reset
})

export default connect(mapStateToProps, { forgot })(withRouter(Forgot))