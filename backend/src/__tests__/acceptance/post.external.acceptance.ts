import {Client, expect} from '@loopback/testlab';
import {Cs3099LoopbackApplication} from '../..';
import {givenPost, givenPostData, purgeTestingDatabase} from "../helpers/database.helper";
import {setupApplication} from "../helpers/test.helper";

describe('Post External (acceptance)', () => {
  let app: Cs3099LoopbackApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  beforeEach(purgeTestingDatabase);

  after(async () => {
    await app.stop();
  });

  it('retrieves a post', async () => {
    // arrange.
    const post = await givenPost({});
    const expected = Object.assign(post, {id: post.id, btime: post.btime.toISOString()});

    // act.
    const response = await client.get(`/posts/${post.id}`);

    // assert.
    expect(response.body).to.containEql(expected);
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
    const response = await client.get(`/posts`);

    // assert.
    expect(response.body).to.containDeep(expected);
  });

  it('should create new posts from authorised users', async () => {
    // arrange.
    const post = givenPostData({postTitle: "test-title"});

    // act.
    const res = await client
      .post('/posts')
      .send(post)
      .expect(200);

    expect(res.body.postTitle).to.be.equal("test-title");
  });


});
