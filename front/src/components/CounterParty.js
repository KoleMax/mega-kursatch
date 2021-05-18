import React, { Component, } from "react";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'react-bootstrap/Button'
import SweetAlert from "react-bootstrap-sweetalert";


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
        dataField: 'types',
        hidden: true,
    },
    {
        dataField: 'types_joined',
        text: "Вид контрагента",
    },
    {
        dataField: 'name',
        text: 'Юридическое наименование'
    },
    {
        dataField: 'address',
        text: 'Фактический адресс'
    },
    {
        dataField: 'u_address',
        text: 'Юридический адресс',
    },
    {
        dataField: 'inn',
        text: 'ИНН'
    },
    {
        dataField: 'ogrn',
        text: 'ОГРН'
    }
];


class CounterPartyForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            row: this.props.row,
            id: this.props.row.id,
            name: this.props.row.name,
            address: this.props.row.address,
            u_address: this.props.row.u_address,
            delivery_station: this.props.row.delivery_station,
            inn: this.props.row.inn,
            ogrn: this.props.row.ogrn,

            delivery_stations: [],
            types: [],
            warning: false,
            success: false,
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChangeName = this.handleChangeName.bind(this)
        this.handleChangeAddress = this.handleChangeAddress.bind(this)
        this.handleChangeUAddress = this.handleChangeUAddress.bind(this)
        this.handleChangeINN = this.handleChangeINN.bind(this)
        this.handleChangeOGRN = this.handleChangeOGRN.bind(this)
        this.handleChangeDestinationStation = this.handleChangeDestinationStation.bind(this)

        this.hideAlert = this.hideAlert.bind(this)
    }

    componentDidMount() {
        this.fetchDeliveryStations();
    }

    fetchDeliveryStations() {
        fetch("http://localhost:8000/fuel/deliverystation", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                return response.json()
            })
            .then(result => {
                this.setState({delivery_stations: result})
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
                address: this.state.address,
                u_address: this.state.address,
                name: this.state.name,
                delivery_station: this.state.delivery_station,
                inn: this.state.inn,
                ogrn: this.state.ogrn,
            })
        };
        fetch("http://localhost:8000/fuel/counterparty/" + this.state.id + '/', requestOptions)
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

    handleChangeDestinationStation(event) {
        this.setState({delivery_station: event.target.value})
    }

    handleChangeAddress(event) {
        this.setState({address: event.target.value})
    }

    handleChangeUAddress(event) {
        this.setState({u_address: event.target.value})
    }

    handleChangeName(event) {
        this.setState({name: event.target.value})
    }

    handleChangeINN(event) {
        this.setState({inn: event.target.value})
    }

    handleChangeOGRN(event) {
        this.setState({ogrn: event.target.value})
    }

    hideAlert() {
        this.setState({success: false})
        this.setState({warning: false})
        window.location.reload();
    }

    render(){
        return (<div id='station-data' className="content">
            <Form>

                <Form.Group controlId="formGridUAddress">
                    <Form.Label>Юридическое наименование</Form.Label>
                    <Form.Control value={this.state.name} onChange={this.handleChangeName}/>
                </Form.Group>

                <Form.Group controlId="formGridUAddress">
                    <Form.Label>Юридический адресс</Form.Label>
                    <Form.Control value={this.state.u_address} onChange={this.handleChangeUAddress}/>
                </Form.Group>

                <Form.Group controlId="formGridAddress">
                    <Form.Label>Фактический адресс</Form.Label>
                    <Form.Control value={this.state.address} onChange={this.handleChangeAddress}/>
                </Form.Group>

                <Form.Row>
                    <Form.Group as={Col} controlId="formGridINN">
                        <Form.Label>ИНН</Form.Label>
                        <Form.Control value={this.state.inn} onChange={this.handleChangeINN}/>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridOGRN">
                        <Form.Label>ОГРН</Form.Label>
                        <Form.Control value={this.state.ogrn} onChange={this.handleChangeOGRN}/>
                    </Form.Group>
                </Form.Row>

                <Form.Group controlId="formGridDestStation">
                    <Form.Label>Станция отгрузки</Form.Label>
                    <Form.Control as="select" value={this.state.delivery_station} onChange={this.handleChangeDestinationStation}>
                        {this.state.delivery_stations.map(function(object, _){
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
        <CounterPartyForm row={row} />
    ),
};


class CounterParty extends Component {

    constructor(props) {
        super(props);

        this.state = {
            counterparties: []
        };
    }

    componentDidMount() {
        this.fetchStations();
    }

    fetchStations() {
        fetch("http://localhost:8000/fuel/counterparty", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(result => {
                console.log(result)
                for (let item of result) {
                    item['types_joined'] = item['types'].join('; ')
                }
                this.setState({counterparties: result})
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        return (
            <div>
                <BootstrapTable keyField={'id'}
                                data={this.state.counterparties}
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

export default CounterParty;