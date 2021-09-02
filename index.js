const canvas = document.querySelector("canvas");
const scoreEl = document.querySelector("#score");
const gameButton = document.getElementById("button");
const scoreModel = document.getElementById("score_model");
canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext("2d");

class Player {
	constructor(x, y, radius, color) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}
}

class Projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}

	update() {
		this.draw();
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

class Enemy {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}

	update() {
		this.draw();
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

const friction = 0.99;
class Particle {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
		this.alpha = 1;
	}

	draw() {
		c.save();
		c.beginPath();
		c.globalAlpha = this.alpha;
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
		c.restore();
	}

	update() {
		this.draw();
		this.velocity.x *= friction;
		this.velocity.y *= friction;
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
		this.alpha = this.alpha - 0.01;
	}
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let projectile = new Projectile(canvas.width / 2, canvas.height / 2, 5, "red", {
	x: 1,
	y: 1,
});

function init() {
	player = new Player(x, y, 10, "white");
	projectiles = [];
	enemies = [];
	particles = [];
	score = 0;
	scoreEl.innerText = 0;
}

function spawnEnemy() {
	setInterval(() => {
		const radius = Math.random() * (30 - 4) + 4;
		let x;
		let y;
		if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : radius + canvas.width;
			y = Math.random() * canvas.height;
		} else {
			x = Math.random() * canvas.width;
			y = Math.random() < 0.5 ? 0 - radius : radius + canvas.height;
		}

		const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
		const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
		const velocity = { x: Math.cos(angle), y: Math.sin(angle) };
		enemies.push(new Enemy(x, y, radius, color, velocity));
	}, 1000);
}

let animationId;
let score = 0;
function animate() {
	animationId = requestAnimationFrame(animate);
	c.fillStyle = "rgba(0,0,0,0.1)";
	c.fillRect(0, 0, canvas.width, canvas.height);
	player.draw();

	particles.forEach((particle, index) => {
		if (particle.alpha <= 0) {
			particles.splice(index, 1);
		} else {
			particle.update();
		}
	});

	projectiles.forEach((projectile, index) => {
		projectile.update();
		// remove from edges of screen
		if (
			projectile.x + projectile.radius < 0 ||
			projectile.x - projectile.radius > canvas.width ||
			projectile.y + projectile.radius < 0 ||
			projectile.y - projectile.radius > canvas.height
		) {
			setTimeout(() => {
				projectiles.splice(index, 1);
			}, 0);
		}
	});
	enemies.forEach((enemy, index) => {
		enemy.update();

		const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
		if (dist - player.radius - player.radius < 1) {
			cancelAnimationFrame(animationId);
			scoreModel.style.display = "flex";

			document.getElementById("h1-score").innerText = score;
		}

		projectiles.forEach((projectile, Pindex) => {
			const dist = Math.hypot(
				projectile.x - enemy.x,
				projectile.y - enemy.y
			);
			// projectiles touch enemy
			if (dist - enemy.radius - projectile.radius <= 0) {
				// increase score
				score += 100;
				scoreEl.innerText = score;

				// create explosions
				for (let i = 0; i < enemy.radius * 2; i++) {
					particles.push(
						new Particle(
							projectile.x,
							projectile.y,
							Math.random() * 3,
							enemy.color,
							{
								x: (Math.random() - 0.5) * (Math.random() * 4),
								y: (Math.random() - 0.5) * (Math.random() * 4),
							}
						)
					);
				}

				if (enemy.radius - 10 > 5) {
					gsap.to(enemy, { radius: enemy.radius - 10 });
					setTimeout(() => {
						projectiles.splice(Pindex, 1);
					}, 0);
				} else {
					score += 100;
					scoreEl.innerText = score;
					setTimeout(() => {
						enemies.splice(index, 1);
						projectiles.splice(Pindex, 1);
					}, 0);
				}
			}
		});
	});
}

window.addEventListener("click", (e) => {
	const angle = Math.atan2(
		e.clientY - canvas.height / 2,
		e.clientX - canvas.width / 2
	);
	const velocity = { x: Math.cos(angle) * 5, y: Math.sin(angle) * 5 };
	projectiles.push(
		new Projectile(
			canvas.width / 2,
			canvas.height / 2,
			5,
			"white",
			velocity
		)
	);
});

gameButton.addEventListener("click", (e) => {
	init();
	console.log("started");
	scoreModel.style.display = "none";
	spawnEnemy();
	animate();
	e.stopPropagation();
});
