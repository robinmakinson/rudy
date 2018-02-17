import createTest from '../../__helpers__/createTest'

createTest('re-dispatching state.from behaves as if original action was dispatched', {
  SECOND: {
    path: '/second',
    beforeEnter: ({ dispatch, action }) => {
      if (action.allow) return
      dispatch({ type: 'REDIRECTED' })
    }
  }
}, [], async ({ dispatch, getState }) => {
  let res = await dispatch({ type: 'SECOND' })

  expect(res.type).toEqual('REDIRECTED_COMPLETE')

  // users can simply dispatch `state.from` whenever they are ready to take the user
  // to where the user initially tried to go
  const { from } = getState().location
  expect(from).toMatchSnapshot()
  from.allow = true // for our simple example, we'll add this key/val to make `beforeEnter` not redirect
  res = await dispatch(from)

  expect(res.type).toEqual('SECOND')

  expect(res).toMatchSnapshot('response')
  expect(getState()).toMatchSnapshot('state')
})