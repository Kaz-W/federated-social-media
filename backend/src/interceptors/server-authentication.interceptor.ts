import {
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';

import {ServerRepository} from "../index";
import {LocalKeyPairRepository} from "../index";
import {repository} from "@loopback/repository";
import {HttpErrors, RestBindings} from "@loopback/rest";

const crypto = require('crypto')

import axios from "axios";


export function getKeyId(req: any) {
  if (!(req.headers.hasOwnProperty("signature-input"))) throw new HttpErrors.NotAcceptable("Cannot certify: No 'signature-input' header provided.")
  const sig_input = req.headers["signature-input"].toString()
  // delimit on ";" to separate items in sig_input, second item is keyId hence [1]
  // then delimit on "=" to split the assignment into var name and value, return value.
  try {
    return sig_input.split(";")[1].split("=")[1]
  } catch (e) {
    throw new HttpErrors.BadRequest(`Cannot certify: Cannot parse signature input to get public key location\nsignature-input: ${sig_input}`)
  }
}

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: ServerAuthenticationInterceptor.BINDING_KEY}})
export class ServerAuthenticationInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${ServerAuthenticationInterceptor.name}`;

  constructor(@repository(ServerRepository) protected serverRepository: ServerRepository,
              @repository(LocalKeyPairRepository) protected localKeyPairRepository: LocalKeyPairRepository) {
  }

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  verify_signature(publicKey: string | undefined, message_signature: string, message: string) {
    if (!publicKey) return false;
    const verify = crypto.createVerify('SHA512')
    verify.update(Buffer.from(message, 'utf8'))
    // console.log("pub", publicKey, hashedMessage,verify_signatureedMessage)
    return verify.verify({
      key: publicKey,
      saltLength: 20,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING
    }, Buffer.from(message_signature, 'base64'))
  }

  // reconstructs certificate signature input from request header
  getSignatureInput(req: any) {
    const method = req.method.toString().toLowerCase()
    const target = req.originalUrl;
    if (!(req.headers.hasOwnProperty("current-date"))) throw new HttpErrors.BadRequest("Cannot certify: No 'current-date' header provided.")
    if (!(req.headers.hasOwnProperty("user-id"))) throw new HttpErrors.BadRequest("Cannot certify: No 'user-id' header provided.")
    const date = req.headers["current-date"]
    const user_id = req.headers["user-id"]
    return "*request-target: " + method + " " + target + "\ncurrent-date: " + date + "\nuser-id: " + user_id
  }

  getSignature(req: any) {
    if (!(req.headers.hasOwnProperty("signature"))) throw new HttpErrors.BadRequest("Cannot certify: No 'signature' header provided.")
    const signature = req.headers["signature"]
    if (!signature.split(":")[1]) throw new HttpErrors.BadRequest("Cannot certify: Cannot parse signature from 'signature' header.")
    return signature.split(":")[1]
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    const httpReq = await invocationCtx.get(RestBindings.Http.REQUEST);
    if (httpReq) {
      const signature_input = this.getSignatureInput(httpReq)
      const signature = this.getSignature(httpReq)

      // check if we have a public key stored for server making request
      const pub_key_location = getKeyId(httpReq);
      const requesting_domain = (/^(.*)(?=\/api\/key)/).exec(pub_key_location)?.[1];
      let server = await this.serverRepository.findOne({where: {url: requesting_domain}});
      if (server) {
        // attempt to use stored public key
        let key = server.publicKey
        if (this.verify_signature(key, signature, signature_input)) {
          //verified with current key!
          return next();
        } else {
          // get key and see if can verify with most up to date key.
          try {
            const res = await axios.get(pub_key_location);
            let key = res.data.key;
            await this.serverRepository.updateAll({publicKey: key}, {url: requesting_domain});
          } catch (e) {
            throw new HttpErrors.BadRequest(`Cannot certify: Could not fetch public key from: ${pub_key_location}`)
          }
          if (this.verify_signature(key, signature, signature_input)) {
            //now works, with most up to date key
            return next();
          } else {
            throw new HttpErrors.BadRequest(`Cannot certify: Failed to verify signature with signature input provided.\nSignature: ${signature}\nSignature-Input:\n${signature_input}`)
          }
        }
      } else {
        throw new HttpErrors.Forbidden(`Cannot certify: ${requesting_domain} not supported. Contact group B7 to have this server added to allowed servers.`)
      }
    }
  }
}
