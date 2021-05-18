import React, { Component } from "react";
import {
    Route,
    NavLink,
    HashRouter
} from "react-router-dom";
import Nav from "./Nav";
import Station from "./Stations"
import CounterParty from "./CounterParty"
import Contracts from "./Contracts";
import Operations from "./Operational";
import LoginForm from "./LoginFrom";
import SignupForm from "./SingupFrom";
import WriteOff from "./WriteOff";
import Report from "./Report";

import Button from 'react-bootstrap/Button'

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            displayed_form: '',
            logged_in: localStorage.getItem('token') ? true : false,
            username: ''
        };
    }

    componentDidMount() {
        if (this.state.logged_in) {
            fetch('http://localhost:8000/fuel/current_user/', {
                headers: {
                    Authorization: `JWT ${localStorage.getItem('token')}`
                }
            })
                .then(res => res.json())
                .then(json => {
                    this.setState({ username: json.username });
                });
        }
    }

    handle_login = (e, data) => {
        e.preventDefault();
        fetch('http://localhost:8000/token-auth/', {
            mode: 'no-cors', // no-cors
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(json => {
                console.log(json)
                localStorage.setItem('token', json.token);
                this.setState({
                    logged_in: true,
                    displayed_form: '',
                    username: json.user.username
                });
            });
    };

    handle_signup = (e, data) => {
        e.preventDefault();
        fetch('http://localhost:8000/fuel/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(json => {
                localStorage.setItem('token', json.token);
                this.setState({
                    logged_in: true,
                    displayed_form: '',
                    username: json.username
                });
            });
    };

    handle_logout = () => {
        localStorage.removeItem('token');
        this.setState({ logged_in: false, username: '' });
    };

    display_form = form => {
        this.setState({
            displayed_form: form
        });
    };

    render() {
        let form;
        switch (this.state.displayed_form) {
            case 'login':
                form = <LoginForm handle_login={this.handle_login} />;
                break;
            case 'signup':
                form = <SignupForm handle_signup={this.handle_signup} />;
                break;
            default:
                form = null;
        }
        return (
            <HashRouter>
                <div>
                    <h1>АС УТР</h1>
                    <Nav
                        logged_in={this.state.logged_in}
                        display_form={this.display_form}
                        handle_logout={this.handle_logout}
                    />
                    {form}
                    <ul className="header">
                        <li><NavLink to="/stations">Станции</NavLink></li>
                        <li><NavLink to="/counterparty">Контрагенты</NavLink></li>
                        <li><NavLink to="/contract">Договоры</NavLink></li>
                        <li><NavLink to="/operational">Оперативный учет</NavLink></li>
                        <li><NavLink to="/writeoff">Технический учет</NavLink></li>
                        <li><NavLink to="/report">Отчеты</NavLink></li>
                        <Button className='margin_left' onClick={this.handle_logout} variant="danger">Logout</Button>
                    </ul>
                    <div className="content">
                        <Route exact path="/stations" component={Station}/>
                        <Route exact path="/counterparty" component={CounterParty}/>
                        <Route exact path="/contract" component={Contracts}/>
                        <Route exact path="/operational" component={Operations}/>
                        <Route exact path="/writeoff" component={WriteOff}/>
                        <Route exact path="/report" component={Report}/>
                    </div>
                </div>
            </HashRouter>
        );
    }
}

export default App;
