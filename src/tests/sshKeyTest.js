import { SSHKeyService } from '../services/SSHKeyService.js';

async function testSSHKeyGeneration() {
  console.log('Starting SSH key generation test...');
  
  try {
    const sshKeyService = new SSHKeyService();
    
    // Generate key pair
    console.log('Generating SSH key pair...');
    const keyPair = sshKeyService.generateKeyPair();
    
    // Verify keys were generated
    if (!keyPair?.publicKey || !keyPair?.privateKey) {
      throw new Error('Key pair generation failed - missing keys');
    }

    // Verify public key format
    if (!keyPair.publicKey.startsWith('ssh-rsa ')) {
      throw new Error('Invalid public key format');
    }

    // Verify private key format
    if (!keyPair.privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid private key format');
    }

    console.log('\nKey pair generated successfully!');
    console.log('\nPublic key (first 44 chars):');
    console.log(keyPair.publicKey.substring(0, 44) + '...');
    console.log('\nPrivate key (first line):');
    console.log(keyPair.privateKey.split('\n')[0]);

    return keyPair;
  } catch (error) {
    console.error('SSH key generation test failed:', error.message);
    throw error;
  }
}

// Run the test
testSSHKeyGeneration();