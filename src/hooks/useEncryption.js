import { useAuth } from '../context/AuthContext';
import * as encryption from '../services/encryption';

/**
 * Encryption hook — provides encrypt/decrypt using the current password.
 */
export function useEncryption() {
  const { getPassword, getSalt } = useAuth();

  const encrypt = async (plaintext) => {
    const password = getPassword();
    const salt = getSalt();
    if (!password || !salt) throw new Error('Not authenticated');
    return encryption.encrypt(plaintext, password, salt);
  };

  const decrypt = async (ciphertext) => {
    const password = getPassword();
    const salt = getSalt();
    if (!password || !salt) throw new Error('Not authenticated');
    return encryption.decrypt(ciphertext, password, salt);
  };

  return { encrypt, decrypt };
}
