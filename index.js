let scene, camera, renderer, snake, food;
let snakeBody = [];
let direction = new THREE.Vector3(1, 0, 0);
let newDirection = new THREE.Vector3(1, 0, 0);
const gridSize = 20;
const cubeSize = 1;
let score = 0;
let gameSpeed = 200; // ms
let lastMoveTime = 0;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 25, 8);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createPlayfield();
    createSnake();
    createFood();
    addLights();

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onWindowResize);

    animate();
}

function gameOver() {
    alert(`Game Over! Your score: ${score}`);
    resetGame();
}

function resetGame() {
    while (snakeBody.length > 1) {
        const removed = snakeBody.pop();
        scene.remove(removed);
    }
    snakeBody[0].position.set(0, 0.5, 0);
    direction.set(1, 0, 0);
    placeFood();
    score = 0;
    updateScore();
    gameSpeed = 200;
}

function updateScore() {
    score++;
    document.getElementById('score').textContent = `Score: ${score}`;
}

function createPlayfield() {
    const planeGeometry = new THREE.PlaneGeometry(gridSize * cubeSize, gridSize * cubeSize);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x00FF00 }); // Green playfield
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // Add borders
    const borderMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Brown borders
    const borderGeometry = new THREE.BoxGeometry(gridSize * cubeSize, cubeSize, cubeSize);
    const borders = [
        new THREE.Mesh(borderGeometry, borderMaterial),
        new THREE.Mesh(borderGeometry, borderMaterial),
        new THREE.Mesh(borderGeometry, borderMaterial),
        new THREE.Mesh(borderGeometry, borderMaterial)
    ];

    borders[0].position.set(0, 0.5, gridSize * cubeSize / 2);
    borders[1].position.set(0, 0.5, -gridSize * cubeSize / 2);
    borders[2].position.set(gridSize * cubeSize / 2, 0.5, 0);
    borders[3].position.set(-gridSize * cubeSize / 2, 0.5, 0);
    borders[2].rotation.y = Math.PI / 2;
    borders[3].rotation.y = Math.PI / 2;

    borders.forEach(border => scene.add(border));
}

function createSnake() {
    const headGeometry = new THREE.SphereGeometry(cubeSize / 2, 20, 20);
    const bodyGeometry = new THREE.SphereGeometry(cubeSize / 2 * 0.8, 20, 20);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

    const head = new THREE.Mesh(headGeometry, material);
    head.position.set(0, 0.5, 0);
    scene.add(head);
    snakeBody.push(head);

    // Add initial body segments
    for (let i = 1; i < 3; i++) {
        const segment = new THREE.Mesh(bodyGeometry, material);
        segment.position.set(-i * cubeSize, 0.5, 0);
        scene.add(segment);
        snakeBody.push(segment);
    }
}

function addLights() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function checkCollision() {
    const head = snakeBody[0];
    if (
        Math.abs(head.position.x) > (gridSize / 2 - 1) * cubeSize ||
        Math.abs(head.position.z) > (gridSize / 2 - 1) * cubeSize
    ) {
        gameOver();
    }

    for (let i = 1; i < snakeBody.length; i++) {
        if (head.position.distanceTo(snakeBody[i].position) < cubeSize / 2) {
            gameOver();
            break;
        }
    }
}

function addLights() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
}

function createFood() {
    const geometry = new THREE.SphereGeometry(cubeSize / 3, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.5 });
    food = new THREE.Mesh(geometry, material);
    placeFood();
    scene.add(food);
}

function placeFood() {
    food.position.set(
        Math.floor(Math.random() * (gridSize - 2) - (gridSize - 2) / 2) * cubeSize,
        0.5,
        Math.floor(Math.random() * (gridSize - 2) - (gridSize - 2) / 2) * cubeSize
    );
    animateFood();
}

function animateFood() {
    gsap.to(food.position, {
        y: 1,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
    });
    gsap.to(food.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
    });
}

function onKeyDown(event) {
    switch (event.key) {
        case 'ArrowLeft':
            if (direction.x === 0) newDirection.set(-1, 0, 0);
            break;
        case 'ArrowRight':
            if (direction.x === 0) newDirection.set(1, 0, 0);
            break;
        case 'ArrowUp':
            if (direction.z === 0) newDirection.set(0, 0, -1);
            break;
        case 'ArrowDown':
            if (direction.z === 0) newDirection.set(0, 0, 1);
            break;
    }
}

function moveSnake() {
    direction.copy(newDirection);
    const head = snakeBody[0];
    const newHead = head.clone();
    newHead.position.add(direction.clone().multiplyScalar(cubeSize));

    if (newHead.position.distanceTo(food.position) < cubeSize) {
        snakeBody.unshift(newHead);
        scene.add(newHead);
        placeFood();
        updateScore();
        gameSpeed = Math.max(50, gameSpeed - 5);
        growSnake();
    } else {
        const tail = snakeBody.pop();
        scene.remove(tail);
        newHead.position.y = 0.5;
        snakeBody.unshift(newHead);
        scene.add(newHead);
    }

    animateSnakeMovement();
    checkCollision();
}

function growSnake() {
    const tailGeometry = new THREE.SphereGeometry(cubeSize / 2 * 0.8, 20, 20);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const newTail = new THREE.Mesh(tailGeometry, tailMaterial);
    const lastSegment = snakeBody[snakeBody.length - 1];
    newTail.position.copy(lastSegment.position);
    scene.add(newTail);
    snakeBody.push(newTail);
}

function animateSnakeMovement() {
    snakeBody.forEach((segment, index) => {
    if (index === 0) {
        gsap.to(segment.position, {
            x: snakeBody[0].position.x,
            z: snakeBody[0].position.z,
            duration: gameSpeed / 1000,
            ease: "power2.out"
        });
    } else {
        gsap.to(segment.position, {
            x: snakeBody[index - 1].position.x,
            z: snakeBody[index - 1].position.z,
            duration: gameSpeed / 1000,
            ease: "power2.out"
        });
    }

    // Pulsating effect
    gsap.to(segment.scale, {
        x: 1 + Math.sin(Date.now() * 0.01 + index * 0.5) * 0.1,
        y: 1 + Math.sin(Date.now() * 0.01 + index * 0.5) * 0.1,
        z: 1 + Math.sin(Date.now() * 0.01 + index * 0.5) * 0.1,
        duration: 0.5,
        repeat: -1,
        yoyo: true
    });
    });

    // Rotate the head to face the direction of movement
    const head = snakeBody[0];
    head.rotation.y = Math.atan2(-direction.x, -direction.z);
}

function animate(time) {
    requestAnimationFrame(animate);

    if (time - lastMoveTime > gameSpeed) {
        moveSnake();
        lastMoveTime = time;
    }

    // Smooth camera follow
    gsap.to(camera.position, {
        x: snakeBody[0].position.x * 0.1,
        z: snakeBody[0].position.z * 0.1 + 20,
        duration: 0.2,
        ease: "power2.out"
    });
    // camera.lookAt(snakeBody[0].position);

    renderer.render(scene, camera);
}

init();