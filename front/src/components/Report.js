import React, {Component} from "react";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import BootstrapTable from "react-bootstrap-table-next";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import SweetAlert from "react-bootstrap-sweetalert";


class Report extends Component {

    constructor(props) {
        super(props);

        this.state = {
            stations: [],
            organizations: [],
            station: null,
            organization: null,
            start_date: (new Date()).toISOString().slice(0, 10),
            end_date: (new Date()).toISOString().slice(0, 10),

            warning: false,
            success: false,
        };

    }

    componentDidMount() {
        this.fetchStations();
        this.fetchOrganizations();
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

    handleSubmit() {

    }

    hideAlert() {
        this.setState({success: false})
        this.setState({warning: false})
    }

    render() {
        return (
            <div id='station-data' className="content">
                <Form>
                        <Form.Row>
                            <Form.Group as={Col} controlId="formGridNumber">
                                <Form.Label>Начало отчетного периода</Form.Label>
                                <Form.Control type="date" value={this.state.start_date} onChange={(event) => {
                                    this.setState({
                                        start_date: event.target.value
                                    })
                                }}/>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridSubscribeAt">
                                <Form.Label>Окончание отчетного периода</Form.Label>
                                <Form.Control type="date" value={this.state.end_date} onChange={(event) => {
                                    this.setState({
                                        end_date: event.target.value
                                    })
                                }}/>
                            </Form.Group>
                        </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} controlId="formGridOrganization">
                            <Form.Label>Организация (ДЗО)</Form.Label>
                            <Form.Control as="select" value={this.state.organization} onChange={this.handleChangeOrganization}>
                                {this.state.organization == null}<option>{""}</option>
                                {this.state.organizations.map((object, _) => {
                                    if (this.state.organization !== object.name) {
                                        return <option>{object.name}</option>;
                                    }
                                })}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group as={Col} controlId="formGridName">
                            <Form.Label>Станция</Form.Label>
                            <Form.Control as="select" value={this.state.station} onChange={this.handleChangeOrganization}>
                                {this.state.station == null}<option>{""}</option>
                                {this.state.stations.map((object, _) => {
                                    if (this.state.station !== object.name) {
                                        return <option>{object.name}</option>;
                                    }
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Form.Row>
                </Form>

                <Button className='margin_top' variant="primary" type="submit" onClick={this.handleSubmit}>
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
                        title="Отчет сформирован!"
                        onConfirm={this.hideAlert}
                    />
                }
            </div>
        );
    }
}

export default Report;