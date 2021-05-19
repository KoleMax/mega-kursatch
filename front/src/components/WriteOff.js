import React, {Component,} from "react";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'react-bootstrap/Button'
import SweetAlert from 'react-bootstrap-sweetalert';


const columns = [
    {
        dataField: 'id',
        hidden: true,
    },
    {
        dataField: 'number',
        text: 'Номер',
    },
    {
        dataField: 'station',
        text: 'Станция'
    },
    {
        dataField: 'fuel_type',
        text: 'Тип топлива'
    },
    {
        dataField: 'amount',
        text: 'Количество'
    },
    {
        dataField: 'created_at',
        text: 'Дата создания'
    }
];


class WriteOffForm extends Component {

    constructor(props) {
        super(props);

        if (this.props.row !== undefined) {
            this.state = {
                row: this.props.row,
                id: this.props.row.id,
                number: this.props.row.number,
                station: this.props.row.station,
                fuel_type: this.props.row.fuel_type,
                amount: this.props.row.amount,
                created_at: this.props.row.created_at,
                stations: [],
                station_name_to_station: new Map(),
                fuel_types: [],
                warning: false,
                success: false,
            }
        } else {
            this.state = {
                id: null,
                number: '',
                station: '',
                fuel_type: '',
                amount: 0,
                created_at: (new Date()).toISOString().slice(0, 10),
                stations: [],
                station_name_to_station: new Map(),
                fuel_types: [],
                warning: false,
                success: false,
            }
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.hideAlert = this.hideAlert.bind(this)
    }

    componentDidMount() {
        this.fetchFuelTypes();
        this.fetchStations();
    }

    fetchFuelTypes() {
        fetch("http://82.148.16.250:8000/fuel/type/", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                return response.json()
            })
            .then(result => {
                this.setState({fuel_types: result})
            })
            .catch(e => {
                console.log(e);
            });
    }

    fetchStations() {
        fetch("http://82.148.16.250:8000/fuel/station/", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(result => {
                let station_name_to_station = new Map()
                for (const station of result) {
                    station_name_to_station[station.name] = station
                }
                this.setState({
                    stations: result,
                    station_name_to_station: station_name_to_station,
                })
                this.setState({stations: result})
            })
            .catch(e => {
                console.log(e);
            });
    }

    handleSubmit(event) {

        let method
        let url = "http://82.148.16.250:8000/fuel/writeoff/"

        if (this.state.id !== null) {
            method = 'PUT'
            url = url + this.state.id + '/'
        } else {
            method = 'POST'
        }

        const requestOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                number: this.state.number,
                station: this.state.station,
                fuel_type: this.state.fuel_type,
                amount: this.state.amount,
                created_at: this.state.created_at,
            })
        };
        fetch(url, requestOptions)
            .then( response => {
                    console.log(response)
                    if (!(response.status === 200 || response.status === 201)) {
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
        this.setState({
            success: false,
            warning: false
        })
        window.location.reload();
    }

    render(){
        return (<div id='station-data' className="content">
            <Form>
                <Form.Row>

                    <Form.Group as={Col} controlId="formGridName">
                        <Form.Label>Номер</Form.Label>
                        <Form.Control value={this.state.number} onChange={(event) => {
                            this.setState({
                                number: event.target.value
                            })
                        }}/>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridOrganization">
                        <Form.Label>Станция</Form.Label>
                        <Form.Control as="select" value={this.state.station} onChange={(event) => {
                            this.setState({
                                station: event.target.value
                            })
                        }
                        }>
                            <option>{this.state.station}</option>
                            {this.state.stations.map((object, _) => {
                                if (this.state.station !== object.name) {
                                    return <option>{object.name}</option>;
                                }
                            })}
                        </Form.Control>
                    </Form.Group>
                </Form.Row>

                <Form.Row>

                    <Form.Group as={Col} controlId="formGridOrganization">
                        <Form.Label>Тип топлива</Form.Label>
                        <Form.Control as="select" value={this.state.fuel_type} onChange={(event) => {
                            this.setState({
                                fuel_type: event.target.value
                            })
                        }
                        }>
                            {<option>{this.state.fuel_type}</option>}
                            {this.state.fuel_types.map((object, _) => {
                                if (this.state.fuel_type !== object.name) {
                                    return <option>{object.name}</option>;
                                }
                            })}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridName">
                        <Form.Label>Количество, тонн</Form.Label>
                        <Form.Control disabled={this.state.station === '' || this.state.fuel_type === ''}
                                      value={this.state.amount} onChange={(event) => {
                            this.setState({
                                amount: event.target.value
                            })
                        }}/>
                    </Form.Group>

                </Form.Row>

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
            <WriteOffForm row={row} />
        </div>
    ),
};


class WriteOff extends Component {

    constructor(props) {
        super(props);

        this.state = {
            writeOffs: [],
            showForm: false,
        };
    }

    componentDidMount() {
        this.fetchWriteOffs();
    }

    fetchWriteOffs() {
        fetch("http://82.148.16.250:8000/fuel/writeoff/", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(result => {
                this.setState({writeOffs: result})
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        return (
            <div>
                <Button className='margin_bottom' variant="outline-primary" type="default" onClick={(event) => {
                    this.setState({
                        showForm: !this.state.showForm,
                    })
                }
                }>
                    + Создать списание
                </Button>

                {this.state.showForm && <WriteOffForm/>}

                <BootstrapTable keyField={'id'}
                                data={this.state.writeOffs}
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

export default WriteOff;