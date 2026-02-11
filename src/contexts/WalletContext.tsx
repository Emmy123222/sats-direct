import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, UserSession } from '@stacks/connect';
import { toast } from 'sonner';

interface WalletContextType {
  userSession: UserSession;
  isConnected: boolean;
  userData: any;
  btcAddress: string;
  stxAddress: string;
  address: string; // Alias for stxAddress
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userData, setUserData] = useState(null);
  const [btcAddress, setBtcAddress] = useState('');
  const [stxAddress, setStxAddress] = useState('');

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
        setIsConnected(true);
        setBtcAddress(userData.profile?.btcAddress?.p2wpkh?.mainnet || '');
        setStxAddress(userData.profile?.stxAddress?.mainnet || '');
        toast.success('Wallet connected successfully!');
      });
    } else if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setUserData(userData);
      setIsConnected(true);
      setBtcAddress(userData.profile?.btcAddress?.p2wpkh?.mainnet || '');
      setStxAddress(userData.profile?.stxAddress?.mainnet || '');
    }
  }, []);

  const connectWallet = async () => {
    try {
      const { connect } = await import('@stacks/connect');
      
      const result = await connect();
      console.log('Connection result:', result);
      
      // Extract addresses from the result
      if (result && result.addresses && Array.isArray(result.addresses)) {
        // Find Stacks address (starts with 'S')
        const stxAddr = result.addresses.find((addr: any) => 
          addr.address && addr.address.startsWith('S')
        );
        
        // Find Bitcoin address (payment purpose or doesn't start with 'S')
        const btcAddr = result.addresses.find((addr: any) => 
          addr.address && !addr.address.startsWith('S') && 
          (addr.purpose === 'payment' || !addr.purpose)
        );
        
        if (stxAddr) {
          setStxAddress(stxAddr.address);
        }
        
        if (btcAddr) {
          setBtcAddress(btcAddr.address);
        }
        
        setIsConnected(true);
        setUserData(result);
        toast.success('Wallet connected successfully!');
      } else if (userSession.isUserSignedIn()) {
        // Fallback to userSession if result doesn't have addresses
        const userData = userSession.loadUserData();
        setUserData(userData);
        setIsConnected(true);
        setBtcAddress(userData.profile?.btcAddress?.p2wpkh?.mainnet || '');
        setStxAddress(userData.profile?.stxAddress?.mainnet || '');
        toast.success('Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please install Leather or Xverse wallet.');
    }
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setIsConnected(false);
    setUserData(null);
    setBtcAddress('');
    setStxAddress('');
    toast.success('Wallet disconnected');
  };

  return (
    <WalletContext.Provider
      value={{
        userSession,
        isConnected,
        userData,
        btcAddress,
        stxAddress,
        address: stxAddress, // Alias for convenience
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};