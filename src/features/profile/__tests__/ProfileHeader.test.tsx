import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert, TextInput, Pressable } from 'react-native';
import { ProfileHeader } from '../components/ProfileHeader';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockUpdateName = jest.fn();

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Aarav Sharma' },
    updateName: mockUpdateName,
  }),
}));

describe('ProfileHeader Component', () => {
  const baseProps = {
    initialLetter: 'A',
    displayName: 'Aarav Sharma',
    displayEmail: 'aarav@pitchmint.app',
    displayPlan: 'PRO',
    displayCredits: 8,
    totalIdeasCount: 14,
    isPremium: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('renders user details and does not show crown badge when isPremium is false', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<ProfileHeader {...baseProps} isPremium={false} />);
    });

    const root = renderer!.root;
    expect(root.findAllByProps({ testID: 'profile-crown-badge' })).toHaveLength(0);
    expect(root.findByProps({ testID: 'profile-edit-name-button' })).toBeDefined();
  });

  it('renders crown badge when isPremium is true', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<ProfileHeader {...baseProps} isPremium={true} />);
    });

    const root = renderer!.root;
    expect(root.findAllByProps({ testID: 'profile-crown-badge' }).length).toBeGreaterThan(0);
  });

  it('switches to inline editing mode when pencil icon is pressed', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<ProfileHeader {...baseProps} />);
    });

    const root = renderer!.root;
    const editBtn = root.findByProps({ testID: 'profile-edit-name-button' });

    act(() => {
      editBtn.props.onPress();
    });

    const input = root.findByProps({ testID: 'profile-name-input' });
    expect(input.props.value).toBe('Aarav Sharma');
    expect(root.findByProps({ testID: 'profile-cancel-name-button' })).toBeDefined();
    expect(root.findByProps({ testID: 'profile-save-name-button' })).toBeDefined();
  });

  it('cancels inline editing and restores original name', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<ProfileHeader {...baseProps} />);
    });

    const root = renderer!.root;
    act(() => {
      root.findByProps({ testID: 'profile-edit-name-button' }).props.onPress();
    });

    act(() => {
      root.findByProps({ testID: 'profile-name-input' }).props.onChangeText('Temporary Name');
    });

    act(() => {
      root.findByProps({ testID: 'profile-cancel-name-button' }).props.onPress();
    });

    // Should return to normal view
    expect(root.findAllByProps({ testID: 'profile-name-input' })).toHaveLength(0);
    expect(root.findByProps({ testID: 'profile-edit-name-button' })).toBeDefined();
  });

  it('validates empty or whitespace-only name and prevents save', async () => {
    const onUpdateName = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ProfileHeader {...baseProps} onUpdateName={onUpdateName} />
      );
    });

    const root = renderer!.root;
    act(() => {
      root.findByProps({ testID: 'profile-edit-name-button' }).props.onPress();
    });

    act(() => {
      root.findByProps({ testID: 'profile-name-input' }).props.onChangeText('   ');
    });

    await act(async () => {
      root.findByProps({ testID: 'profile-save-name-button' }).props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Invalid Name', 'Name cannot be empty.');
    expect(onUpdateName).not.toHaveBeenCalled();
    // Remains in edit mode
    expect(root.findAllByProps({ testID: 'profile-name-input' }).length).toBeGreaterThan(0);
  });

  it('exits editing mode without API call if trimmed name is unchanged', async () => {
    const onUpdateName = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ProfileHeader {...baseProps} onUpdateName={onUpdateName} />
      );
    });

    const root = renderer!.root;
    act(() => {
      root.findByProps({ testID: 'profile-edit-name-button' }).props.onPress();
    });

    act(() => {
      root.findByProps({ testID: 'profile-name-input' }).props.onChangeText('  Aarav Sharma  ');
    });

    await act(async () => {
      root.findByProps({ testID: 'profile-save-name-button' }).props.onPress();
    });

    expect(onUpdateName).not.toHaveBeenCalled();
    expect(root.findAllByProps({ testID: 'profile-name-input' })).toHaveLength(0);
  });

  it('saves updated name via onUpdateName prop and exits editing mode', async () => {
    const onUpdateName = jest.fn().mockResolvedValue({ name: 'Aarav Kumar' });
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ProfileHeader {...baseProps} onUpdateName={onUpdateName} />
      );
    });

    const root = renderer!.root;
    act(() => {
      root.findByProps({ testID: 'profile-edit-name-button' }).props.onPress();
    });

    act(() => {
      root.findByProps({ testID: 'profile-name-input' }).props.onChangeText('Aarav Kumar');
    });

    await act(async () => {
      root.findByProps({ testID: 'profile-save-name-button' }).props.onPress();
    });

    expect(onUpdateName).toHaveBeenCalledWith('Aarav Kumar');
    expect(root.findAllByProps({ testID: 'profile-name-input' })).toHaveLength(0);
  });

  it('displays error alert and keeps edit mode active if onUpdateName fails', async () => {
    const onUpdateName = jest.fn().mockRejectedValue(new Error('Network disconnected'));
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ProfileHeader {...baseProps} onUpdateName={onUpdateName} />
      );
    });

    const root = renderer!.root;
    act(() => {
      root.findByProps({ testID: 'profile-edit-name-button' }).props.onPress();
    });

    act(() => {
      root.findByProps({ testID: 'profile-name-input' }).props.onChangeText('Aarav Kumar');
    });

    await act(async () => {
      root.findByProps({ testID: 'profile-save-name-button' }).props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Update Failed', 'Network disconnected');
    // Still in edit mode so user doesn't lose changes
    expect(root.findAllByProps({ testID: 'profile-name-input' }).length).toBeGreaterThan(0);
  });
});
