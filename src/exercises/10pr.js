// control props

import React from 'react'
import {Switch} from '../switch'

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach((fn) => fn && fn(...args))

class Toggle extends React.Component {
  static defaultProps = {
    initialOn: false,
    onReset: () => {},
    onStateChange: () => {},
    onToggle: () => {},
    stateReducer: (state, changes) => changes,
  }

  static stateChangesTypes = {
    reset: '__toggle_reset__',
    toggle: '__toggle_toggle__',
  }
  initialState = {on: this.props.initialOn}
  state = this.initialState

  isControlled(prop) {
    return this.props[prop] !== undefined
  }

  getState(state = this.state) {
    return Object.entries(state).reduce((newState, [key, value]) => {
      if (this.isControlled(key)) {
        newState[key] = this.props[key]
      } else {
        newState[key] = state[key]
      }
      return newState
    }, {})
  }

  internalSetState = (changes, callback) => {
    let allChanges
    this.setState(
      (state) => {
        const combinedState = this.getState(state)
        const changesObject =
          typeof changes === 'function'
            ? changes(combinedState)
            : changes
        allChanges = this.props.stateReducer(
          combinedState,
          changesObject,
        )
        const nonControlledChanges = Object.keys(
          combinedState,
        ).reduce((acc, stateKey) => {
          if (this.isControlled(stateKey)) {
            acc[stateKey] = allChanges[stateKey]
          }

          return acc
        }, {})
        const {type: ignoredType, ...onlyChanges} = allChanges

        return Object.keys(nonControlledChanges).length
          ? onlyChanges
          : null
      },
      () => {
        this.props.onStateChange(
          allChanges,
          this.getStateAndHelpers(),
        )
        callback()
      },
    )
  }

  reset = () =>
    // 🐨 add a `type` string property to this call
    this.internalSetState({type: 'reset', ...this.initialState}, () =>
      this.props.onReset(this.getState().on),
    )
  // 🐨 accept a `type` property here and give it a default value
  toggle = ({type = 'toggle'} = {}) =>
    this.internalSetState(
      // pass the `type` string to this object
      ({on}) => ({type, on: !on}),
      () => this.props.onToggle(this.getState().on),
    )
  getTogglerProps = ({onClick, ...props} = {}) => ({
    // 🐨 change `this.toggle` to `() => this.toggle()`
    // to avoid passing the click event to this.toggle.
    onClick: callAll(onClick, () => this.toggle()),
    'aria-pressed': this.getState().on,
    ...props,
  })
  getStateAndHelpers() {
    return {
      on: this.getState().on,
      toggle: this.toggle,
      reset: this.reset,
      getTogglerProps: this.getTogglerProps,
    }
  }
  render() {
    // 🐨 rather than getting state from this.state,
    // let's use our `getState` method.
    const {on} = this.getState()
    return <Switch on={on} onClick={this.toggle} />
  }
}

// These extra credit ideas are to expand this solution to elegantly handle
// more state properties than just a single `on` state.
// 💯 Make the `getState` function generic enough to support all state in
// `this.state` even if we add any number of properties to state.
// 💯 Add support for an `onStateChange` prop which is called whenever any
// state changes. It should be called with `changes` and `state`
// 💯 Add support for a `type` property in the `changes` you pass to
// `onStateChange` so consumers can differentiate different state changes.

// Don't make changes to the Usage component. It's here to show you how your
// component is intended to be used and is used in the tests.
// You can make all the tests pass by updating the Toggle component.
class Usage extends React.Component {
  state = {bothOn: false}
  handleToggle = (on) => {
    this.setState({bothOn: on})
  }
  render() {
    const {bothOn} = this.state
    const {toggle1Ref, toggle2Ref} = this.props
    return (
      <div>
        <Toggle
          on={bothOn}
          onToggle={this.handleToggle}
          ref={toggle1Ref}
        />
        <Toggle
          on={bothOn}
          onToggle={this.handleToggle}
          ref={toggle2Ref}
        />
      </div>
    )
  }
}
Usage.title = 'Control Props'

export {Toggle, Usage as default}
