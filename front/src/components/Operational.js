import React, {Component,} from "react";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'react-bootstrap/Button'
import SweetAlert from "react-bootstrap-sweetalert";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Card from "react-bootstrap/Card"


const operation_types = []


const statuses = [
    'Черновик',
    'Отгружено',
    'В пути',
    'Доставлено',
]


const status_history_columns = [
    {
        dataField: 'status',
        text: "Статус",
    },
    {
        dataField: 'status_change_date',
        text: "Дата изменеия",
    },
    {
        dataField: 'user',
        text: "Пользователь",
    },
]


const columns = [
    {
        dataField: 'id',
        hidden: true,
    },
    {
        dataField: 'status_history',
        hidden: true,
    },
    {
        dataField: 'canceled_operation',
        hidden: true,
    },
    {
        dataField: 'dest_station',
        hidden: true,
    },
    {
        dataField: 'source_station',
        hidden: true,
    },
    {
        dataField: 'fuel_type',
        hidden: true,
    },
    {
        dataField: 'operation_type',
        text: "Тип операции",
    },
    {
        dataField: 'contract_number',
        text: 'Номер договора',
    },
    {
        dataField: 'created_at',
        text: 'Дата создания'
    },
    {
        dataField: 'waybill_numbers',
        text: 'Номера накладных'
    },
    {
        dataField: 'station',
        text: 'Станция'
    },
    {
        dataField: 'fuel_type',
        text: 'Виды топлива'
    },
    {
        dataField: 'status',
        text: 'Статус'
    },
    {
        dataField: 'status_change_date',
        text: 'Дата изменения статуса'
    },
];


class InternalOperationForm extends Component {

    constructor(props) {
        super(props);

        if (this.props.row != null) {

            this.state = {

                showForm: true,
                showHistory: false,

                row: this.props.row,
                id: this.props.row.id,

                operation_type: this.props.row.operation_type,
                created_at: this.props.row.created_at,
                status: this.props.row.status,
                status_change_date: this.props.row.status_change_date,
                status_history: this.props.row.status_history,

                source_station: this.props.row.source_station,
                dest_station: this.props.row.dest_station,
                fuel_type: this.props.row.fuel_type,

                waybills: this.props.row.waybills,

                fuels: [],
                stations: [],
                station_name_to_station: new Map(),
                organization_to_stations: new Map(),

                warning: false,
                success: false,
            }
        } else {
            this.state = {

                showForm: true,
                showHistory: false,

                row: null,
                id: null,

                operation_type: "Внутреннее перемещение",

                created_at: null,
                station: null,
                status: "Черновик",
                status_change_date: null,
                status_history: [],

                source_station: {
                    "id": null,
                    "name": "",
                    "organization": "",
                    "ceo_name": "",
                    "address": "",
                    "balance": [],
                    "destination_station": ""
                },
                dest_station: {
                    "id": null,
                    "name": "",
                    "organization": "",
                    "ceo_name": "",
                    "address": "",
                    "balance": [],
                    "destination_station": ""
                },
                fuel_type: null,

                waybills: [],

                fuels: [],
                stations: [],
                station_name_to_station: new Map(),
                organization_to_stations: new Map(),

                warning: false,
                success: false,
            }
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.hideAlert = this.hideAlert.bind(this)
    }

    componentDidMount() {
        this.fetchFuels()
        this.fetchStations()
    }

    fetchFuels() {
        fetch("http://82.148.16.250:8000/fuel/type/", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(result => {
                console.log(result)
                this.setState({fuels: result})
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
                let organization_to_stations = new Map();
                let station_name_to_station = new Map()
                for (const station of result) {
                    if (organization_to_stations[station.organization] === undefined) {
                        organization_to_stations[station.organization] = [station.name]
                    } else {
                        organization_to_stations[station.organization].push(station.name)
                    }
                    station_name_to_station[station.name] = station
                }
                this.setState({
                    stations: result,
                    station_name_to_station: station_name_to_station,
                    organization_to_stations: organization_to_stations
                })
            })
            .catch(e => {
                console.log(e);
            });
    }

    handleSubmit(event) {
        let method = 'POST'
        let url = "http://82.148.16.250:8000/fuel/operation/"

        if (this.state.id !== null) {
            method = 'PUT'
            url += this.state.id + '/'
        }

        let noDeleteObjects = []
        for (const obj of this.state.waybills) {
            if (obj.delete) {
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
                operation_type: this.state.operation_type,
                created_at: this.state.created_at,
                status: this.state.status,
                status_change_date: this.state.status_change_date,
                status_history: this.state.status_history,

                source_station: this.state.source_station,
                dest_station: this.state.dest_station,
                fuel_type: this.state.fuel_type,

                waybills: noDeleteObjects,

            })
        };
        fetch(url, requestOptions)
            .then(response => {
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

    hideAlert() {
        this.setState({success: false})
        this.setState({warning: false})
        window.location.reload();
    }

    render() {
        return (<div id='station-data' className="content">
            {this.state.id != null && <ButtonToolbar className="mb-3" aria-label="Toolbar with Button groups">
                <ButtonGroup className="mr-2" aria-label="First group">
                    <Button onClick={(event) => {
                        this.setState(
                            {
                                showForm: true,
                                showHistory: false,
                            }
                        )
                    }} variant="secondary">Операция</Button>
                    <Button onClick={(event) => {
                        this.setState(
                            {
                                showForm: false,
                                showHistory: true,
                            }
                        )
                    }} variant="secondary">История статусов</Button>
                </ButtonGroup>
            </ButtonToolbar>}

            {this.state.showForm && this.state.status !== 'Доставлено' && this.state.id !== null &&
            <Button className='margin_right' variant="secondary" type="default" onClick={(event) => {
                const currentIndexStatus = statuses.indexOf(this.state.status)
                const newStatus = statuses[currentIndexStatus + 1]
                let newWaybills = this.state.waybills
                for (let waybill of newWaybills) {
                    waybill.status_history[newStatus] = {
                        "amount": waybill.status_history[this.state.status].amount,
                        "wagons": waybill.status_history[this.state.status].wagons,
                        "created_at": (new Date()).toISOString().slice(0, 10),
                    }
                }
                this.setState({
                    waybills: newWaybills,
                    status: newStatus,
                })
            }}>
                Продвинуть по статусу
            </Button>}

            {this.state.showForm && this.state.status === 'Черновик' &&
            <Button className='margin_right' variant="secondary" type="default" onClick={(event) => {
                let newState = this.state.waybills
                let date
                if (this.state.waybills.length > 0) {
                    date = this.state.waybills[0].status_history["Черновик"]['created_at']
                } else {
                    date = (new Date()).toISOString().slice(0, 10)
                }
                newState.push(
                    {
                        "number": "",
                        "display": true,
                        "status_history": {
                            "Черновик": {
                                "amount": 0,
                                "wagons": 0,
                                "created_at": date
                            }
                        }
                    },
                )
                this.setState({waybills: newState})
            }}>
                Добавить накладную
            </Button>}

            {this.state.showForm && <Form className='margin_top'>
                <Form.Row>
                    <Form.Group as={Col} controlId="formGridNumber">
                        <Form.Label>Станция отправления</Form.Label>
                        <Form.Control disabled={this.state.status !== 'Черновик'} as='select' value={this.state.source_station.name}
                                      onChange={(event) => {
                                          this.setState({
                                              source_station: this.state.station_name_to_station[event.target.value],
                                              dest_station: {
                                                  "id": null,
                                                  "name": "",
                                                  "organization": "",
                                                  "ceo_name": "",
                                                  "address": "",
                                                  "balance": [],
                                                  "destination_station": ""
                                              }
                                          })
                                      }}>
                            {this.state.source_station.name !== null && <option>{this.state.source_station.name}</option>}
                            {this.state.stations.map((object, i) => {
                                if (this.state.source_station.name !== object['name']) {
                                    return <option>{object['name']}</option>
                                }
                            })}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridSubscribeAt">
                        <Form.Label>Станция отгрузки</Form.Label>
                        <Form.Control disabled={true} value={this.state.source_station.destination_station}
                                      onChange={(event) => {}}>
                        </Form.Control>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="formGridSubscribeAt">
                        <Form.Label>Станция получения</Form.Label>
                        <Form.Control disabled={this.state.source_station.name === "" || this.state.status !== 'Черновик'} as='select' value={this.state.dest_station.name}
                                      onChange={(event) => {
                                          this.setState({
                                              dest_station: this.state.station_name_to_station[event.target.value]
                                          })
                                      }}>
                            {this.state.dest_station.name !== null && <option>{this.state.dest_station.name}</option>}
                            {this.state.organization_to_stations[this.state.source_station.organization]?.map((object, i) => {
                                if (this.state.dest_station.name !== object && this.state.source_station.name !== object) {
                                    return <option>{object}</option>
                                }
                            })}
                        </Form.Control>

                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridSubscribeAt">
                        <Form.Label>Станция назначения</Form.Label>
                        <Form.Control disabled={true} value={this.state.dest_station.destination_station}
                                      onChange={(event) => {
                                      }}/>
                    </Form.Group>
                </Form.Row>

            <Form.Row>
                <Form.Group as={Col} controlId="formGridSubscribeAt">
                    <Form.Label>Тип топлива</Form.Label>
                    <Form.Control disabled={this.state.status !== 'Черновик'} as='select' value={this.state.fuel_type}
                                  onChange={(event) => {
                                      this.setState({
                                          fuel_type: event.target.value
                                      })
                                  }}>
                    {this.state.fuel_type === null && <option>{null}</option>}
                    {this.state.fuel_type !== null && <option>{this.state.fuel_type}</option>}
                    {this.state.fuels.map((object, i) => {
                        if (this.state.fuel_type !== object['name']) {
                            return <option>{object['name']}</option>
                        }
                    })}
                    </Form.Control>
                </Form.Group>
            </Form.Row>
            </Form>}

            {statuses.map((status_name, i) => {

                if (!this.state.showForm) {
                    return
                }

                if (this.state.waybills.length === 0) {
                    return
                }

                if (this.state.waybills[0]['status_history'][status_name] === undefined) {
                    return
                }
                return (
                    <Card className='margin_top'>
                        <Card.Header>Параметры статуса "{status_name}"</Card.Header>
                        <Card.Body>

                            <Form>
                                <Form.Group as={Row} controlId="formGridNumber">
                                    <Form.Label column sm="2">Дата изменения статуса</Form.Label>
                                    <Col sm="10">
                                        <Form.Control disabled={true} type="date"
                                                      value={this.state.waybills[0]['status_history'][status_name].created_at}
                                                      onChange={(event) => {
                                                      }}>
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                            </Form>

                            {this.state.waybills.map((waybill, i) => {
                                return (waybill['display'] &&
                                    <Card className='margin_top'>
                                        <Card.Header>Накалдная "{waybill.number}"</Card.Header>
                                        <Card.Body>
                                            <Form>
                                                <Form.Group as={Row} controlId="formGridNumber">
                                                    <Form.Label column sm="2">Номер накладной</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control disabled={this.state.status !== 'Черновик'}
                                                                      value={waybill.number}
                                                                      onChange={(event) => {
                                                                          let newState = this.state.waybills
                                                                          newState[i].number = event.target.value
                                                                          this.setState({waybills: newState})
                                                                      }}>
                                                        </Form.Control>
                                                    </Col>
                                                    <Form.Label column sm="2">Масса груза(нетто), тонн</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control
                                                            disabled={this.state.status !== 'Черновик' && this.state.status !== status_name}
                                                            type='number'
                                                            value={waybill.status_history[status_name]['amount']}
                                                            onChange={(event) => {
                                                                let newState = this.state.waybills
                                                                console.log(newState)
                                                                console.log(i)
                                                                newState[i].status_history[status_name].amount = event.target.value
                                                                this.setState({waybills: newState})
                                                            }}>
                                                        </Form.Control>
                                                    </Col>
                                                    <Form.Label column sm="2">Количество вагонов</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control
                                                            disabled={this.state.status !== 'Черновик' && this.state.status !== status_name}
                                                            type='number'
                                                            value={waybill.status_history[status_name]['wagons']}
                                                            onChange={(event) => {
                                                                let newState = this.state.waybills
                                                                newState[i].status_history[status_name].wagons = event.target.value
                                                                this.setState({waybills: newState})
                                                            }}>
                                                        </Form.Control>
                                                    </Col>
                                                </Form.Group>
                                            </Form>
                                            {this.state.status === 'Черновик' &&
                                            <Button className='margin_right' variant="danger" type="default"
                                                    onClick={(event) => {
                                                        let newState = this.state.waybills
                                                        newState[i].display = false
                                                        this.setState({waybills: newState})

                                                    }}>
                                                Удалить
                                            </Button>}
                                        </Card.Body>
                                    </Card>
                                )
                            })}

                        </Card.Body>
                    </Card>)
            })}

            {this.state.showForm &&
            <Button className='margin_top' variant="primary" type="submit" onClick={this.handleSubmit}>
                Сохранить
            </Button>}
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

            {this.state.showHistory && <BootstrapTable keyField={'status'}
                                                       data={this.state.status_history}
                                                       columns={status_history_columns}
                                                       bootstrap4={true}
                                                       bordered={true}
                                                       noDataIndication={'Данные не найдены'}
            />}

        </div>);
    }
}


class ReturnOperationForm extends Component {

    constructor(props) {
        super(props);

        if (this.props.row != null) {

            let id_to_operation = {}
            id_to_operation[this.props.row.canceled_operation['id']] = this.props.row.canceled_operation

            this.state = {

                showForm: true,
                showHistory: false,

                row: this.props.row,
                id: this.props.row.id,

                operation_type: this.props.row.operation_type,
                contract_object: this.props.row.contract_object,
                contract_object_id: this.props.row.contract_object['id'],
                created_at: this.props.row.created_at,
                station: this.props.row.station,
                status: this.props.row.status,
                status_change_date: this.props.row.status_change_date,
                status_history: this.props.row.status_history,

                waybills: this.props.row.waybills,
                contracts: [],
                contract_number: this.props.row.contract_number,
                contract_objects_to_number: {},

                canceled_operation: this.props.row.canceled_operation,
                delivery_operations: [],
                id_to_operation: id_to_operation,

                warning: false,
                success: false,
            }
        } else {
            this.state = {

                showForm: true,
                showHistory: false,

                row: null,
                id: null,

                operation_type: "Возврат поставщику",
                contract_object: {
                    "fuel_type": "",
                    "fuel_mark": "",
                    "shipper": "",
                    "amount": 0,
                    "price": 0,
                    "station": "",
                    "delivery_station": "",
                    "destination_station": ""
                },
                contract_object_id: null,
                created_at: null,
                station: null,
                status: "Черновик",
                status_change_date: null,
                status_history: [],

                waybills: [],
                contracts: [],
                contract_number: null,
                contract_objects_to_number: {},

                canceled_operation: {},
                delivery_operations: [],
                id_to_operation: {},

                warning: false,
                success: false,
            }
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.hideAlert = this.hideAlert.bind(this)
    }

    componentDidMount() {
        this.fetchContracts()
        this.fetchDeliveryOperations()
    }

    fetchDeliveryOperations() {
        fetch("http://82.148.16.250:8000/fuel/operation/get_delivery/", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                return response.json()
            })
            .then(result => {
                let waybill_numbers = []
                let id_to_operation = this.state.id_to_operation
                if (this.state.canceled_operation !== {}) {
                    result.push(this.state.canceled_operation)
                }
                for (let r of result) {
                    for (const w of r['waybills']) {
                        waybill_numbers.push(w.number)
                    }
                    r['waybill_numbers'] = waybill_numbers
                    id_to_operation[r['id']] = r
                }
                this.setState({delivery_operations: result})
                this.setState({id_to_operation: id_to_operation})
            })
            .catch(e => {
                console.log(e);
            });
    }

    fetchContracts() {
        fetch("http://82.148.16.250:8000/fuel/contract/", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                return response.json()
            })
            .then(result => {
                let contract_objects_to_number = {}
                for (const contract of result) {
                    contract_objects_to_number[contract['number']] = contract['contract_objects']
                }
                this.setState({
                    contracts: result,
                    contract_objects_to_number: contract_objects_to_number,
                })
            })
            .catch(e => {
                console.log(e);
            });
    }

    handleSubmit(event) {
        let method = 'POST'
        let url = "http://82.148.16.250:8000/fuel/operation/"
        if (this.state.id !== null) {
            method = 'PUT'
            url += this.state.id + '/'
        }

        let noDeleteObjects = []
        for (const obj of this.state.waybills) {
            if (obj.display) {
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
                operation_type: this.state.operation_type,
                contract_object: this.state.contract_object,
                contract_object_id: this.state.contract_object_id,
                created_at: this.state.created_at,
                station: this.state.station,
                status: this.state.status,
                status_change_date: this.state.status_change_date,
                status_history: this.state.status_history,
                waybills: noDeleteObjects,
                canceled_operation: this.state.canceled_operation,
            })
        };
        fetch(url, requestOptions)
            .then(response => {
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

    hideAlert() {
        this.setState({success: false})
        this.setState({warning: false})
        window.location.reload();
    }

    render() {
        return (<div id='station-data' className="content">
            {this.state.id != null && <ButtonToolbar className="mb-3" aria-label="Toolbar with Button groups">
                <ButtonGroup className="mr-2" aria-label="First group">
                    <Button onClick={(event) => {
                        this.setState(
                            {
                                showForm: true,
                                showHistory: false,
                            }
                        )
                    }} variant="secondary">Операция</Button>
                    <Button onClick={(event) => {
                        this.setState(
                            {
                                showForm: false,
                                showHistory: true,
                            }
                        )
                    }} variant="secondary">История статусов</Button>
                </ButtonGroup>
            </ButtonToolbar>}

            {this.state.showForm && this.state.status !== 'Доставлено' && this.state.id !== null &&
            <Button className='margin_right' variant="secondary" type="default" onClick={(event) => {
                const currentIndexStatus = statuses.indexOf(this.state.status)
                const newStatus = statuses[currentIndexStatus + 1]
                let newWaybills = this.state.waybills
                for (let waybill of newWaybills) {
                    waybill.status_history[newStatus] = {
                        "amount": waybill.status_history[this.state.status].amount,
                        "wagons": waybill.status_history[this.state.status].wagons,
                        "created_at": (new Date()).toISOString().slice(0, 10),
                    }
                }
                this.setState({
                    waybills: newWaybills,
                    status: newStatus,
                })
            }}>
                Продвинуть по статусу
            </Button>}

            {this.state.showForm && <Form>
                <Form.Group className='margin_top' as={Row} controlId="formGridNumber">
                    <Form.Label column sm="2">Операция и накалдные</Form.Label>
                    <Col sm="10">
                        <Form.Control disabled={this.state.status !== 'Черновик'} as="select"
                                      onChange={(event) => {
                                        const id = event.target.value.split('/ ').slice(-1)[0]
                                          const operation = this.state.id_to_operation[Number(id)]
                                          let waybills = []
                                          if (operation !== null && operation !== undefined) {
                                              for (const w of operation.waybills) {
                                                  waybills.push({
                                                      "number": w.number,
                                                      "display": true,
                                                      "status_history": {
                                                          "Черновик": {
                                                              "amount": w['status_history']['Черновик']['amount'],
                                                              "wagons": w['status_history']['Черновик']['wagons'],
                                                              "created_at": (new Date()).toISOString().slice(0, 10),
                                                          }
                                                      }
                                                  })
                                              }

                                              this.setState({
                                                  waybills: waybills,
                                                  contract_number: operation.contract_number,
                                                  contract_object_id: operation.contract_object.id,
                                                  contract_object: operation.contract_object,
                                                  canceled_operation: operation
                                              })
                                          } else {
                                              this.setState({
                                                  waybills: waybills,
                                                  contract_number: null,
                                                  contract_object_id: null,
                                                  contract_object: {
                                                      "fuel_type": "",
                                                      "fuel_mark": "",
                                                      "shipper": "",
                                                      "amount": 0,
                                                      "price": 0,
                                                      "station": "",
                                                      "delivery_station": "",
                                                      "destination_station": ""
                                                  },
                                                  canceled_operation: {},
                                              })
                                          }
                                      }}>
                            {this.state.id === null && <option>{null}</option>}
                            {this.state.canceled_operation['id'] !== undefined && <option>{this.state.canceled_operation.contract_number + ' / (' + this.state.canceled_operation.waybill_numbers.join(', ') + ') / ' + this.state.canceled_operation.id}</option>}
                            {this.state.delivery_operations.map((object, i) => {
                                if (this.state.canceled_operation['id'] !== object['id']) {
                                    return <option>{object['contract_number'] + ' / (' + object['waybill_numbers'].join(', ') + ') / ' + object['id']}</option>
                                }
                            })}
                        </Form.Control>
                    </Col>
                </Form.Group>
            </Form>}


            {statuses.map((status_name, i) => {

                if (!this.state.showForm) {
                    return
                }

                if (this.state.waybills.length === 0) {
                    return
                }

                if (this.state.waybills[0]['status_history'][status_name] === undefined) {
                    return
                }
                return (
                    <Card className='margin_top'>
                        <Card.Header>Параметры статуса "{status_name}"</Card.Header>
                        <Card.Body>

                            <Form>
                                <Form.Group as={Row} controlId="formGridNumber">
                                    <Form.Label column sm="2">Дата изменения статуса</Form.Label>
                                    <Col sm="10">
                                        <Form.Control disabled={true} type="date"
                                                      value={this.state.waybills[0]['status_history'][status_name].created_at}
                                                      onChange={(event) => {
                                                      }}>
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                            </Form>

                            {this.state.waybills.map((waybill, i) => {
                                return (waybill['display'] &&
                                    <Card className='margin_top'>
                                        <Card.Header>Накалдная "{waybill.number}"</Card.Header>
                                        <Card.Body>
                                            <Form>
                                                <Form.Group as={Row} controlId="formGridNumber">
                                                    <Form.Label column sm="2">Номер накладной</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control disabled={this.state.status !== 'Черновик'}
                                                                      value={waybill.number}
                                                                      onChange={(event) => {
                                                                          let newState = this.state.waybills
                                                                          newState[i].number = event.target.value
                                                                          this.setState({waybills: newState})
                                                                      }}>
                                                        </Form.Control>
                                                    </Col>
                                                    <Form.Label column sm="2">Масса груза(нетто), тонн</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control
                                                            disabled={this.state.status !== 'Черновик' && this.state.status !== status_name}
                                                            type='number'
                                                            value={waybill.status_history[status_name]['amount']}
                                                            onChange={(event) => {
                                                                let newState = this.state.waybills
                                                                newState[i].status_history[status_name].amount = event.target.value
                                                                this.setState({waybills: newState})
                                                            }}>
                                                        </Form.Control>
                                                    </Col>
                                                    <Form.Label column sm="2">Количество вагонов</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control
                                                            disabled={this.state.status !== 'Черновик' && this.state.status !== status_name}
                                                            type='number'
                                                            value={waybill.status_history[status_name]['wagons']}
                                                            onChange={(event) => {
                                                                let newState = this.state.waybills
                                                                newState[i].status_history[status_name].wagons = event.target.value
                                                                this.setState({waybills: newState})
                                                            }}>
                                                        </Form.Control>
                                                    </Col>
                                                </Form.Group>
                                            </Form>
                                            {this.state.status === 'Черновик' &&
                                            <Button className='margin_right' variant="danger" type="default"
                                                    onClick={(event) => {
                                                        let newState = this.state.waybills
                                                        newState[i].display = false
                                                        this.setState({waybills: newState})

                                                    }}>
                                                Удалить
                                            </Button>}
                                        </Card.Body>
                                    </Card>
                                )
                            })}

                        </Card.Body>
                    </Card>)
            })}


            {this.state.showForm && <Card className='margin_top'>
                <Card.Header>Предмет договора по операции</Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group as={Row} controlId="formGridNumber">
                            <Form.Label column sm="2">Договор</Form.Label>
                            <Col sm="10">
                                <Form.Control disabled={true} as="select"
                                              onChange={(event) => {
                                                  this.setState({
                                                      contract_number: event.target.value,
                                                      contract_object: {
                                                          "fuel_type": "",
                                                          "fuel_mark": "",
                                                          "shipper": "",
                                                          "amount": 0,
                                                          "price": 0,
                                                          "station": "",
                                                          "delivery_station": "",
                                                          "destination_station": ""
                                                      },
                                                      contract_object_id: null,
                                                  })
                                              }}>
                                    <option>{this.state.contract_number}</option>
                                    {this.state.contracts.map((object, i) => {
                                        if (this.state.contract_number !== object['number']) {
                                            return <option>{object['number']}</option>
                                        }
                                    })}
                                </Form.Control>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} controlId="formGridNumber">
                            <Form.Label column sm="2">Предмет договора</Form.Label>
                            <Col sm="10">
                                <Form.Control disabled={true} as="select"
                                              onChange={(event) => {
                                                  if (event.target.value === "") {
                                                      this.setState({
                                                          contract_object: {
                                                              "id": "",
                                                              "fuel_type": "",
                                                              "fuel_mark": "",
                                                              "shipper": "",
                                                              "amount": 0,
                                                              "price": 0,
                                                              "station": "",
                                                              "delivery_station": "",
                                                              "destination_station": ""
                                                          },
                                                          contract_object_id: null
                                                      })
                                                      return
                                                  }
                                                  let contract_object = {}
                                                  for (const obj of this.state.contract_objects_to_number[this.state.contract_number]) {
                                                      if (obj['id'] === Number(event.target.value.split('/').slice(-1)[0])) {
                                                          contract_object = obj
                                                      }
                                                  }
                                                  this.setState({
                                                      contract_object: contract_object,
                                                      contract_object_id: contract_object['id'],
                                                  })
                                              }}>
                                    {this.state.contract_object_id === null && <option>{null}</option>}
                                    {this.state.contract_object_id !== null && this.state.contract_number !== null &&
                                    <option>{this.state.contract_number + '/' + this.state.contract_object_id}</option>}
                                    {this.state.contract_objects_to_number[this.state.contract_number]?.map((object, i) => {
                                        if (this.state.contract_object_id !== object['id']) {
                                            return <option>{this.state.contract_number + '/' + object['id']}</option>
                                        }
                                    })}
                                </Form.Control>
                            </Col>
                        </Form.Group>

                        <Form.Row>
                            <Form.Group as={Col} controlId="formGridNumber">
                                <Form.Label>Вид топлива</Form.Label>
                                <Form.Control disabled={true} value={this.state.contract_object.fuel_type}
                                              onChange={(event) => {
                                              }}>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Марка топлива</Form.Label>
                                <Form.Control disabled={true} value={this.state.contract_object.fuel_mark}
                                              onChange={(event) => {
                                              }}>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Количество</Form.Label>
                                <Form.Control disabled={true} type="number" value={this.state.contract_object.amount}
                                              onChange={(event) => {
                                              }}/>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Стоимость (без НДС)</Form.Label>
                                <Form.Control disabled={true} type='number' value={this.state.contract_object.price}
                                              onChange={(event) => {
                                              }}/>
                            </Form.Group>

                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Грузоотправитель</Form.Label>
                                <Form.Control disabled={true} value={this.state.contract_object.shipper}
                                              onChange={(event) => {
                                              }}>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Станция</Form.Label>
                                <Form.Control disabled={true} value={this.state.contract_object.station}
                                              onChange={(event) => {
                                              }}>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Станция отгрузки</Form.Label>
                                <Form.Control disabled={true} value={this.state.contract_object.delivery_station}>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Станция назначения</Form.Label>
                                <Form.Control disabled={true} value={this.state.contract_object.destination_station}>
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>
                    </Form>
                </Card.Body>
            </Card>}


            {this.state.showForm && <Card>
                <Card.Header>Информация о качестве</Card.Header>
                <Card.Body>
                </Card.Body>
            </Card>}

            {this.state.showForm &&
            <Button className='margin_top' variant="primary" type="submit" onClick={this.handleSubmit}>
                Сохранить
            </Button>}
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

            {this.state.showHistory && <BootstrapTable keyField={'status'}
                                                       data={this.state.status_history}
                                                       columns={status_history_columns}
                                                       bootstrap4={true}
                                                       bordered={true}
                                                       noDataIndication={'Данные не найдены'}
            />}

        </div>);
    }
}


class DeliveryOperationForm extends Component {

    constructor(props) {
        super(props);

        if (this.props.row != null) {

            this.state = {

                showForm: true,
                showHistory: false,

                row: this.props.row,
                id: this.props.row.id,

                operation_type: this.props.row.operation_type,
                contract_object: this.props.row.contract_object,
                contract_object_id: this.props.row.contract_object['id'],
                created_at: this.props.row.created_at,
                station: this.props.row.station,
                status: this.props.row.status,
                status_change_date: this.props.row.status_change_date,
                status_history: this.props.row.status_history,

                waybills: this.props.row.waybills,
                contracts: [],
                contract_number: this.props.row.contract_number,
                contract_objects_to_number: {},

                warning: false,
                success: false,
            }
        } else {
            this.state = {

                showForm: true,
                showHistory: false,

                row: null,
                id: null,

                operation_type: 'Поставка от поставщика',
                contract_object: {
                    "fuel_type": "",
                    "fuel_mark": "",
                    "shipper": "",
                    "amount": 0,
                    "price": 0,
                    "station": "",
                    "delivery_station": "",
                    "destination_station": ""
                },
                contract_object_id: null,
                created_at: null,
                station: null,
                status: "Черновик",
                status_change_date: null,
                status_history: [],

                waybills: [],
                contracts: [],
                contract_number: null,
                contract_objects_to_number: {},

                warning: false,
                success: false,
            }
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.hideAlert = this.hideAlert.bind(this)
    }

    componentDidMount() {
        this.fetchContracts()
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

    fetchContracts() {
        fetch("http://82.148.16.250:8000/fuel/contract/", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                return response.json()
            })
            .then(result => {
                let contract_objects_to_number = {}
                for (const contract of result) {
                    contract_objects_to_number[contract['number']] = contract['contract_objects']
                }
                this.setState({
                    contracts: result,
                    contract_objects_to_number: contract_objects_to_number,
                })
            })
            .catch(e => {
                console.log(e);
            });
    }

    handleSubmit(event) {
        let method = 'POST'
        let url = "http://82.148.16.250:8000/fuel/operation/"
        if (this.state.id !== null) {
            method = 'PUT'
            url += this.state.id + '/'
        }

        let noDeleteObjects = []
        for (const obj of this.state.waybills) {
            if (obj.display) {
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
                operation_type: this.state.operation_type,
                contract_object: this.state.contract_object,
                contract_object_id: this.state.contract_object_id,
                created_at: this.state.created_at,
                station: this.state.station,
                status: this.state.status,
                status_change_date: this.state.status_change_date,
                status_history: this.state.status_history,
                waybills: noDeleteObjects,
            })
        };
        fetch(url, requestOptions)
            .then(response => {
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

    hideAlert() {
        this.setState({success: false})
        this.setState({warning: false})
        window.location.reload();
    }

    render() {
        return (<div id='station-data' className="content">
            {this.state.id != null && <ButtonToolbar className="mb-3" aria-label="Toolbar with Button groups">
                <ButtonGroup className="mr-2" aria-label="First group">
                    <Button onClick={(event) => {
                        this.setState(
                            {
                                showForm: true,
                                showHistory: false,
                            }
                        )
                    }} variant="secondary">Операция</Button>
                    <Button onClick={(event) => {
                        this.setState(
                            {
                                showForm: false,
                                showHistory: true,
                            }
                        )
                    }} variant="secondary">История статусов</Button>
                </ButtonGroup>
            </ButtonToolbar>}

            {this.state.showForm && this.state.status === 'Черновик' &&
            <Button className='margin_right' variant="secondary" type="default" onClick={(event) => {
                let newState = this.state.waybills
                let date
                if (this.state.waybills.length > 0) {
                    date = this.state.waybills[0].status_history["Черновик"]['created_at']
                } else {
                    date = (new Date()).toISOString().slice(0, 10)
                }
                newState.push(
                    {
                        "number": "",
                        "display": true,
                        "status_history": {
                            "Черновик": {
                                "amount": 0,
                                "wagons": 0,
                                "created_at": date
                            }
                        }
                    },
                )
                this.setState({waybills: newState})
            }}>
                Добавить накладную
            </Button>}

            {this.state.showForm && this.state.status !== 'Доставлено' && this.state.id !== null &&
            <Button className='margin_right' variant="secondary" type="default" onClick={(event) => {
                const currentIndexStatus = statuses.indexOf(this.state.status)
                const newStatus = statuses[currentIndexStatus + 1]
                let newWaybills = this.state.waybills
                for (let waybill of newWaybills) {
                    waybill.status_history[newStatus] = {
                        "amount": waybill.status_history[this.state.status].amount,
                        "wagons": waybill.status_history[this.state.status].wagons,
                        "created_at": (new Date()).toISOString().slice(0, 10),
                    }
                }
                this.setState({
                    waybills: newWaybills,
                    status: newStatus,
                })
            }}>
                Продвинуть по статусу
            </Button>}


            {statuses.map((status_name, i) => {

                if (!this.state.showForm) {
                    return
                }

                if (this.state.waybills.length === 0) {
                    return
                }

                if (this.state.waybills[0]['status_history'][status_name] === undefined) {
                    return
                }
                return (
                    <Card className='margin_top'>
                        <Card.Header>Параметры статуса "{status_name}"</Card.Header>
                        <Card.Body>

                            <Form>
                                <Form.Group as={Row} controlId="formGridNumber">
                                    <Form.Label column sm="2">Дата изменения статуса</Form.Label>
                                    <Col sm="10">
                                        <Form.Control disabled={true} type="date"
                                                      value={this.state.waybills[0]['status_history'][status_name].created_at}
                                                      onChange={(event) => {
                                                      }}>
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                            </Form>

                            {this.state.waybills.map((waybill, i) => {
                                return (waybill['display'] &&
                                    <Card className='margin_top'>
                                        <Card.Header>Накалдная "{waybill.number}"</Card.Header>
                                        <Card.Body>
                                            <Form>
                                                <Form.Group as={Row} controlId="formGridNumber">
                                                    <Form.Label column sm="2">Номер накладной</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control disabled={this.state.status !== 'Черновик'}
                                                                      value={waybill.number}
                                                                      onChange={(event) => {
                                                                          let newState = this.state.waybills
                                                                          newState[i].number = event.target.value
                                                                          this.setState({waybills: newState})
                                                                      }}>
                                                        </Form.Control>
                                                    </Col>
                                                    <Form.Label column sm="2">Масса груза(нетто), тонн</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control
                                                            disabled={this.state.status !== 'Черновик' && this.state.status !== status_name}
                                                            type='number'
                                                            value={waybill.status_history[status_name]['amount']}
                                                            onChange={(event) => {
                                                                let newState = this.state.waybills
                                                                newState[i].status_history[status_name].amount = event.target.value
                                                                this.setState({waybills: newState})
                                                            }}>
                                                        </Form.Control>
                                                    </Col>
                                                    <Form.Label column sm="2">Количество вагонов</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control
                                                            disabled={this.state.status !== 'Черновик' && this.state.status !== status_name}
                                                            type='number'
                                                            value={waybill.status_history[status_name]['wagons']}
                                                            onChange={(event) => {
                                                                let newState = this.state.waybills
                                                                newState[i].status_history[status_name].wagons = event.target.value
                                                                this.setState({waybills: newState})
                                                            }}>
                                                        </Form.Control>
                                                    </Col>
                                                </Form.Group>
                                            </Form>
                                            {this.state.status === 'Черновик' &&
                                            <Button className='margin_right' variant="danger" type="default"
                                                    onClick={(event) => {
                                                        let newState = this.state.waybills
                                                        newState[i].display = false
                                                        this.setState({waybills: newState})

                                                    }}>
                                                Удалить
                                            </Button>}
                                        </Card.Body>
                                    </Card>
                                )
                            })}

                        </Card.Body>
                    </Card>)
            })}


            {this.state.showForm && <Card className='margin_top'>
                <Card.Header>Предмет договора по операции</Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group as={Row} controlId="formGridNumber">
                            <Form.Label column sm="2">Договор</Form.Label>
                            <Col sm="10">
                                <Form.Control disabled={this.state.status !== 'Черновик'} as="select"
                                              onChange={(event) => {
                                                  this.setState({
                                                      contract_number: event.target.value,
                                                      contract_object: {
                                                          "fuel_type": "",
                                                          "fuel_mark": "",
                                                          "shipper": "",
                                                          "amount": 0,
                                                          "price": 0,
                                                          "station": "",
                                                          "delivery_station": "",
                                                          "destination_station": ""
                                                      },
                                                      contract_object_id: null,
                                                  })
                                              }}>
                                    <option>{this.state.contract_number}</option>
                                    {this.state.contracts.map((object, i) => {
                                        if (this.state.contract_number !== object['number']) {
                                            return <option>{object['number']}</option>
                                        }
                                    })}
                                </Form.Control>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} controlId="formGridNumber">
                            <Form.Label column sm="2">Предмет договора</Form.Label>
                            <Col sm="10">
                                <Form.Control
                                    disabled={this.state.status !== 'Черновик' || this.state.contract_number === null}
                                    as="select"
                                    onChange={(event) => {
                                        if (event.target.value === "") {
                                            this.setState({
                                                contract_object: {
                                                    "id": "",
                                                    "fuel_type": "",
                                                    "fuel_mark": "",
                                                    "shipper": "",
                                                    "amount": 0,
                                                    "price": 0,
                                                    "station": "",
                                                    "delivery_station": "",
                                                    "destination_station": ""
                                                },
                                                contract_object_id: null
                                            })
                                            return
                                        }
                                        let contract_object = {}
                                        for (const obj of this.state.contract_objects_to_number[this.state.contract_number]) {
                                            if (obj['id'] === Number(event.target.value.split('/').slice(-1)[0])) {
                                                contract_object = obj
                                            }
                                        }
                                        this.setState({
                                            contract_object: contract_object,
                                            contract_object_id: contract_object['id'],
                                        })
                                    }}>
                                    {this.state.contract_object_id === null && <option>{null}</option>}
                                    {this.state.contract_object_id !== null && this.state.contract_number !== null &&
                                    <option>{this.state.contract_number + '/' + this.state.contract_object_id}</option>}
                                    {this.state.contract_objects_to_number[this.state.contract_number]?.map((object, i) => {
                                        if (this.state.contract_object_id !== object['id']) {
                                            return <option>{this.state.contract_number + '/' + object['id']}</option>
                                        }
                                    })}
                                </Form.Control>
                            </Col>
                        </Form.Group>

                        <Form.Row>
                            <Form.Group as={Col} controlId="formGridNumber">
                                <Form.Label>Вид топлива</Form.Label>
                                <Form.Control disabled={true} value={this.state.contract_object.fuel_type}
                                              onChange={(event) => {
                                              }}>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Марка топлива</Form.Label>
                                <Form.Control disabled={true} value={this.state.contract_object.fuel_mark}
                                              onChange={(event) => {
                                              }}>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Количество</Form.Label>
                                <Form.Control disabled={true} type="number" value={this.state.contract_object.amount}
                                              onChange={(event) => {
                                              }}/>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Стоимость (без НДС)</Form.Label>
                                <Form.Control disabled={true} type='number' value={this.state.contract_object.price}
                                              onChange={(event) => {
                                              }}/>
                            </Form.Group>

                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Грузоотправитель</Form.Label>
                                <Form.Control disabled={true} value={this.state.contract_object.shipper}
                                              onChange={(event) => {
                                              }}>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Станция</Form.Label>
                                <Form.Control disabled={true} value={this.state.contract_object.station}
                                              onChange={(event) => {
                                              }}>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Станция отгрузки</Form.Label>
                                <Form.Control disabled={true} value={this.state.contract_object.delivery_station}>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Станция назначения</Form.Label>
                                <Form.Control disabled={true} value={this.state.contract_object.destination_station}>
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>
                    </Form>
                </Card.Body>
            </Card>}


            {this.state.showForm && <Card>
                <Card.Header>Информация о качестве</Card.Header>
                <Card.Body>
                </Card.Body>
            </Card>}

            {this.state.showForm &&
            <Button className='margin_top' variant="primary" type="submit" onClick={this.handleSubmit}>
                Сохранить
            </Button>}
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

            {this.state.showHistory && <BootstrapTable keyField={'status'}
                                                       data={this.state.status_history}
                                                       columns={status_history_columns}
                                                       bootstrap4={true}
                                                       bordered={true}
                                                       noDataIndication={'Данные не найдены'}
            />}

        </div>);
    }
}


class OperationTypeChecker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            operation_type: this.props.operation_type,
            row: this.props.row
        }
    }

    render() {
        return (<div>
                {this.state.operation_type === 'Поставка от поставщика' && <DeliveryOperationForm row={this.state.row}/>}
                {this.state.operation_type === 'Возврат поставщику' && <ReturnOperationForm row={this.state.row}/>}
                {this.state.operation_type === 'Внутреннее перемещение' && <InternalOperationForm row={this.state.row}/>}
            </div>
        )
    }

}


const expandRow = {
    onlyOneExpanding: true,
    parentClassName: 'active',
    renderer: row => (
        <OperationTypeChecker row={row} operation_type={row.operation_type}/>
    ),
};


class Operations extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showDeliveryForm: false,
            showReturnForm: false,
            showInternalForm: false,
            operations: []
        };

        this.handleShowForm = this.handleShowForm.bind(this)
    }

    componentDidMount() {
        this.fetchOperations();
    }

    fetchOperations() {
        fetch("http://82.148.16.250:8000/fuel/operation", {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(result => {
                for (let r of result) {
                    let waybills_numbers = []
                    for (let waybill of r.waybills) {
                        waybills_numbers.push(waybill.number)
                        waybill['display'] = true
                    }
                    r['waybill_numbers'] = waybills_numbers.join(', ')
                }
                this.setState({operations: result})
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
                <ButtonToolbar className="mb-3" aria-label="Toolbar with Button groups">
                    <ButtonGroup className="mr-2" aria-label="First group">
                        <Button onClick={(event) => {
                            this.setState({
                                showDeliveryForm: !this.state.showDeliveryForm,
                                showReturnForm: false,
                                showInternalForm: false,
                            })
                        }} variant="outline-primary">+ Поставка от поставщика</Button>
                        <Button onClick={(event) => {
                            this.setState({
                                showDeliveryForm: false,
                                showReturnForm: !this.state.showReturnForm,
                                showInternalForm: false,
                            })
                        }} variant="outline-primary">+ Возврат поставщику</Button>
                        <Button onClick={(event) => {
                            this.setState({
                                showDeliveryForm: false,
                                showReturnForm: false,
                                showInternalForm: !this.state.showInternalForm
                            })
                        }} variant="outline-primary">+ Внутреннее перемещение</Button>
                    </ButtonGroup>
                </ButtonToolbar>
                {this.state.showDeliveryForm && <DeliveryOperationForm/>}
                {this.state.showReturnForm && <ReturnOperationForm/>}
                {this.state.showInternalForm && <InternalOperationForm/>}
                <BootstrapTable keyField={'id'}
                                data={this.state.operations}
                                columns={columns}
                                bootstrap4={true}
                                bordered={true}
                                expandRow={expandRow}
                                noDataIndication={'Данные не найдены'}
                />
            </div>
        );
    }
}

export default Operations;