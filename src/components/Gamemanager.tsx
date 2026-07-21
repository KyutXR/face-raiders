import type { EnemyInfo } from "./objects/enemy";


export interface JsonInfo{
    waves:number;
    LimitTime:number;
    enemies:EnemyInfo[][];
}

