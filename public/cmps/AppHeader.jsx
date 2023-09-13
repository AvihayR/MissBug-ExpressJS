const { NavLink, Link, useNavigate } = ReactRouterDOM
const { useEffect, useState } = React

import { UserMsg } from './UserMsg.jsx'
import { LoginSignup } from './LoginSignup.jsx'
import { userService } from '../services/user.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'

export function AppHeader() {

  const [user, setUser] = useState(userService.getLoggedinUser())
  const navigate = useNavigate()

  function onLogout() {
    userService.logout()
      .then(() => {
        onSetUser(null)
      })
      .catch((err) => {
        showErrorMsg('Oops try again')
      })
  }

  function onSetUser(user) {
    setUser(user)
    navigate('/')
  }
  return (
    <header>
      <UserMsg />
      <nav>
        <NavLink to="/">Home</NavLink> |<NavLink to="/bug">Bugs</NavLink> |
        <NavLink to="/about">About</NavLink>
      </nav>
      <h1>Bugs are Forever</h1>
      {user ? (
        < section >

          <Link to={`/user/${user._id}`}>Hello {user.fullname}</Link>
          <button onClick={onLogout}>Logout</button>
        </ section >
      ) : (
        <section>
          <LoginSignup onSetUser={onSetUser} />
        </section>
      )}
    </header>
  )
}
