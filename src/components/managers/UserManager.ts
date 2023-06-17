import { Forest } from '@wonderlandlabs/forest'
import { typedLeaf } from '@wonderlandlabs/forest/lib/types'

type User = { email: string }
type umStore = typedLeaf<{ user: User | null }>

export default function UserManager(user, supabaseClient, router) {
  return new Forest({
    $value: {
      user: user || null
    },
    selectors: {

    },
    actions: {
      signOut(store: umStore) {
        store.do.set_user(null);
        supabaseClient.auth.signOut();
        router.push('/');
      }
    }
  });
}
