init();  // simulation initialization
animate();  // simulation animation loop

function init() {

    /* triangle
    x = [[0,0],[5,0],[2.5,2.5]];
    prev_x = [[0,-0.9],[5,-0.9],[2.5,1.6]];
    next_x = [[0,0],[5,0],[2.5,2.5]]; // just a copy of the structure not the values
    links = [];
    links[0] = {a:0,b:1,kp:1};
    links[1] = {a:1,b:2,kp:1};
    links[2] = {a:2,b:0,kp:1};
    */

    /* pentagon with no interior support
    x = [[0,0],[5,0],[6,3.5],[2.5,5],[-1,3.5]];
    prev_x = [[0,-0.9],[5,-0.9],[6,2.6],[2.5,4.1],[-1,2.6]];
    next_x = [[0,0],[5,0],[6,3.5],[2.5,5],[-1,3.5]]; // just a copy of the structure not the values

    links = [];
    links[0] = {a:0,b:1,kp:1};
    links[1] = {a:1,b:2,kp:1};
    links[2] = {a:2,b:3,kp:1};
    links[3] = {a:3,b:4,kp:1};
    links[4] = {a:4,b:0,kp:1};
    */

    /* pentagon with interor support and springy-ness
    */
    x = [[0,0],[5,0],[6,3.5],[2.5,5],[-1,3.5],[2.5,2.5]];
    prev_x = [[0,-0.9],[5,-0.9],[6,2.6],[2.5,4.1],[-1,2.6],[2.5,1.6]];
    next_x = [[0,0],[5,0],[6,3.5],[2.5,5],[-1,3.5],[-1,3.5]]; // just a copy of the structure not the values

    links = [];
    links[0] = {a:0,b:1,kp:0.01};
    links[1] = {a:1,b:2,kp:0.01};
    links[2] = {a:2,b:3,kp:0.01};
    links[3] = {a:3,b:4,kp:0.01};
    links[4] = {a:4,b:0,kp:0.01};
    links[5] = {a:0,b:5,kp:0.01};
    links[6] = {a:1,b:5,kp:0.01};
    links[7] = {a:2,b:5,kp:0.01};
    links[8] = {a:3,b:5,kp:0.01};
    links[9] = {a:4,b:5,kp:0.01};

    /* octogon (with JGR!)
    x = [[-1,3],[-2,2],[-2,1],[-1,0],[1,0],[2,1],[2,2],[1,3],[0,1.5]];
    prev_x = [[-1,3],[-2,2],[-2,1],[-1,0],[1,0],[2,1],[2,2],[1,3],[0,1.5]];
    next_x = [[-1,3],[-2,2],[-2,1],[-1,0],[1,0],[2,1],[2,2],[1,3],[0,1.5]]; // just a copy of the structure not the values

    links = [];
    links[0] = {a:0,b:1,kp:0.02};
    links[1] = {a:1,b:2,kp:0.02};
    links[2] = {a:2,b:3,kp:0.02};
    links[3] = {a:3,b:4,kp:0.02};
    links[4] = {a:4,b:5,kp:0.02};
    links[5] = {a:5,b:6,kp:0.02};
    links[6] = {a:6,b:7,kp:0.02};
    links[7] = {a:7,b:0,kp:0.02};
    links[8] = {a:0,b:8,kp:0.02};
    links[9] = {a:1,b:8,kp:0.02};
    links[10] = {a:2,b:8,kp:0.02};
    links[11] = {a:3,b:8,kp:0.02};
    links[12] = {a:4,b:8,kp:0.02};
    links[13] = {a:5,b:8,kp:0.02};
    links[14] = {a:6,b:8,kp:0.02};
    links[15] = {a:7,b:8,kp:0.02};
    */
 
    // rotate initial configuration by random angle
    angle = Math.random()*2*Math.PI;
    rotation = [[Math.cos(angle),-Math.sin(angle)],[Math.sin(angle),Math.cos(angle)]];
    x = matrix_transpose(matrix_multiply(rotation,matrix_transpose(x)));

    // set configuration at t=0-dt with offset from initial configurationat t=0
    for (i=0;i<x.length;i++) {
        prev_x[i][0] = x[i][0]-0.2*(Math.random()-0.5); // random x offset
        prev_x[i][1] = x[i][1]-0.9; // constant downward offset
    }

   // set rest length of link spring constraints
   for (var i=0;i<links.length;i++) {
        links[i].rest = compute_distance(x[links[i].a],x[links[i].b]);
    }
    
    // define gravitational force
    gravity = [0,-0.1];  // light gravity
    
    // only gravity acts on object in this example
    a = gravity;

    // initialize time and timestep
    t = 0;
    dt = 0.5;
}

function animate() {
    requestAnimationFrame(animate); // request next iteration of animation loop
    update(); // update physics
    draw(); // render display
}


function update() {

    // verlet integration of each point with unit mass and no friction
    for (var i=0;i<x.length;i++) {
        for (j=0;j<x[0].length;j++) {
            next_x[i][j] = 2*x[i][j]-prev_x[i][j]+a[j]*dt*dt;
            prev_x[i][j] = x[i][j];
            x[i][j] = next_x[i][j];
        }
    }
    
    // optimize configuration of points with respect to constraints
    var iterations = 100;  // more optimization iterations yields better solution
    for (var iter=0;iter<iterations;iter++) {

        // update for spring constraints linking points
        for (i=0;i<links.length;i++) {
            dx = x[links[i].a][0]-x[links[i].b][0];
            dy = x[links[i].a][1]-x[links[i].b][1];
            dl = Math.sqrt(dx*dx+dy*dy);
            diff = -links[i].kp*(dl-links[i].rest)/dl;  // tutorial had sign flipped?
            x[links[i].b][0] -= dx*0.5*diff;
            x[links[i].b][1] -= dy*0.5*diff;
            x[links[i].a][0] += dx*0.5*diff;
            x[links[i].a][1] += dy*0.5*diff;
        }

        // update for ground plane constraint
        for (i=0;i<x.length;i++) {
            x[i][1] = Math.max(x[i][1],-5);
        }
        
    }

}

function draw() {
    // grab the canvas for drawing
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    
    // clear canvas
    ctx.clearRect(0, 0, c.width, c.height);
    

    // draw ground plane
    ctx.fillStyle = "#BBBBBB";
    ctx.beginPath();
    ctx.moveTo(0,200-(-5)*10);
    ctx.lineTo(c.width,200-(-5)*10);
    ctx.lineTo(c.width,c.height);
    ctx.lineTo(0,c.height);
    ctx.closePath();
    ctx.fill();


    // render object 
    // assumes points defined counter clockwise
    // assumes last point is interior support

    ctx.fillStyle = "#FF0000";
    ctx.strokeStyle = "#000000";

    // draw ounter clockwise faces
    ctx.beginPath();
    ctx.moveTo(200+x[0][0]*10,200-x[0][1]*10);
    for (var i=1;i<x.length;i++)
        ctx.lineTo(200+x[i][0]*10,200-x[i][1]*10);
    ctx.closePath();
    ctx.fill();

    // draw last face
    ctx.beginPath();
    ctx.moveTo(200+x[x.length-2][0]*10,200-x[x.length-2][1]*10);
    ctx.lineTo(200+x[x.length-1][0]*10,200-x[x.length-1][1]*10);
    ctx.lineTo(200+x[0][0]*10,200-x[0][1]*10);
    ctx.closePath();
    ctx.fill();

    // draw link constraints
    ctx.beginPath();
    for (var i=0;i<links.length;i++) {
        ctx.moveTo(200+x[links[i].a][0]*10,200-x[links[i].a][1]*10);
        ctx.lineTo(200+x[links[i].b][0]*10,200-x[links[i].b][1]*10);
    }
    ctx.closePath();
    ctx.stroke();

 }

function compute_distance(v1,v2) {
    dist = 0;
    for (var i=0;i<v1.length;i++)
        dist += (v1[i]-v2[i])*(v1[i]-v2[i]);
    return Math.sqrt(dist);
}

function matrix_multiply(m1,m2) {
    // returns 2D array that is the result of m1*m2
    // inefficient matrix multiplication
    var mat = [];
    var i,j,k;

    // flag error if number of columns in m1 do not match number of rows in m2
    if (m1[0].length !== m2.length) {
        console.log("matrix multiplication error: dimensions do not match");
        return false;
    }

    for (i=0;i<m1.length;i++) { // for each row of m1
        mat[i] = [];
        for (j=0;j<m2[0].length;j++) { // for each column of m2
            mat[i][j] = 0;
            for (k=0;k<m1[0].length;k++) {
                mat[i][j] += m1[i][k]*m2[k][j];
            }
        }
    }
    return mat;
}

function matrix_transpose(m) {
    var i;
    mat = []; 
    for (i=0;i<m[0].length;i++) {
        mat[i] = [];
        for (j=0;j<m.length;j++) {
            mat[i][j] = Number(m[j][i]);  // ensure this element is a number and not an array
        }
    }
    return mat;
}


