import {Client, expect} from '@loopback/testlab';
import {Cs3099LoopbackApplication, MyUserService} from '../..';
import {setupApplication} from '../helpers/test.helper';
import {givenPost, givenPostData, purgeTestingDatabase} from "../helpers/database.helper";

describe('Post Internal (acceptance)', () => {
  let app: Cs3099LoopbackApplication;
  let client: Client;
  let userService: MyUserService;

  const dummyUser = {
    username: 'dummyuser',
    password: 'password123'
  }

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    userService = await app.get('services.user.service');
  });

  beforeEach(purgeTestingDatabase);

  after(async () => {
    await app.stop();
  });

  it('gets all posts', async () => {
    // arrange.
    const post1 = await givenPost({});
    const post2 = await givenPost({});
    const expected = [
      Object.assign(post1, {id: post1.id, btime: post1.btime.toISOString()}),
      Object.assign(post2, {id: post2.id, btime: post2.btime.toISOString()}),
    ];

    // act.
    const response = await client.get(`/internal/posts`);

    // assert.
    expect(response.body).to.containDeep(expected);
  });

  it('should reject and unauthorized user from making a post', async () => {
    // arrange.
    const post = givenPostData();

    // act.
    await client
      .post('/internal/posts')
      .send(post)
      .expect(401); // assert.
  });

  it('should create new posts from authorised users', async () => {
    // arrange.
    const post = givenPostData({postTitle: "test-title"});
    const token = authUser();

    // act.
    const res = await client
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(post)
      .expect(200);

    expect(res.body.postTitle).to.be.equal("test-title");
  });

  async function authUser() {
    await userService.userRepository.create(dummyUser);
    const res = await client.post('/internal/users/signin').send(dummyUser);
    return res.body.token;
  }
});


