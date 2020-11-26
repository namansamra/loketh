import React, { Component } from 'react';
import { Button, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';
import {
  FaCalendar,
  FaCalendarAlt,
  FaMoneyBillAlt,
  FaUserCircle,
  FaUserFriends
} from 'react-icons/fa';

import { handleError, toEvent } from '../utils';

class BuyTicketForm extends Component {
  state = {
    event: null,
    isBuying: false,
    isPaymentSucceed: false,
    loaded: false,
    userAlreadyHasTheTicket: false,
    userIsTheOwner: false
  };

  componentDidMount = async () => {
    await this.getEvent();
  };

  componentDidUpdate = async (prevProps, prevState) => {
    if (
      (this.props.event !== prevProps.event) ||
      (
        !this.state.loaded && (
          this.state.loaded !== prevState.loaded
        )
      )
    ) {
      await this.getEvent();
    }
  };

  getEvent = async () => {
    try {
      this.setState({ loaded: false });

      const { accounts, event: e, loketh } = this.props;

      const [account] = accounts;

      if (e) {
        const event = await loketh.methods.getEvent(e.id).call({
          from: account
        });

        const userAlreadyHasTheTicket = (
          await loketh.methods.participantHasTicket(account, e.id).call({
            from: account
          })
        );

        const userIsTheOwner = (
          await loketh.methods.organizerOwnsEvent(account, e.id).call({
            from: account
          })
        );

        this.setState({
          event: toEvent(event, e.id),
          loaded: true,
          userAlreadyHasTheTicket,
          userIsTheOwner
        });
      }
    } catch (error) {
      handleError(error);
    }
  };

  render() {
    const {
      accounts,
      loketh,
      onHide = () => {},
      show = false
    } = this.props;

    const {
      event,
      isBuying,
      isPaymentSucceed,
      loaded,
      userAlreadyHasTheTicket,
      userIsTheOwner
    } = this.state;

    let submitButtonChildren = null;
    const spinner = (<Spinner animation="border" />);

    if (isBuying) {
      submitButtonChildren = isPaymentSucceed
        ? 'Payment succeed! See your tickets in My Tickets page.'
        : spinner;
    } else {
      if (userAlreadyHasTheTicket) {
        submitButtonChildren = (
          'You are already buy this ticket. Check out My Tickets page.'
        );
      } else if (userIsTheOwner) {
        submitButtonChildren = 'Can not buy your own event ticket!';
      } else {
        submitButtonChildren = 'Buy Ticket';
      }
    }

    return (
      <Modal
        show={show}
        onHide={() => {
          this.setState({
            event: null,
            isBuying: false,
            isPaymentSucceed: false,
            loaded: false
          }, () => {
            onHide();
          });
        }}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton={!isBuying || isPaymentSucceed}>
          <Modal.Title>Buy Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            loaded ? (
              <Form onSubmit={async (e) => {
                e.preventDefault();

                this.setState({ isBuying: true });

                try {
                  await loketh.methods.buyTicket(event.id).send({
                    from: accounts[0],
                    value: event.price
                  });

                  this.setState({ isBuying: true, isPaymentSucceed: true });

                  await this.getEvent();
                } catch (error) {
                  handleError(error);

                  this.setState({ isBuying: false, isPaymentSucceed: false });
                }
              }}>
                <Form.Group>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text><FaCalendar /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control value={event.name} readOnly />
                  </InputGroup>
                </Form.Group>
                <Form.Group>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      value={
                        `${event.startTimeDisplay} - ${event.endTimeDisplay}`
                      }
                      readOnly
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text><FaUserCircle /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control value={event.organizer} readOnly />
                  </InputGroup>
                </Form.Group>
                <Form.Group>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text><FaMoneyBillAlt /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control value={event.priceInEth} readOnly />
                    <InputGroup.Append>
                      <InputGroup.Text>ETH</InputGroup.Text>
                    </InputGroup.Append>
                  </InputGroup>
                </Form.Group>
                <Form.Group>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text><FaUserFriends /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      value={
                        `${event.soldCounter} / ${event.quota}`
                      }
                      readOnly
                    />
                  </InputGroup>
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  block
                  disabled={(
                    isBuying || userAlreadyHasTheTicket || userIsTheOwner
                  )}
                >
                  {submitButtonChildren}
                </Button>
              </Form>
            ) : (
              <div className="d-flex justify-content-center">
                {spinner}
              </div>
            )
          }
        </Modal.Body>
      </Modal>
    );
  }
}

export default BuyTicketForm;