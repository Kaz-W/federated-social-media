import api from "../utils/api";

export const auth = {
  signin: (userContext) => {
    return async ({ username, password }) => {
      const signInRes = await api.post('/signin', { username, password });
      if (signInRes.ok) {
        sessionStorage.setItem('user', JSON.stringify(signInRes.data));

        const userRes = await api.get('/whoAmIUsername');
        if (userRes.ok) {
          userContext.updateUser(userRes.data);
        } else {
          console.error(`Couldn't update user component! ${userRes.err}`);
        }
      } else {
        if (!signInRes.err) {
          signInRes.err = "Error signing in.";
        }
      }



      return signInRes;
    };
  },

  signout: (userContext) => {
    return () => {
      sessionStorage.removeItem('user');
      if (userContext) userContext.updateUser(null);
    };
  },

  signup: (userContext) => {
    return async ({username, password, password_reentered}) => {

      //client-side check that repetitions of passwords entered are the same
      if (!(password === password_reentered)) {
        return {ok: false, err: "Passwords must match."};
      }
      const res = await api.post('/signup', {username, password});
      if (res.ok && res.data.status === 'Success') {
        // User creation successful - now sign in.
        return await auth.signin(userContext)({username, password});
      }

      if (res.err) {
        console.log(res.err)
      }

      if (!res.err) {
        res.err = "Error signing in.";
      }

      return res;
    };
  },

  current: () => {
    const user = sessionStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }

    return null;
  }
}
