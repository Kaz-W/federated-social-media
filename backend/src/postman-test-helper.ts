import {repository} from "@loopback/repository";
import {
  ForumRepository,
  LocalKeyPairRepository,
  ServerRepository,
  SubforumRepository,
  UserRepository
} from "./repositories";
import {lifeCycleObserver, LifeCycleObserver} from "@loopback/core";
import {genSalt, hash} from "bcryptjs";
import {RoleEnum} from "./models";

const spawn = require('cross-spawn');

const test_key = "-----BEGIN RSA PUBLIC KEY-----\n" +
  "MIICCgKCAgEA6Whs0TZ1jDrPKfhOWFPDPNnwW9C4bmmIGyQQfNPI+3PmDT2yvIcL\n" +
  "sVNFbd/1/d9Md5vwT4ylnGv1esEpv34WC/ktVWq38a4oI/hdq2Hmh2xPIg9IOVVE\n" +
  "bADqqvLC33TxHXFVV8lVMuD8ZsSMLG31hlxmsiyyLJEauVf4VfYUhleRfxgMDW7a\n" +
  "mwDUtbc5RGfUKiXnZFo7GssH9YMChvcjERnrRpx40c9PT6JLp/v4MPyPJWZRN4kg\n" +
  "yzjuE15WuwXz5/nSq//UOUOc5RHIhRgFFLw6KJOXm0M3Zte7e+/uVQI/fI17jQG9\n" +
  "TqwBH72zeE/FnCHwrSf5vOX4zxGsEqzHvgZ5dxFs0ewyczqGIi4+mK+G6d0RvirF\n" +
  "nn8ijiz7lViLiZvFib1Gj9V+DG7XqRv5XSMFJtjnh1g5QdFd8x8EWGYT/tWAqk04\n" +
  "NitYBj6lr/LIMYu2R19m7upOCKfw2l437alehsO5XuQot7p6qpSDt6JH/Ym7vXl5\n" +
  "xRNbN+t9YbwFBk1yLA1DYfCU0M4NKS5XFP/QXNVRPD1sDSWerwjPAB67aVmmG/t7\n" +
  "eEAD9ZJ/UCr8aeCwMkZdsN6BQhLSbF2NZSzpwXHiGtUVjAJ7rSIDZF58UX8KNeF4\n" +
  "aWOzXUVVjqDHM/BDnMrPt9jIqHZX+CsvbkS93fCUxDwOWI+yJ1lUXZ0CAwEAAQ==\n" +
  "-----END RSA PUBLIC KEY-----\n"

@lifeCycleObserver()
export class PostmanTestHelper implements LifeCycleObserver {

  constructor(@repository(LocalKeyPairRepository) protected localKeyPairRepository: LocalKeyPairRepository,
              @repository(ServerRepository) protected serverRepository: ServerRepository,
              @repository(ForumRepository) protected forumRepository: ForumRepository,
              @repository(SubforumRepository) protected subforumRepository: SubforumRepository,
              @repository(UserRepository) protected userRepository: UserRepository
  ) {
  }

  start() {
    require('dotenv').config();
    if (process.env.TESTING) {
      this.db_test_intitialiser().catch(console.error);
      console.log("Initialised test database");
      this.runPostman();
    }
  }

  async db_test_intitialiser() {
    let forum = await this.forumRepository.create({
      forumName: "test_forum",
    });

    let forum2 = await this.forumRepository.create({
      forumName: "test_forum2",
    });

    await this.serverRepository.create({
      url: "http://nonexistent",
      publicKey: test_key
    });

    await this.subforumRepository.create({
      subforumName: "test_subforum",
      forumId: forum.id
    });

    await this.subforumRepository.create({
      subforumName: "test_subforum2",
      forumId: forum2.id
    });

    const password = await hash('godminpassphrase', await genSalt());
    const savedUser = await this.userRepository.create(
      {username: 'godmin', serverRole: RoleEnum.admin}
    );
    await this.userRepository.userCredentials(savedUser.id).create({password});
  }

  runPostman() {
    const pm_env = './postman_tests/CS3099_Testing.postman_environment.json';
    const pm_collection = './postman_tests/CS3099.postman_collection.json';
    const pm = spawn('newman', ['run', pm_collection, '-e', pm_env]);

    pm.stdout.on('data', function (data: Buffer) {
      console.log(data.toString());
    });

    pm.stderr.on('data', function (data: Buffer) {
      console.error(data.toString());
    });

    pm.on('exit', function (code: number) {
      console.log('Postman exited with code ' + code);
      process.exit(code);
    });
  }
}
