import { Subject, SubjectLike, Unsubscribable } from 'rxjs'

class BlockManager {
  private _obsSub: Unsubscribable | null = null;
  public blockerName: string | null = null;
  public block(blockerName: string, blocker?: SubjectLike<any>, force = false) {
    if (!blocker) {
      blocker = new Subject();
    }
    if (this.blocker) {
      if (force) {
        this.blocker.complete();
      } else {
        throw new Error('modality is occupied');
      }
    }
    this.blocker = blocker;
    this.blockerName = blockerName;
    const subject = this;
    this._obsSub = blocker.subscribe({
      error(err) {
        console.warn('error in interruptManager:', err);
        subject.clear();
      },
      complete() {
        subject.clear();
      }
    })
    return blocker;
  };

  public get isBlocked() {
    return !!this.blocker;
  }

  private clear() {
    this._obsSub = null;
    this.blocker = null;
    this.blockerName = null;
  }

  private blocker: SubjectLike<any> | null = null;
}

export default function blockManager() {
  return new BlockManager()
}
