import React, { Component, } from "react";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import BootstrapTable from 'react-bootstrap-table-next';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import SweetAlert from 'react-bootstrap-sweetalert';


const balanceColumns = [
    {
        dataField: 'fuel_type',
        text: 'Тип топлива',
    },
    {
        dataField: 'amount',
        text: 'Количество, т.'
    },
]


const columns = [
    {
        dataField: 'id',
        hidden: true,
    },
    {
        dataField: 'ceo_name',
        hidden: true,
    },
    {
        dataField: 'address',
        hidden: true,
    },
    {
        dataField: 'balance',
        hidden: true,
    },
    {
        dataField: 'organization',
        text: 'Организация',
    },
    {
        dataField: 'name',
        text: 'Название'
    },
    {
        dataField: 'destination_station',
        text: 'Станция назначения'
    }
];

let toggleData = () => {
    document.getElementById('station-data').classList.remove("hidden")
    document.getElementById('station-balance').classList.add("hidden")
};

let toggleBalance = () => {
    document.getElementById('station-data').classList.add("hidden")
    document.getElementById('station-balance').classList.remove("hidden")
};


class StationForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            row: this.props.row,
            id: this.props.row.id,
            ceo_name: this.props.row.ceo_name,
            address: this.props.row.address,
            organization: this.props.row.organization,
            name: this.props.row.name,
            destination_station: this.props.row.destination_station,
            organizations: [],
            stations: [],
            warning: false,
            success: false,
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChangeOrganization = this.handleChangeOrganization.bind(this)
        this.handleChangeCEO = this.handleChangeCEO.bind(this)
        this.handleChangeDestinationStation = this.handleChangeDestinationStation.bind(this)
        this.handleChangeAddress = this.handleChangeAddress.bind(this)
        this.handleChangeName = this.handleChangeName.bind(this)
        this.hideAlert = this.hideAlert.bind(this)
    }

    componentDidMount() {
        this.fetchOrganizations();
        this.fetchStations();
    }

    fetchOrganizations() {
        fetch("http://localhost:8000/fuel/organization/", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                return response.json()
            })
            .then(result => {
                this.setState({organizations: result})
            })
            .catch(e => {
                console.log(e);
            });
    }

    fetchStations() {
        fetch("http://localhost:8000/fuel/station/", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(result => {
                this.setState({stations: result})
            })
            .catch(e => {
                console.log(e);
            });
    }

    fetchContracts() {
        fetch("http://localhost:8000/fuel/contract?station=" + this.state.name, {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(result => {
                this.setState({stations: result})
            })
            .catch(e => {
                console.log(e);
            });
    }

    handleSubmit(event) {
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ceo_name: this.state.ceo_name,
                address: this.state.address,
                name: this.state.name,
                organization: this.state.organization,
                destination_station: this.state.destination_station,
            })
        };
        fetch("http://localhost:8000/fuel/station/" + this.state.id + '/', requestOptions)
            .then( response => {
                    console.log(response)
                    if (!(response.status === 200)) {
                        this.setState({warning: true})
                    } else {
                        this.setState({success: true})
                    }
                    return response.json()
                }
            )
            .then(data => this.setState({postId: data.id}))
            .catch(e => {
            console.log(e);
        });
    }

    handleChangeOrganization(event) {
        this.setState({organization: event.target.value})
    }

    handleChangeCEO(event) {
        this.setState({ceo_name: event.target.value})
    }

    handleChangeDestinationStation(event) {
        this.setState({destination_station: event.target.value})
    }

    handleChangeAddress(event) {
        this.setState({address: event.target.value})
    }

    handleChangeName(event) {
        this.setState({name: event.target.value})
    }

    hideAlert() {
        this.setState({success: false})
        this.setState({warning: false})
        window.location.reload();
    }

    render(){
        return (<div id='station-data' className="content">
            <Form>
                <Form.Row>
                    <Form.Group as={Col} controlId="formGridOrganization">
                        <Form.Label>Организация (ДЗО)</Form.Label>
                        <Form.Control as="select" value={this.state.organization} onChange={this.handleChangeOrganization}>
                            {this.state.organizations.map(function(object, _){
                                return <option>{object.name}</option>;
                            })}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridName">
                        <Form.Label>Название</Form.Label>
                        <Form.Control value={this.state.name} onChange={this.handleChangeName}/>
                    </Form.Group>
                </Form.Row>

                <Form.Group controlId="formGridAddress1">
                    <Form.Label>Фактический адресс</Form.Label>
                    <Form.Control value={this.state.address} onChange={this.handleChangeAddress}/>
                </Form.Group>

                <Form.Group controlId="formGridAddress2">
                    <Form.Label>ФИО руководителя</Form.Label>
                    <Form.Control value={this.state.ceo_name} onChange={this.handleChangeCEO}/>
                </Form.Group>

                <Form.Group controlId="formGridDestStation">
                    <Form.Label>Станция назначения</Form.Label>
                    <Form.Control as="select" value={this.state.destination_station} onChange={this.handleChangeDestinationStation}>
                        {this.state.stations.map(function(object, _){
                            return <option>{object.name}</option>;
                        })}
                    </Form.Control>
                </Form.Group>

                <Button variant="primary" type="submit" onClick={this.handleSubmit}>
                    Сохранить
                </Button>
                {
                    this.state.warning && <SweetAlert
                        warning
                        title="Упс! Что-то пошло не так."
                        onConfirm={this.hideAlert}
                    />
                }
                {
                    this.state.success && <SweetAlert
                        success
                        title="Данные изменены!"
                        onConfirm={this.hideAlert}
                    />
                }
            </Form>
        </div>);
    }
}

const expandRow = {
    onlyOneExpanding: true,
    parentClassName: 'active',
    renderer: row => (
        <div>
            <ButtonToolbar className="mb-3" aria-label="Toolbar with Button groups">
                <ButtonGroup className="mr-2" aria-label="First group">
                    <Button onClick={toggleData} variant="secondary">Данные станции</Button>
                    <Button onClick={toggleBalance} variant="secondary">Баланс</Button>
                </ButtonGroup>
            </ButtonToolbar>
            <StationForm row={row} />
            <div id='station-balance' className="content hidden">
                <div>
                    <BootstrapTable keyField={'fuel_type'}
                                    data={row.balance}
                                    columns={balanceColumns}
                                    bootstrap4={true}
                                    bordered={true}
                                    striped={true}
                                    noDataIndication={ 'Данные не найдены' }
                    />
                </div>
            </div>
        </div>
    ),
};


class Station extends Component {

    constructor(props) {
        super(props);

        this.state = {
            stations: []
        };
    }

    componentDidMount() {
        this.fetchStations();
    }

    fetchStations() {
        fetch("http://localhost:8000/fuel/station/", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(result => {
                this.setState({stations: result})
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        return (
            <div>
                <BootstrapTable keyField={'id'}
                                data={this.state.stations}
                                columns={columns}
                                bootstrap4={true}
                                bordered={true}
                                expandRow={ expandRow }
                                noDataIndication={ 'Данные не найдены' }
                />
            </div>
        );
    }
}

export default Station;