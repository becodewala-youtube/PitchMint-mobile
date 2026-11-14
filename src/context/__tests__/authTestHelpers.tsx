import React, { useEffect } from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { AuthProvider, useAuth, AuthContextType } from '../AuthContext';
import { User } from '../../services/api/authApi';

export const mockUser: User = {
  _id: 'user-123',
  name: 'Test Founder',
  email: 'founder@pitchmint.app',
  isPremium: false,
  credits: 3,
  isEmailVerified: true,
  plan: 'free',
};

export const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

export const createAuthTestRenderer = () => {
  let contextValue: AuthContextType;

  const TestConsumer: React.FC = () => {
    const auth = useAuth();
    useEffect(() => {
      contextValue = auth;
    });
    contextValue = auth;
    return null;
  };

  const renderWithAuth = async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });
    // Wait for bootstrap effect to settle
    await act(async () => {
      await Promise.resolve();
    });
    return renderer!;
  };

  return {
    getContext: () => contextValue,
    renderWithAuth,
  };
};
