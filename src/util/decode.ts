import crypto from 'crypto-js';


export const setEncode = (data: string, secretKey: string): string => {
    if (!data) return '';
    const byte = crypto.AES.encrypt(JSON.stringify(data), secretKey);
    const encode = byte.toString();
    return encode;
  };
  
  export const setDecode = (data: string, secretKey: string) : string=> {
    if (!data) return '';
    const byte = crypto.AES.decrypt(data, secretKey);
    const decode = byte.toString(crypto.enc.Utf8);
    return JSON.parse(decode);
  };