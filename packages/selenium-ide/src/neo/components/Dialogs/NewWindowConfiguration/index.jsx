// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Modal from '../../Modal'
import LabelledInput from '../../LabelledInput'
import Checkbox from '../../Checkbox'
import DialogContainer from '../Dialog'
import FlatButton from '../../FlatButton'
import './style.css'

export default class NewWindowConfigurationDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    cancel: PropTypes.func,
    isUniqueWindowName: PropTypes.func,
  }

  render() {
    return (
      <Modal
        className={classNames('stripped', 'new-window-dialog')}
        isOpen={this.props.isOpen}
        onRequestClose={this.props.cancel}
      >
        <NewWindowInput {...this.props} />
      </Modal>
    )
  }
}

class NewWindowInput extends React.Component {
  static propTypes = {
    cancel: PropTypes.func.isRequired,
    command: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
    this.handleWindowNameChange = this.handleWindowNameChange.bind(this)
    this.handleWindowTimeoutChange = this.handleWindowTimeoutChange.bind(this)
    this.handleWindowTimeoutBlur = this.handleWindowTimeoutBlur.bind(this)
    this.isInvalidOption = this.isInvalidOption.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.state = {
      isInvalidName: false,
      options: {
        windowName: props.command.windowHandleName,
        windowTimeout: props.command.windowTimeout,
      },
    }
  }
  handleCheckboxChange(e) {
    this.props.command.setOpensWindow(e.target.checked)
  }
  handleInputChange(type, value) {
    const result = { [type]: value }
    this.setState({
      ['options']: {
        ...this.state.options,
        ...result,
      },
    })
  }
  handleWindowNameChange(value) {
    this.isInvalidOption(value)
    this.handleInputChange('windowName', value)
  }
  handleWindowTimeoutChange(value) {
    const result = value === '' ? value : parseInt(value)
    this.handleInputChange('windowTimeout', result)
  }
  handleWindowTimeoutBlur() {
    if (this.state.options.windowTimeout === '')
      this.handleInputChange('windowTimeout', 0)
  }
  isInvalidOption(value) {
    const isEmpty = value === ''
    const isNonUnique = !this.props.isUniqueWindowName(
      value,
      this.props.command.id
    )
    const isInvalid = isEmpty || isNonUnique
    const errorMessage = isInvalid
      ? isEmpty
        ? 'Name cannot be empty'
        : 'Name must be unique'
      : undefined
    this.setState({
      ...this.state,
      isInvalidName: isInvalid,
      errorMessage: errorMessage,
    })
  }
  onSubmit() {
    this.props.command.setWindowHandleName(this.state.options.windowName)
    this.props.command.setWindowTimeout(this.state.options.windowTimeout)
    this.props.cancel()
  }
  render() {
    return (
      <DialogContainer
        title="New Window Configuration"
        type={this.state.isInvalidName ? 'warn' : 'info'}
        renderFooter={() => (
          <div className="right">
            <FlatButton onClick={this.props.cancel}>cancel</FlatButton>
            <FlatButton
              type="submit"
              disabled={this.state.isInvalidName}
              onClick={this.onSubmit}
            >
              {'confirm'}
            </FlatButton>
          </div>
        )}
        onRequestClose={this.props.cancel}
      >
        <p>
          This command opens a new window. For accurate playback some additional
          information is needed.
        </p>
        <Checkbox
          label="Enable/Disable New Window Configuration"
          form={true}
          checked={this.props.command && this.props.command.opensWindow}
          disabled={!this.props.command}
          onChange={this.handleCheckboxChange}
        />
        {this.props.command && this.props.command.opensWindow ? (
          <React.Fragment>
            <LabelledInput
              name="windowName"
              label="Window Name"
              value={this.state.options.windowName}
              onChange={this.handleWindowNameChange}
            />
            {this.state.isInvalidName && (
              <span className="message">* {this.state.errorMessage}</span>
            )}
            <p>
              This tells the IDE how to interact with the new window. To make
              your tests more readable, change it to something descriptive.
            </p>
            <LabelledInput
              name="windowTimeout"
              label="Timeout (milliseconds)"
              type="number"
              value={this.state.options.windowTimeout}
              onChange={this.handleWindowTimeoutChange}
              onBlur={this.handleWindowTimeoutBlur}
            />
            <p>
              This is the amount of time the test will wait for the new window
              to finish opening.
            </p>
          </React.Fragment>
        ) : null}
      </DialogContainer>
    )
  }
}