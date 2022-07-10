class SimpleBox {
    #parent = null;
    #wrapper = null; #container = null; #surfaces = [];

    #position = { x: 0, y: 0, z: 0, }; #strP = "";
    #rotation = { x: 0, y: 0, z: 0, };

    #gravity = null;

    constructor(parent, ...size) {
        this.#parent = parent;
        if(size.length > 0) this.draw(...size);
    }

    // ==================================================

    get parent() { return this.#parent; }
    get container() { return this.#container; }
    get wrapper() { return this.#wrapper; }

    // ==================================================

    draw(sizeX, sizeY, sizeZ) {
        let wrapper = document.createElement("div");
        this.#wrapper = wrapper;

        wrapper.classList.add("cube-wrapper");

        wrapper.style.position = "absolute";
        wrapper.style.transformStyle = "preserve-3d";

        let container = document.createElement("div");
        this.#container = container;

        container.classList.add("cube-container");
        
        container.style.width = sizeX + "px";
        container.style.height = sizeY + "px";
        
        container.style.position = "absolute";
        container.style.transformStyle = "preserve-3d";
        container.style.transformOrigin = "center center " + -sizeZ / 2 + "px";

        (this.#wrapper).appendChild(container);
        (this.#parent).appendChild(wrapper);

        for(let i = 0; i < 6; ++i) {
            let surface = document.createElement("div");

            surface.className = "cube-surface " + i; // 0: 정면, 1: 좌측, 2: 상단, 3: 후면, 4: 우측, 5: 하단
            
            surface.style.position = "absolute";
            surface.style.transformStyle = "preserve-3d";
            // surface.style.perspective = sizeZ + "px";

            (this.#surfaces).push(surface);
            (this.#container).appendChild(surface);
        }

        (this.#surfaces).forEach((x, i) => {
            switch(i) {
                case 0: case 3: {
                    x.style.width = sizeX + "px";
                    x.style.height = sizeY + "px";

                    x.style.transformOrigin = "center center " + -sizeZ / 2 + "px";

                    if(i === 0) x.style.transform = "rotateY(0)";
                    else x.style.transform = "rotateY(180deg)";
                } break;

                case 1: case 4: {
                    x.style.width = sizeZ + "px";
                    x.style.height = sizeY + "px";

                    x.style.left = "calc(50% - " + sizeZ / 2 + "px)";
                    x.style.transformOrigin = "center center " + -sizeX / 2 + "px";
                    x.style.transform = "translateZ(" + (sizeX - sizeZ) / 2 + "px)";

                    if(i === 1) x.style.transform += " rotateY(270deg)";
                    else x.style.transform += " rotateY(90deg)";
                } break;

                case 2: case 5: {
                    x.style.width = sizeX + "px";
                    x.style.height = sizeZ + "px";

                    x.style.left = "calc(50% - " + sizeX / 2 + "px)";
                    x.style.top = "calc(50% - " + sizeZ / 2 + "px)";
                    x.style.transformOrigin = "center center " + -sizeY / 2 + "px";
                    x.style.transform = "translateZ(" + (sizeY - sizeZ) / 2 + "px)";

                    if(i === 2) x.style.transform += "rotateX(90deg)";
                    else x.style.transform += " rotateX(270deg)";
                } break;
            }
        });
    }

    erase() {
        (this.#container).remove();
    }

    paint(...colors) {
        if(!this.#container) throw new Error("no cube here!");

        if(colors.length === 3) colors = colors.concat(colors);
        else if(colors.length === 1) colors = new Array(6).fill(colors[0]);

        (this.#surfaces).forEach((x, i) => {
            x.style.backgroundColor = colors[i];
        });
    }

    #update() {
        let strP = `${(this.#position).x}px, ${(this.#position).y}px, ${(this.#position).z}px`;
        (this.#container).style.transform = `translate3d(${strP}) rotateX(${(this.#rotation).x}deg) rotateY(${(this.#rotation).y}deg) rotateZ(${(this.#rotation).z}deg)`;
    }

    move(x, y, z) {
        if(!this.#container) throw new Error("no cube here!");

        if(x !== null) (this.#position).x = x;
        if(y !== null) (this.#position).y = y;
        if(z !== null) (this.#position).z = z;
        this.#update();
    }

    rotate(x, y, z) {
        if(!this.#container) throw new Error("no cube here!");

        if(x !== null) (this.#rotation).x = x;
        if(y !== null) (this.#rotation).y = y;
        if(z !== null) (this.#rotation).z = z;
        this.#update();
    }

    pushPos(x, y, z) {
        if(!this.#container) throw new Error("no cube here!");

        if(x !== null) (this.#position).x += x;
        if(y !== null) (this.#position).y += y;
        if(z !== null) (this.#position).z += z;
        this.#update();
    }

    pushRot(x, y, z) {
        if(!this.#container) throw new Error("no cube here!");

        if(x !== null) (this.#rotation).x += x;
        if(y !== null) (this.#rotation).y += y;
        if(z !== null) (this.#rotation).z += z;
        this.#update();
    }

    origin(x, y, z) {
        (this.#container).style.transformOrigin = y + " " + x + " " + z;
    }

    gravity(isOn) {
        let a = 9.8 / 15; let v = 0;

        if(isOn) {
            let that = this;

            let i = 0;
            this.#gravity = setInterval(function() {
                that.#wrapper.style.top = (v = a * i++) * i + "px";

                if(window.innerHeight < (that.#container).getBoundingClientRect().top - 10) {
                    that.erase();
                    clearInterval(that.#gravity);
                }
            }, 10);
        }
    }
}

class SimpleWave {
    #parent = null;
    #canvas = null;

    #width = 0; #height = 0; #num = 0;
    #h = 0;

    constructor(parent) {
        (this.#parent) = parent;
    }

    // ==================================================

    get parent() { return this.#parent; }
    get canvas() { return this.#canvas; }

    // ==================================================

    draw(width, height, num, speed, timing) {
        this.#width = width; this.#height = height;
        this.#num = num;

        let canvas = document.createElement("canvas");
        this.#canvas = canvas;

        canvas.className = "wave";
        canvas.width = width; canvas.height = height;

        let ctx = canvas.getContext("2d");
        let h = 0; let status = speed;

        setInterval(() => {
            if(h + 5 >= height && status > 0 || h - 5 <= -height && status < 0) {
                status = -status;
            }

            h += status * (1 - Math.abs(h / height));

            this.#update(ctx);
            this.#h = h;
        }, timing);

        (this.#parent).appendChild(canvas);
    }

    #update(ctx) {
        ctx.clearRect(0, 0, (this.#canvas).width, (this.#canvas).height);

        ctx.beginPath();
        ctx.moveTo(0, this.#height / 2);

        let num = 100;
        for(let i = 1; i <= num; ++i) {
            ctx.lineTo(this.#width / num * i, this.graph(this.#width / num * i) );
        }

        ctx.strokeStyle = "#539dce";
        ctx.stroke();
    }

    graph(x) {
        return (this.#h / 2) * Math.sin(((Math.PI * 2) / (this.#width / this.#num)) * x) + (this.#height / 2);
    }
}