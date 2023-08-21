"use client"

import { BehaviorSubject, Subject } from 'rxjs'

const keyManager = {
  stream: null,
  seq: new Subject(),
  init() { // can be called more than once; will only execute once
    if (keyManager.stream) {
      return;
    }
    //@ts-ignore
    keyManager.stream = new BehaviorSubject(new Set());
    window.addEventListener('keydown', (e) => {
      const keys = new Set(keyManager.stream.value);
      keyManager.seq.next(e);
      keys.add(e.key);
      keyManager.stream.next(keys);
    });

    window.addEventListener('keyup', (e) => {
      const keys = new Set(keyManager.stream.value);
      keys.delete(e.key);
      keyManager.stream.next(keys);
    })
  }
}

export default keyManager;
