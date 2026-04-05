/**
 * Unit tests for InMemoryDifyConversationStore
 */

import { InMemoryDifyConversationStore } from '../../../../src/discord-bot/chat/in-memory-dify-conversation-store';

describe('InMemoryDifyConversationStore', () => {
  it('stores and retrieves by channel and user', () => {
    const store = new InMemoryDifyConversationStore();
    expect(store.get('c', 'u')).toBeUndefined();

    store.set('c', 'u', 'conv-1');
    expect(store.get('c', 'u')).toBe('conv-1');
  });
});
