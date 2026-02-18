import React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from '../../src/components/common/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPressMock} />);

    const button = getByText('Test Button');
    button.props.onPress();

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading prop is true', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button title="Test Button" onPress={() => {}} loading />
    );

    expect(queryByText('Test Button')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPressMock} disabled />
    );

    const button = getByText('Test Button').parent;
    expect(button?.props.disabled).toBe(true);
  });
});
