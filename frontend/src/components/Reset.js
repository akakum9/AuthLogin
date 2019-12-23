import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { reset } from '../actions/authentication';
import classnames from 'classnames';

class Reset extends Component {

    constructor() {
        super();
        this.state = {
            password: '',
            confirmPassword: '',
            resetToken: '',
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
            password: this.state.password,
            confirmPassword: this.state.confirmPassword,
            resetToken : this.props.match.params.token

        }
        console.log(user);
        this.props.reset(user, this.props.history);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.errors) {
            this.setState({
                errors: nextProps.errors
            });
        } else {
            this.props.history.push('/');
        }
    }

    componentDidMount() {
        console.log(this.state);
        this.setState({
            resetToken : this.props.match.params.token
        })

    }

    render() {
        const {errors} = this.state;
        return(
        <div className="container" style={{ marginTop: '50px', width: '700px'}}>
            <h2 style={{marginBottom: '40px'}}>Reset Password</h2>
            <form onSubmit={ this.handleSubmit }>
                <div className="form-group">
                    <input
                    type="password"
                    placeholder="Password"
                    className={classnames('form-control form-control-lg', {
                        'is-invalid': errors.password
                    })} 
                    name="password"
                    onChange={ this.handleInputChange }
                    value={ this.state.password }
                    />
                    {errors.password && (<div className="invalid-feedback">{errors.password}</div>)}
                </div>
                <div className="form-group">
                    <input
                    type="password"
                    placeholder="Confirm Password"
                    className={classnames('form-control form-control-lg', {
                        'is-invalid': errors.confirmPassword
                    })} 
                    name="confirmPassword"
                    onChange={ this.handleInputChange }
                    value={ this.state.confirmPassword }
                    />
                    {errors.confirmPassword && (<div className="invalid-feedback">{errors.confirmPassword}</div>)}
                </div>
                <div className="form-group mt-4">
                    <button type="submit" className="btn btn-primary">
                        Update Password 
                    </button>
                </div>
            </form>
        </div>
        )
    }
}

Reset.propTypes = {
    reset: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    errors: state.errors
})

export default connect(mapStateToProps, { reset })(withRouter(Reset))