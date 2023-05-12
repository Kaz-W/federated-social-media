/** Central point for getting the domain name for the local server. */
const getDomain = () => process.env.DOMAIN ?? 'http://[::1]:3000';

export default getDomain;
