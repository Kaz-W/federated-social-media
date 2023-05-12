// Create the request header needed for authorization.
import axios from "axios";
import {ServerRepository} from "../repositories";

const path = require('path')
let crypto = require('crypto');
const fs = require('fs')

const ALGORITHM = "RSASSA-PSS-SHA512"

function verify_signature(publicKey: string, message_signature: string, message: string) {
  if (!publicKey) return false;
  const verify = crypto.createVerify('SHA512')
  verify.update(Buffer.from(message, 'utf8'))
  return verify.verify({
    key: publicKey,
    saltLength: 20,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING
  }, Buffer.from(message_signature, 'base64'))
}

export function generateCertificateHeader(origin: string, method: string, target: string, user: string, privateKey: string) {
  const date = new Date().toISOString();
  let sig_input = "*request-target: " + method.toLowerCase() + " " + target
    + "\ncurrent-date: " + date
    + "\nuser-id: " + user
  const sign = crypto.createSign('SHA512')
  sign.update(Buffer.from(sig_input, 'utf8'))
  // sign with private key
  const signature = sign.sign({
    key: privateKey,
    saltLength: 20,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING
  }).toString('base64')
  return {date, signature}
}
