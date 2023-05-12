import React, {Component} from 'react';
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import {UserContext} from "./utils/user.context";

import IndexPage from "./pages/index/Index.page";
import SignInPage from "./pages/auth/signIn/SignIn.page";
import SignUpPage from "./pages/auth/signUp/SignUp.page";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute.component";
import ProfilePage from "./pages/profile/Profile.page";
import AdminPage from "./pages/admin/Admin.page";
import NotFoundPage from "./pages/notFound/NotFound.page";
import {auth} from "./services/auth.service";
import api from "./utils/api";
import LoadingPage from "./pages/loading/Loading.page";

class App extends Component {

  constructor(props) {
    super(props);

    this.updateUser = this.updateUser.bind(this);

    this.state = {
      user: null,
      updateUser: this.updateUser
    };
  }

  async componentDidMount() {
    const { user } = this.state;

    // If the user is logged in but no user object is in the context provider, go fetch it.
    if (auth.current() != null && user == null) {
      const res = await api.get('/whoAmIUsername');
      if (res.ok) {
        this.setState({user: res.data});
      } else {
        console.error("Uh oh, user token expired - automatically logging out");
        // Automatically sign the user out
        let signoutAction = auth.signout();
        signoutAction();
      }
    }
  }

  updateUser(user) {
    console.log(user);
    this.setState({user});
  }

  render() {
    const { user } = this.state;
    const loading = auth.current() != null && user == null;

    return (
      <>
        <LoadingPage mounted={loading} />
        {!loading &&
          <UserContext.Provider value={this.state}>
            <Router>
              <Switch>
                <Route exact path={'/'} render={() => <Redirect to={'/feed'} />} />
                <Route exact path={'/feed/:selectedSubforumLink'} component={IndexPage}/>
                <Route exact path={'/feed'} component={IndexPage}/>
                <Route exact path={'/auth/sign-in'} component={SignInPage}/>
                <Route exact path={'/auth/sign-up'} component={SignUpPage}/>
                <ProtectedRoute exact path={'/profile'} component={ProfilePage}/>
                <ProtectedRoute exact path={'/admin'} component={AdminPage}/>
                <Route exact path={'/profile/:profileUrl'}
                       render={(props) => {
                         return <ProfilePage {...props.match.params} />
                       }}/>
                <Route component={NotFoundPage}/>
              </Switch>
            </Router>
          </UserContext.Provider>
        }
      </>
    );
  }
}

export default App;
