import { BehaviorSubject, filter, map } from 'rxjs'
import { firstValueFrom } from 'rxjs/src/internal/firstValueFrom'

type ManagerMap = Map<string, any>;

const Manager = class {
  public managerMap: ManagerMap = new Map<string, any>();

  public addManager(name: string, manager) {
    if (!name) {
      throw new Error('no name for addManager');
    }
    if (this.managerMap.has(name)) {
      throw new Error('already have a manager for ' + name)
    }
    this.managerMap.set(name, manager);
    this.managerStream.next(this.managerMap);
  }

  private managerStream: BehaviorSubject<ManagerMap> = new BehaviorSubject(new Map());

  public async manager(name) {
    if (this.managerMap.has(name)) {
      return this.managerMap.get(name);
    }
    return firstValueFrom<ManagerMap, null>(
      this.managerStream.pipe(
      filter(mMap => mMap.has(name)),
        map(mMap => mMap.get(name))
      )
    );
  }
}

export default Manager;
