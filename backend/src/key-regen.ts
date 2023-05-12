import {repository} from "@loopback/repository";

const {generateKeyPair} = require('crypto');
import {LocalKeyPairRepository, ServerRepository} from "./repositories";
import {CronJob, cronJob} from '@loopback/cron';
import getDomain from "./domain";
import {lifeCycleObserver, LifeCycleObserver} from "@loopback/core";

@cronJob()
export class KeyRegen extends CronJob {

  constructor(@repository(LocalKeyPairRepository) protected localKeyPairRepository: LocalKeyPairRepository,
              @repository(ServerRepository) protected serverRepository: ServerRepository) {
    super({
      name: 'generate-new-key-pair',
      onTick: () => {
        generateNewRSA(this.localKeyPairRepository, this.serverRepository).catch(console.error);
      },
      cronTime: '0 0 * * *', // run every day at 00:00
      start: true,
    });
  }
}

@lifeCycleObserver()
export class KeyGen implements LifeCycleObserver {
  constructor(@repository(LocalKeyPairRepository) protected localKeyPairRepository: LocalKeyPairRepository,
              @repository(ServerRepository) protected serverRepository: ServerRepository) {
  }

  start() {
    generateNewRSA(this.localKeyPairRepository, this.serverRepository).catch(console.error);
  }
}

// generates a new RSA public/private key pair
async function generateNewRSA(keyRepo: LocalKeyPairRepository, serverRepo: ServerRepository) {
  generateKeyPair('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    }
  }, async (err: Error | null, publicKey: string, privateKey: string) => {
    if (!err) {
      // inserts a new pair of keys and deletes old pair
      const keyPair = await keyRepo.findOne();
      if (keyPair) {
        await keyRepo.deleteAll();
      }
      await keyRepo.create({
        PubKey: publicKey,
        PrivKey: privateKey
      });
      await refreshServerEntry(publicKey, serverRepo);
      console.log("Refreshed keys")
    }
  });
}

async function refreshServerEntry(publicKey: string, serverRepo: ServerRepository) {
  const local = getDomain();
  let server = await serverRepo.findOne({where: {url: local}})
  if (server) {
    await serverRepo.updateById(server.id, {publicKey: publicKey})
  } else {
    await serverRepo.create({
      url: local,
      publicKey: publicKey
    });
  }
}
