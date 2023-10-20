import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import Game from '../Game.vue'

// check if Game mounting successful (exists)
describe('Game component loads', () => {
  it('renders properly', () => {
    const wrapper = mount(Game)
    expect(wrapper.text()).toContain('Start Practice Session')
  })
})
