import * as THREE from "three";

export interface EnemyTrackerTarget {
    id: string;
    type: string;
    getPosition: () => THREE.Vector3 | null;
}

class EnemyRegistry {
    private targets = new Map<string, EnemyTrackerTarget>();

    register(target: EnemyTrackerTarget) {
        this.targets.set(target.id, target);
    }

    unregister(id: string) {
        this.targets.delete(id);
    }

    getAll(): EnemyTrackerTarget[] {
        return Array.from(this.targets.values());
    }

    clear() {
        this.targets.clear();
    }
}

export const enemyRegistry = new EnemyRegistry();
