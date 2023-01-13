// The provider pattern
import React, {Fragment} from 'react'
import {Switch} from '../switch'

// 🐨 create your React context here with React.createContext
const ToggleContext = React.createContext({
  on: false,
  toggle: () => {},
  reset: () => {},
  getTogglerProps: () => {},
})

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach((fn) => fn && fn(...args))

class Toggle extends React.Component {
  // 🐨 expose the ToggleContext.Consumer as a static property of Toggle here.
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

  static Consumer = ToggleContext.Consumer

  reset = () =>
    this.internalSetState({type: 'reset', ...this.initialState}, () =>
      this.props.onReset(this.getState().on),
    )

  toggle = () =>
    this.setState(
      ({on}) => ({on: !on}),
      () => this.props.onToggle(this.state.on),
    )

  getTogglerProps = ({onClick, ...props} = {}) => ({
    // 🐨 change `this.toggle` to `() => this.toggle()`
    // to avoid passing the click event to this.toggle.
    onClick: callAll(onClick, () => this.toggle()),
    'aria-pressed': this.getState().on,
    ...props,
  })

  initialState = {
    on: this.props.initialOn,
    toggle: this.toggle,
    reset: this.reset,
    getTogglerProps: this.getTogglerProps,
  }
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
        this.props.onStateChange(allChanges, this.state)
        callback()
      },
    )
  }

  render() {
    // 🐨 replace this with rendering the ToggleContext.Provider
    return (
      <ToggleContext.Provider value={this.state}>
        {this.props.children}
      </ToggleContext.Provider>
    )
  }
}

// 💯 Extra credit: Add a custom Consumer that validates the
// ToggleContext.Consumer is rendered within a provider
//
// 💯 Extra credit: avoid unecessary re-renders by only updating the value when
// state changes
//
// 💯 Extra credit: support render props as well
//
// 💯 Extra credit: support (and expose) compound components!

// Don't make changes to the Usage component. It's here to show you how your
// component is intended to be used and is used in the tests.
// You can make all the tests pass by updating the Toggle component.

//function Nav() {
//  return (
//    <Toggle.Consumer>
//      {(toggle) => (
//        <nav>
//          <ul>
//            <li>
//              <a href="index.html">{toggle.on ? '🏠' : 'Home'}</a>
//            </li>
//            <li>
//              <a href="/about">{toggle.on ? '❓' : 'About'}</a>
//            </li>
//            <li>
//              <a href="index.html">{toggle.on ? '📖' : 'Blog'}</a>
//            </li>
//          </ul>
//        </nav>
//      )}
//    </Toggle.Consumer>
//  )
//}

const Layer1 = () => <Layer2 />
const Layer2 = () => (
  <Toggle.Consumer>
    {({on}) => (
      <Fragment>
        {on ? 'The button is on' : 'The button is off'}
        <Layer3 />
      </Fragment>
    )}
  </Toggle.Consumer>
)
const Layer3 = () => <Layer4 />
const Layer4 = () => (
  <Toggle.Consumer>
    {({on, toggle}) => <Switch on={on} onClick={toggle} />}
  </Toggle.Consumer>
)

function Usage({
  onToggle = (...args) => console.log('onToggle', ...args),
}) {
  return (
    <Toggle onToggle={onToggle}>
      <Layer1 />
    </Toggle>
  )
}

/*
// without the changes you're going to make,
// this is what the usage would look like. You're looking at "prop drilling"

const Layer1 = ({on, toggle}) => <Layer2 on={on} toggle={toggle} />
const Layer2 = ({on, toggle}) => (
  <Fragment>
    {on ? 'The button is on' : 'The button is off'}
    <Layer3 on={on} toggle={toggle} />
  </Fragment>
)
const Layer3 = ({on, toggle}) => <Layer4 on={on} toggle={toggle} />
const Layer4 = ({on, toggle}) => <Switch on={on} onClick={toggle} />

function Usage({
  onToggle = (...args) => console.log('onToggle', ...args),
}) {
  return (
    <Toggle onToggle={onToggle}>
      {({on, toggle}) => <Layer1 on={on} toggle={toggle} />}
    </Toggle>
  )
}
*/

Usage.title = 'The Provider Pattern'

export {Toggle, Usage as default}
