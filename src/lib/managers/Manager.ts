import { BehaviorSubject, filter, firstValueFrom, map } from 'rxjs'
import messageManagerFactory from './messageManager';
import dataManagerFactory from './dataManager'
import { ManagerMap } from './types'

// deprecated - ussing can-di-land

export type ManagerFactory = (manager: Manager, ...rest: any[]) => any;

class Manager {
  constructor() {
    console.log('creating manager');
    this.addManager('messages', messageManagerFactory);
    this.addManagerAsync('data', dataManagerFactory);
  }

  private static _create? : Manager

  public static create() {
    return Manager._create ?? (Manager._create = new Manager());
  }
  public managerMap: ManagerMap = new Map<string, any>();

  public addManager(name: string, managerFactory: ManagerFactory, ...rest) {
    console.log('adding layer', name);
    if (!name) {
      throw new Error('no name for addManager');
    }
    if (this.managerMap.has(name)) {
      throw new Error('already have a withManager for ' + name)
    }
    this.managerMap.set(name, managerFactory(this, ...rest));
    this.managerStream.next(this.managerMap);
  }

  public async addManagerAsync(name, managerFactory: ManagerFactory, ...rest) {
    const manager = await managerFactory(this, ...rest);
    this.addManager(name, manager);
  }

  public managerStream: BehaviorSubject<ManagerMap> = new BehaviorSubject(new Map());

  public async withManager(name: string): Promise<any> {
    if (this.managerMap.has(name)) {
      return this.managerMap.get(name);
    }
    return firstValueFrom<Manager, null>(
      this.managerStream.pipe(
        filter(
          (mMap) => mMap.has(name)
        ),
        map(mMap => mMap.get(name))
      )
    );
  }

  public async withManagers(names: string[]): Promise<ManagerMap> {
    if (names.every((name: string) => this.managerMap.has(name))) {
      return this.managerMap
    }
    return firstValueFrom<ManagerMap, null>(
      this.managerStream.pipe(
        filter(mMap => names.every((name: string) => {
          const has = mMap.has(name);
          if (!has) {
            console.log('waiting for manager', name);
          }
          return has;
        })),
      )
    );
  }
}

export default Manager;
