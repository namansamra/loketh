import React, { Component } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import BaseDatetime from 'react-datetime';
import { FaCalendarAlt } from 'react-icons/fa';

import 'react-datetime/css/react-datetime.css';

class Datetime extends Component {
  render() {
    const { placeholder, required, ...props } = this.props;

    return (
      <BaseDatetime
        {...props}
        dateFormat="DD MMM YYYY"
        timeFormat="HH:mm"
        renderInput={props => {
          return (
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                {...props}
                readOnly
                required={required}
                placeholder={placeholder}
              />
            </InputGroup>
          );
        }}
      />
    );
  }
}

export default Datetime;
