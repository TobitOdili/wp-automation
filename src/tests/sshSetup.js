import { useSSHSetup } from '../hooks/useSSHSetup';

async function testSSHSetup() {
  const {
    generateKeys,
    updateCloudwaysKey
  } = useSSHSetup();

  try {
    // Generate SSH key pair
    console.log('Generating SSH key pair...');
    const keyPair = await generateKeys();
    console.log('Key pair generated successfully');
    
    // Update Cloudways with public key
    console.log('Updating Cloudways with public key...');
    const sshAccess = await updateCloudwaysKey();
    console.log('SSH access details:', sshAccess);
  } catch (error) {
    console.error('SSH setup failed:', error.message);
  }
}

// Run the test
testSSHSetup();