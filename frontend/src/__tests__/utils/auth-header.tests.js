import {auth} from "../../services/auth.service";
import {authHeader} from "../../utils/authHeader";

jest.mock('../../services/auth.service');

const defaultUser = {
  token: "123456789"
}

describe('auth-header', function () {

  beforeEach(function () {
    localStorage.clear();
  });

  it('should generate the header when a user is signed in', async function () {
    // Arrange.
    auth.current.mockReturnValue(defaultUser);

    // Act.
    const header = authHeader();

    // Assert.
    expect(header).toBeTruthy();
    expect(header.Authorization).toBe('Bearer 123456789');
  });

  it('should not generate the header when no user is signed in', async function () {
    // Arrange.
    auth.current.mockReturnValue(null);

    // Act.
    const header = authHeader();

    // Assert.
    expect(header).toEqual({});
  });
})
