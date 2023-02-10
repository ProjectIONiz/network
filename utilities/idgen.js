import crypto from 'crypto';

export default function idgen() {
    // generate a 32 char long id
    return crypto.randomBytes(32).toString('hex');
}