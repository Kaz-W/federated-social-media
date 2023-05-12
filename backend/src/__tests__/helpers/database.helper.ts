/* eslint-disable prefer-const */
import {
  CommentRepository, ForumRepository,
  PostRepository, RefreshTokenRepository, RoleRepository,
  ServerRepository, SubforumRepository,
  UserCredentialsRepository,
  UserRepository
} from "../../repositories";
import {Post} from "../../models";
import {testdb} from '../fixtures/datasources/testdb.datasource';

export function givenPost(data?: Partial<Post>) {

  let commentRepo: CommentRepository;
  let postRepo: PostRepository;
  let userRepo: UserRepository;
  let subforumRepo: SubforumRepository;

  postRepo = new PostRepository(
    testdb,
    async () => commentRepo,
    async () => userRepo,
    async () => subforumRepo
  );

  commentRepo = new CommentRepository(
    testdb,
    async () => postRepo
  );

  return new PostRepository(testdb, async () => commentRepo, async () => userRepo, async () => subforumRepo).create(givenPostData(data));
}

export function givenPostData(data?: Partial<Post>) {
  return Object.assign(
    {
      postTitle: 'title',
      postContents: 'content',
      userId: 'a-user-id',
      serverId: 'a-server-id'
    },
    data
  )
}

export async function purgeTestingDatabase() {
  let postRepo: PostRepository;
  let commentRepo: CommentRepository;
  let userRepo: UserRepository;
  let serverRepo: ServerRepository;
  let userCredRepo: UserCredentialsRepository;
  let refreshTokenRepo: RefreshTokenRepository;
  let subforumRepo: SubforumRepository;
  let forumRepo: ForumRepository;
  let roleRepo: RoleRepository;
  postRepo = new PostRepository(
    testdb,
    async () => commentRepo,
    async () => userRepo,
    async () => subforumRepo
  );

  commentRepo = new CommentRepository(
    testdb,
    async () => postRepo
  );

  userRepo = new UserRepository(
    testdb,
    async () => userCredRepo,
    async () => postRepo,
    async () => commentRepo,
    async () => roleRepo,
    async () => forumRepo
  );


  subforumRepo = new SubforumRepository(
    testdb,
    async () => postRepo,
    async () => forumRepo
  )


  serverRepo = new ServerRepository(
    testdb
  );

  userCredRepo = new UserCredentialsRepository(
    testdb
  );

  refreshTokenRepo = new RefreshTokenRepository(
    testdb
  );

  forumRepo = new ForumRepository(
    testdb,
    async () => subforumRepo,
    async () => roleRepo
  )

  roleRepo = new RoleRepository(
    testdb,
    async () => forumRepo,
    async () => userRepo
  )

  await postRepo.deleteAll();
  await commentRepo.deleteAll();
  await userRepo.deleteAll();
  await serverRepo.deleteAll();
  await userCredRepo.deleteAll();
  await refreshTokenRepo.deleteAll();
  await forumRepo.deleteAll();
  await subforumRepo.deleteAll();
  await roleRepo.deleteAll();

}
