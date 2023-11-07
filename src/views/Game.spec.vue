import { mount } from '@vue/test-utils';
import Game from './Game.vue';

describe('Game', () => {
  it('renders correctly', () => {
    const wrapper = mount(Game);
    expect(wrapper.exists()).toBe(true);
  });
});