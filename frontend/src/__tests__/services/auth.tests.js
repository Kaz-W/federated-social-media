import api from '../../utils/api';
import {auth} from "../../services/auth.service";

const defaultUser = { username: "username", password: "password123", password_reentered: "password123"}

jest.mock('../../utils/api');

const mockUserContext = { updateUser: (u) => {} };

describe("auth.service",  () => {

  beforeEach(function () {
    sessionStorage.clear();
  });

  it('should store the JWT in localStorage on successful sign in', async function () {
    // Arrange.
    const res = { ok: true, data: { token: "123456789" } };
    api.post.mockResolvedValue(res);
    api.get.mockResolvedValue({ ok: true });

    // Act.
    await auth.signin(mockUserContext)(defaultUser);

    // Assert.
    const user = JSON.parse(sessionStorage.getItem('user'));
    expect(user).toBeTruthy();
    expect(user.token).toBe("123456789");
  });

  it('should remove the JWT in localStorage on successful sign out', async function () {
    // Arrange.
    const res = { ok: true, data: { token: "123456789" } };
    api.post.mockResolvedValue(res);
    api.get.mockResolvedValue({ ok: true });

    // Act.
    await auth.signin(mockUserContext)(defaultUser);
    auth.signout(mockUserContext)();

    // Assert.
    const user = JSON.parse(sessionStorage.getItem('user'));
    expect(user).toBeNull();
  });

  it('should return the token from storage when present', async function () {
    // Arrange.
    const res = { ok: true, data: { token: "123456789" } };
    api.post.mockResolvedValue(res);
    api.get.mockResolvedValue({ ok: true });
    await auth.signin(mockUserContext)(defaultUser);

    // Act.
    const user = auth.current();

    // Assert.
    expect(user).toBeTruthy();
    expect(user.token).toBe("123456789");
  });

  it('should return null when no token present', async function () {

    // Act.
    const user = auth.current();

    // Assert.
    expect(user).toBeNull();
  });

  it('should sign in on successful sign up', async function () {
    // Arrange.
    const resSignUp = { ok: true, data: { status: "Success" } };
    const resSignIn = { ok: true, data: { token: "123456789" } };
    api.post.mockReturnValueOnce(resSignUp).mockReturnValueOnce(resSignIn);

    // Act.
    const result = await auth.signup(mockUserContext)(defaultUser);

    // Assert.
    expect(result.ok).toBeTruthy();
    expect(auth.current().token).toBe("123456789");
  });

  it('should fail gracefully on failed sign up', async function () {
    // Arrange.
    const res = { ok: false, err: "Password too short" };
    api.post.mockReturnValue(res);

    // Act.
    const result = await auth.signup(mockUserContext)(defaultUser);

    // Assert.
    expect(result.ok).toBeFalsy();
    expect(result.err).toBe("Password too short");
  });

  it('should fail gracefully on failed sign in', async function () {
    // Arrange.
    const res = { ok: false };
    api.post.mockReturnValue(res);

    // Act.
    const result = await auth.signin(mockUserContext)(defaultUser);

    // Assert.
    expect(result.ok).toBeFalsy();
    expect(result.err).toBe("Error signing in.");
  });

})

