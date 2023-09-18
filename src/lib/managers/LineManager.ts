"use client"

import {BehaviorSubject, combineLatest, debounceTime, map, Observer, switchMap} from "rxjs";
import dataManager from "~/lib/managers/dataManager";
import {Vector2} from "three";
import {DataStreamItem, Frame, isValidPoint, MapPoint, Plan} from "~/types";
import {frameToPoint} from "~/lib/utils/px";
import {stringToDir} from "~/components/pages/PlanEditor/util";
import {type} from "@wonderlandlabs/walrus";
import {TypeEnum} from "@wonderlandlabs/walrus/dist/enums";
import mapPoints from "~/lib/stateFragments/mapPoints";

export type LineDefinition = {
  from: Vector2,
  to: Vector2
}

function isValidLineDef(line: any): line is LineDefinition {
  return (type.describe(line, true) === TypeEnum.object
      && isValidPoint(line.from) && isValidPoint(line.to))
}

const mapPointRE = /^map-point:(.+)/

function directionToPoint(
    spriteDirString: string,
    frame: Frame,
    pointMap: Map<string, MapPoint>) {
  if (mapPointRE.test(spriteDirString)) {
    const [_, pointId] = mapPointRE.exec(spriteDirString);
    console.log('map point id:', pointId);
    if (!pointMap.has(pointId)) {
      console.error('cannot find map point ', pointId, 'in', pointMap);
      return null;
    }
    const point: MapPoint = pointMap.get(pointId);
    return new Vector2(frame.left, frame.top).add(new Vector2(point.x, point.y));
  }

  const spriteDir = stringToDir(spriteDirString);
  return frame ? frameToPoint(frame, spriteDir) : null
}

export class LineManager {

  constructor() {
    this.subject = new BehaviorSubject<LineDefinition[]>([])
    this.init();
  }

  private async init() {
    const mapPointSubject = await dataManager.do(async (db) => {
      return dataManager.planStream.pipe(
          map((value) => value.planId),
          switchMap((planId) => {
            return db.map_points.find()
                .where('plan_id')
                .eq(planId)
                .$.pipe(map((points: MapPoint[]) => {
                  const map = new Map();
                  points.forEach((point) => {
                    map.set(point.id, point);
                  });
                  return map;
                }));
          })
      )

    })

    combineLatest(
        [dataManager.planStream, mapPointSubject]
    ).pipe(
        debounceTime(100),
        map(this.dataToLines)
    ).subscribe(this.subject);
  }

  dataToLines([planInfo, mapPoints]: [DataStreamItem, Map<string, MapPoint>]): LineDefinition[] {

    const {links, framesMap} = planInfo;

    return links.map((link) => {
      const startFrame = framesMap.get(link.start_frame);
      const endFrame = framesMap.get(link.end_frame);
      if (!(startFrame && endFrame)) {
        return null;
      }
      const fromPoint = directionToPoint(link.start_at, startFrame, mapPoints);
      const toPoint = directionToPoint(link.end_at, endFrame, mapPoints);
      return {from: fromPoint, to: toPoint}

    }).filter((lineDef) => {
      return isValidLineDef(lineDef)
    });

  }

  public subject
  private static _instance: LineManager;

  static get instance() {
    if (!LineManager._instance) {
      LineManager._instance = new LineManager();
    }
    return LineManager._instance;
  }
}
