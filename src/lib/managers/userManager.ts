import { Forest } from '@wonderlandlabs/forest'
import { typedLeaf } from '@wonderlandlabs/forest/lib/types'

type User = { email: string }
type umStore = typedLeaf<{ user: User | null }>

export const userManager = new Forest({
  $value: {
    user: null,
    supabaseClient: null,
    router: null
  },
  selectors: {

  },
  actions: {
    signOut(store: umStore) {
      const {supabaseClient, router} = store.value;
      if (supabaseClient && router) {
        store.do.set_user(null);
        supabaseClient.auth.signOut();
        router.push('/');
      }
    }
  }
});
