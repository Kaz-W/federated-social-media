import {useState} from "react";
import {useHistory} from "react-router-dom";

/*
* React hook for wrapping the logic of attempted auth actions.
* */

function useAuth(action, redirectUrl, defaults) {

  const [ data, setData ] = useState(defaults);
  const [ busy, setBusy ] = useState(false);
  const [ failed, setFailed ] = useState(null);
  const history = useHistory();

  function handleChange(tag) {
    return function (e) {
      setData(d => ({...d, [tag]: e.target.value}));
    }
  }

  async function submit(e) {
    e.preventDefault();

    setBusy(true);
    setFailed(null);

    const res = await action(data);

    if (res.ok) {
      history.push(redirectUrl);
    } else {
      setFailed(res.err);
    }

    setBusy(false);
  }

  return [ handleChange, submit, busy, failed ];
}

export default useAuth;
