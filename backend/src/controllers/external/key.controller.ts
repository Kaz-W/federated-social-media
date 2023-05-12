import {get} from "@loopback/rest";
import {repository} from "@loopback/repository";
import {LocalKeyPairRepository} from "../../repositories";

export class KeyController {
  constructor(
    @repository(LocalKeyPairRepository)
    public localKeyPairRepository: LocalKeyPairRepository,
  ) {
  }

  @get('/key')
  async key(): Promise<any> {
    let keyPairs = await this.localKeyPairRepository.find()
    if (keyPairs.length !== 0) {
      return {"key": keyPairs[0]["PubKey"]}
    }
    return "Could not get key"
  }
}