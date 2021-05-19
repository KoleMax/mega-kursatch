import React, {Component,} from "react";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'react-bootstrap/Button'
import SweetAlert from "react-bootstrap-sweetalert";
import Card from "react-bootstrap/Card";


const columns = [
    {
        dataField: 'id',
        hidden: true,
    },
    {
        dataField: 'contract_objects',
        hidden: true,
    },
    {
        dataField: 'number',
        hidden: true,
    },
    {
        dataField: 'subscribe_at',
        text: "Дата подписания",
    },
    {
        dataField: 'provider',
        text: 'Поставщик'
    },
    {
        dataField: 'customer',
        text: 'Юр. лицо'
    },
    {
        dataField: 'amount',
        text: 'Количество (тонн)',
    },
    {
        dataField: 'price',
        text: 'Стоимость (без НДС)'
    },
    {
        dataField: 'start_at',
        text: 'Начало действия договора'
    },
    {
        dataField: 'end_at',
        text: 'Конец действия договора'
    }
];


class CounterPartyForm extends Component {

    constructor(props) {
        super(props);
        if (this.props.row != null) {

            let total_price= 0
            let total_amount = 0
            for (const item of this.props.row.contract_objects) {
                total_price += Number(item.price)
                total_amount += Number(item.amount)
                this.props.row.contract_objects['delete'] = false
            }

            this.state = {
                row: this.props.row,
                id: this.props.row.id,
                number: this.props.row.number,
                subscribe_at: this.props.row.subscribe_at,
                provider: this.props.row.provider,
                customer: this.props.row.customer,
                start_at: this.props.row.start_at,
                end_at: this.props.row.end_at,

                contract_objects: this.props.row.contract_objects,

                fuels: new Map(),
                fuels_array: [],
                providers: [],
                shippers: [],
                shippers_stations: new Map(),
                stations: [],
                customers_to_stations: new Map(),
                stations_dest_stations: new Map(),
                customers: [],

                amount: total_amount,
                price: total_price,

                warning: false,
                success: false,
            }
        } else {
            this.state = {
                row: null,
                id: null,
                number: null,
                subscribe_at: null,
                provider: null,
                customer: null,
                start_at: null,
                end_at: null,

                contract_objects: [],

                fuels: new Map(),
                fuels_array: [],
                providers: [],
                shippers: [],
                shippers_stations: new Map(),
                stations: [],
                customers_to_stations: new Map(),
                stations_dest_stations: new Map(),
                customers: [],

                amount: 0,
                price: 0,

                warning: false,
                success: false,
            }
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChangeNumber = this.handleChangeNumber.bind(this)
        this.handleChangeSubscribeAt = this.handleChangeSubscribeAt.bind(this)
        this.handleChangeStartAt = this.handleChangeStartAt.bind(this)
        this.handleChangeEndAt = this.handleChangeEndAt.bind(this)
        this.handleChangeProvider = this.handleChangeProvider.bind(this)
        this.handleChangeCustomer = this.handleChangeCustomer.bind(this)

        this.handleAddObject = this.handleAddObject.bind(this)
        this.handleDeleteObject = this.handleDeleteObject.bind(this)
        this.makeHandleDeleteObject = this.makeHandleDeleteObject.bind(this)

        this.makeHandleChangeFuelTypeObject = this.makeHandleChangeFuelTypeObject.bind(this)

        this.countTotalAmount = this.countTotalAmount.bind(this)
        this.countTotalPrice = this.countTotalPrice.bind(this)

        this.hideAlert = this.hideAlert.bind(this)
    }

    componentDidMount() {
        this.fetchFuels()
        this.fetchProviders();
        this.fetchShippers();
        this.fetchStations()
        this.fetchOrganizations();
    }

    fetchFuels() {
        fetch("http://82.148.16.250:8000/fuel/type", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                return response.json()
            })
            .then(result => {
                let fuels = new Map()
                let fuels_array = []
                for (const item of result) {
                    fuels[item.name] = item.marks
                    fuels_array.push(item.name)
                }
                this.setState({fuels: fuels})
                this.setState({fuels_array: fuels_array})
            })
            .catch(e => {
                console.log(e);
            });
    }

    fetchProviders() {
        fetch("http://82.148.16.250:8000/fuel/counterparty/get_providers", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                return response.json()
            })
            .then(result => {
                this.setState({providers: result})
            })
            .catch(e => {
                console.log(e);
            });
    }

    fetchShippers() {
        fetch("http://82.148.16.250:8000/fuel/counterparty/get_shippers", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                return response.json()
            })
            .then(result => {
                let shippers_stations = new Map();
                for (const item of result) {
                    shippers_stations[item.name] = item.delivery_station
                }
                this.setState({shippers: result})
                this.setState({shippers_stations: shippers_stations})
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
                let destination_stations = new Map();
                let customers_to_stations = new Map();
                for (const item of result) {
                    destination_stations[item.name] = item.destination_station
                    if (customers_to_stations[item.organization] === undefined) {
                        customers_to_stations[item.organization] = [item.name]
                    } else {
                        customers_to_stations[item.organization].push(item.name)
                    }
                }
                this.setState({stations: result})
                this.setState({customers_to_stations: customers_to_stations})
                this.setState({stations_dest_stations: destination_stations})
                console.log(this.state.customers_to_stations)
            })
            .catch(e => {
                console.log(e);
            });
    }

    handleSubmit(event) {
        let method = 'POST'
        let url = "http://82.148.16.250:8000/fuel/contract/"
        if (this.state.id !== null) {
            method = 'PUT'
            url += this.state.id + '/'
        }

        let noDeleteObjects = []
        for (const obj of this.state.contract_objects) {
            if (!obj.delete) {
                noDeleteObjects.push(obj)
            }
        }

        const requestOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                id: this.state.id,
                contract_objects: noDeleteObjects,
                number: this.state.number,
                subscribe_at: this.state.subscribe_at,
                provider: this.state.provider,
                customer: this.state.customer,
                start_at: this.state.start_at,
                end_at: this.state.end_at,
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

    fetchOrganizations() {
        fetch("http://82.148.16.250:8000/fuel/organization", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                return response.json()
            })
            .then(result => {
                this.setState({customers: result})
            })
            .catch(e => {
                console.log(e);
            });
    }

    handleChangeNumber(event) {
        this.setState({number: event.target.value})
    }

    handleChangeSubscribeAt(event) {
        this.setState({subscribe_at: event.target.value})
    }

    handleChangeProvider(event) {
        this.setState({provider: event.target.value})
    }

    handleChangeCustomer(event) {
        this.setState({customer: event.target.value})
        let newContractObject = this.state.contract_objects
        for (let item of newContractObject) {
            item.station = null
            item.destination_station = null
        }
        this.setState({contract_objects: newContractObject})
    }

    handleChangeStartAt(event) {
        this.setState({start_at: event.target.value})
    }

    handleChangeEndAt(event) {
        this.setState({end_at: event.target.value})
    }

    handleAddObject(event) {
        let newState = this.state.contract_objects
        newState.push({
            id: null,
            delete: false,
            fuel_type: null,
            fuel_mark: null,
            shipper: null,
            amount: 0,
            price: 0,
            station: null,
            destination_station: null,
            delivery_station: null,
        })
        this.setState({contract_objects: newState})
    }

    makeHandleChangeFuelTypeObject(i_) {
        return (event) => {
            const i = i_
            let newState = this.state.contract_objects
            newState[i].fuel_type = event.target.value
            this.setState({contract_objects: newState})
        }
    }

    makeHandleDeleteObject(i) {
        return (event) => {
            this.setState({contract_objects: this.state.contract_objects.splice(i, 1)})
        }
    }

    handleDeleteObject(event) {
        this.setState({contract_objects: this.state.contract_objects.pop()})
    }

    hideAlert() {
        this.setState({success: false})
        this.setState({warning: false})
        window.location.reload();
    }

    countTotalAmount() {
        let total_amount = 0
        for (const item of this.state.contract_objects) {
            total_amount += Number(item.amount)
        }
        this.setState({amount: total_amount})
    }

    countTotalPrice() {
        let total_price= 0
        for (const item of this.state.contract_objects) {
            total_price += Number(item.price)
        }
        this.setState({price: total_price})
    }

    render(){
        return (<div id='station-data' className="content">
            <Form>
                <Form.Row>
                    <Form.Group as={Col} controlId="formGridNumber">
                        <Form.Label>Номер договора</Form.Label>
                        <Form.Control value={this.state.number} onChange={this.handleChangeNumber}/>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridSubscribeAt">
                        <Form.Label>Дата подписания договора</Form.Label>
                        <Form.Control type="date" value={this.state.subscribe_at} onChange={this.handleChangeSubscribeAt}/>
                    </Form.Group>
                </Form.Row>

                <Form.Group controlId="formGridProvider">
                    <Form.Label>Поставщик</Form.Label>
                    <Form.Control as="select" value={this.state.provider} onChange={this.handleChangeProvider}>
                        {this.state.provider === null && <option>{null}</option>}
                        {this.state.providers.map(function(object, _){
                            return <option>{object.name}</option>;
                        })}
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formGridProvider">
                    <Form.Label>Покупатель</Form.Label>
                    <Form.Control as="select" value={this.state.customer} onChange={this.handleChangeCustomer}>
                        {this.state.customer === null && <option>{null}</option>}
                        {this.state.customers.map(function(object, _){
                            return <option>{object.name}</option>;
                        })}
                    </Form.Control>
                </Form.Group>

                <Form.Row>
                    <Form.Group as={Col} controlId="formGridNumber">
                        <Form.Label>Дата начала действия договора</Form.Label>
                        <Form.Control type="date" value={this.state.start_at} onChange={this.handleChangeStartAt}/>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridSubscribeAt">
                        <Form.Label>Дата окончания действия договора</Form.Label>
                        <Form.Control type="date" value={this.state.end_at} onChange={this.handleChangeEndAt}/>
                    </Form.Group>
                </Form.Row>

                <Form.Row>
                    <Form.Group as={Col} controlId="formGridNumber">
                        <Form.Label>Количество по договору, тонн</Form.Label>
                        <Form.Control type="number" disabled={true} value={this.state.amount} />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridSubscribeAt">
                        <Form.Label>Сумма по договору (без НДС), руб</Form.Label>
                        <Form.Control type="number" disabled={true} value={this.state.price} />
                    </Form.Group>
                </Form.Row>

                <Button className='margin_right' variant="secondary" type="default" onClick={this.handleAddObject}>
                    Добавить объект договора
                </Button>

                {this.state.contract_objects.map((object, i) => {
                    return (!object.delete &&
                            <Card className='margin_top'>
                                <Card.Header>Предмет договора #{i + 1}</Card.Header>
                        <Card.Body>
                        <Form className='margin_top'>
                            <Form.Row>
                                <Form.Group as={Col} controlId="formGridNumber">
                                    {<Form.Label>Вид топлива</Form.Label>}
                                    <Form.Control as="select" disabled={false} value={this.state.contract_objects[i].fuel_type} onChange={(event) => {
                                        let newState = this.state.contract_objects
                                        newState[i].fuel_type = event.target.value
                                        if (this.state.fuels[this.state.contract_objects[i].fuel_type].length === 1) {
                                            newState[i].fuel_mark = this.state.fuels[this.state.contract_objects[i].fuel_type][0]
                                        } else {
                                            newState[i].fuel_mark = null
                                        }
                                        this.setState({contract_objects: newState})
                                    }}>
                                        {this.state.contract_objects[i].fuel_type === null && <option>{null}</option>}
                                        {this.state.fuels_array.map(function(object, key){
                                            return <option>{object}</option>;
                                        })}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridSubscribeAt">
                                    {<Form.Label>Марка топлива</Form.Label>}
                                    <Form.Control as="select" disabled={this.state.contract_objects[i].fuel_type === null} value={this.state.contract_objects[i].fuel_mark} onChange={(event) => {
                                        let newState = this.state.contract_objects
                                        newState[i].fuel_mark = event.target.value
                                        this.setState({contract_objects: newState})
                                    }}>
                                        {this.state.fuels[this.state.contract_objects[i].fuel_type]?.map(function(object, _){
                                            return <option>{object}</option>;
                                        })}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridSubscribeAt">
                                    {<Form.Label>Грузоотправитель</Form.Label>}
                                    <Form.Control as="select" value={this.state.contract_objects[i].shipper} onChange={(event) => {
                                        let newState = this.state.contract_objects
                                        newState[i].shipper = event.target.value
                                        newState[i].delivery_station = this.state.shippers_stations[event.target.value]
                                        this.setState({contract_objects: newState})
                                    }}>
                                        {this.state.contract_objects[i].shipper === null && <option>{null}</option>}
                                        {this.state.shippers.map(function(object, key){
                                            return <option>{object.name}</option>;
                                        })}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridSubscribeAt">
                                    {<Form.Label>Количество</Form.Label>}
                                    <Form.Control type="number" value={this.state.contract_objects[i].amount} onChange={(event) => {
                                        let newState = this.state.contract_objects
                                        newState[i].amount = event.target.value
                                        this.setState({contract_objects: newState})
                                        this.countTotalAmount()
                                    }}/>
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridSubscribeAt">
                                    {<Form.Label>Стоимость (без НДС)</Form.Label>}
                                    <Form.Control type='number' value={this.state.contract_objects[i].price} onChange={(event) => {
                                        let newState = this.state.contract_objects
                                        newState[i].price = event.target.value
                                        this.setState({contract_objects: newState})
                                        this.countTotalPrice()
                                    }}/>
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridSubscribeAt">
                                    {<Form.Label>Станция</Form.Label>}
                                    <Form.Control as="select" disabled={this.state.customer==null} value={this.state.contract_objects[i].station} onChange={(event) => {
                                        let newState = this.state.contract_objects
                                        newState[i].station = event.target.value
                                        newState[i].destination_station = this.state.stations_dest_stations[event.target.value]
                                        this.setState({contract_objects: newState})
                                    }}>
                                        {this.state.contract_objects[i].station === null && <option>{null}</option>}
                                        {this.state.customers_to_stations[this.state.customer]?.map(function(object, _){
                                            return <option>{object}</option>;
                                        })}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridSubscribeAt">
                                    {<Form.Label>Станция отгрузки</Form.Label>}
                                    <Form.Control as="select" disabled={true} value={this.state.contract_objects[i].delivery_station}>
                                        <option>{this.state.contract_objects[i].delivery_station}</option>
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridSubscribeAt">
                                    {<Form.Label>Станция назначения</Form.Label>}
                                    <Form.Control as="select" disabled={true} value={this.state.contract_objects[i].destination_station}>
                                        <option>{this.state.contract_objects[i].destination_station}</option>
                                    </Form.Control>
                                </Form.Group>
                            </Form.Row>
                            <Button variant="danger" type="default" onClick={(event) => {
                                let newState = this.state.contract_objects
                                newState[i].delete = true
                                this.setState({contract_objects: newState})
                                this.countTotalAmount()
                                this.countTotalPrice()
                            }}>
                                Удалить
                            </Button>
                        </Form>
                        </Card.Body>
                            </Card>
                    );
                })}

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


class Contracts extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showForm: false,
            contracts: []
        };

        this.handleShowForm = this.handleShowForm.bind(this)
    }

    componentDidMount() {
        this.fetchContracts();
    }

    fetchContracts() {
        fetch("http://82.148.16.250:8000/fuel/contract", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(result => {
                this.setState({contracts: result})
            })
            .catch(e => {
                console.log(e);
            });
    }

    handleShowForm(event) {
        this.setState({showForm: !this.state.showForm})
    }

    render() {
        return (
            <div>
                <Button className='margin_bottom' variant="outline-primary" type="default" onClick={this.handleShowForm}>
                    + Создать договор
                </Button>
                {this.state.showForm && <CounterPartyForm />}
                <BootstrapTable keyField={'id'}
                                data={this.state.contracts}
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

export default Contracts;