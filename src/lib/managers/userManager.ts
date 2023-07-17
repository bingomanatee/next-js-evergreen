import { Forest } from '@wonderlandlabs/forest'
import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { anonUserId } from '~/constants'

type User = { email: string }
type umStore = typedLeaf<{ user: User | null }>

export const userManager = new Forest({
  $value: {
    user: null,
  },
  selectors: {
    currentUserId(store: umStore) {
      return store.value.user?.id?? anonUserId
    }
  },
  actions: {
    signOut(store: umStore) {
      const router = store.getMeta('router');
      const supabaseClient = store.getMeta('supabaseClient');
      if (supabaseClient && router) {
        store.do.set_user(null);
        supabaseClient.auth.signOut();
        router.push('/');
      }
    }
  }
});
