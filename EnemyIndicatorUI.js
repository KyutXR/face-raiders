class EnemyIndicatorUI {

    constructor(container){
        this.container = container;
        this.arrows = [];
    }

    update(enemyList,camera){

        //Babylon.js版
        /* const width = window.innerWidth;
        const height = window.innerHeight;

        while (this.arrows.length < enemyList.length) {

            const arrow = document.createElement("div");
            arrow.className = "enemyArrow";
            arrow.innerHTML = "▲";

            this.container.appendChild(arrow);

            this.arrows.push(arrow);
        }

        while (this.arrows.length > enemyList.length) {

            this.arrows.pop().remove();

        }

        enemyList.forEach((enemy, i) => {

            const arrow = this.arrows[i];

            //--------------------------------
            // スクリーン座標へ変換
            //--------------------------------

            const pos = BABYLON.Vector3.Project(

                enemy.position,

                BABYLON.Matrix.Identity(),

                scene.getTransformMatrix(),

                camera.viewport.toGlobal(width,height)

            );

            //--------------------------------
            // 画面内判定
            //--------------------------------

            const inside =

                pos.x >= 0 &&
                pos.x <= width &&
                pos.y >= 0 &&
                pos.y <= height;

            if (inside) {

                arrow.style.display = "none";
                return;

            }

            arrow.style.display = "block";

            //--------------------------------
            // 画面端へ
            //--------------------------------

            let x = pos.x;
            let y = pos.y;

            const cx = width / 2;
            const cy = height / 2;

            let dx = x - cx;
            let dy = y - cy;

            const max = Math.max(
                Math.abs(dx / (width * 0.45)),
                Math.abs(dy / (height * 0.45))
            );

            dx /= max;
            dy /= max;

            arrow.style.left = (cx + dx) + "px";
            arrow.style.top = (cy + dy) + "px";

            const angle = Math.atan2(dy, dx);

            arrow.style.transform =
                `translate(-50%,-50%) rotate(${angle + Math.PI/2}rad)`;

        });*/

    //Three.js版
    /*const width = window.innerWidth;
    const height = window.innerHeight;

    while (this.arrows.length < enemyList.length) {

        const arrow = document.createElement("div");
        arrow.className = "enemyArrow";
        arrow.innerHTML = "▲";

        this.container.appendChild(arrow);
        this.arrows.push(arrow);
    }

    while (this.arrows.length > enemyList.length) {

        this.arrows.pop().remove();

    }

    enemyList.forEach((enemy, i) => {

        const arrow = this.arrows[i];

        //----------------------------------
        // ワールド座標→スクリーン座標
        //----------------------------------

        const pos = enemy.position.clone();

        pos.project(camera);

        //----------------------------------
        // 画面内判定
        //----------------------------------

        const visible =
            pos.z > 0 &&
            pos.z < 1 &&
            Math.abs(pos.x) <= 1 &&
            Math.abs(pos.y) <= 1;

        if (visible) {

            arrow.style.display = "none";
            return;

        }

        arrow.style.display = "block";

        //----------------------------------
        // 画面端へ丸める
        //----------------------------------

        let x = pos.x;
        let y = pos.y;

        const max = Math.max(Math.abs(x), Math.abs(y));

        x /= max;
        y /= max;

        const screenX = (x * 0.45 + 0.5) * width;
        const screenY = (-y * 0.45 + 0.5) * height;

        arrow.style.left = screenX + "px";
        arrow.style.top = screenY + "px";

        //----------------------------------
        // 回転
        //----------------------------------

        const angle = Math.atan2(y, x);

        arrow.style.transform =
            `translate(-50%,-50%) rotate(${angle + Math.PI/2}rad)`;

    });*/

    }

}