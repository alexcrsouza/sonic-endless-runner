document.addEventListener('DOMContentLoaded', () => {
    const dino = document.getElementById('dino');
    const gameArea = document.getElementById('game-area');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const gameOverDisplay = document.getElementById('game-over');
    const startButton = document.getElementById('start-game');
    const restartButton = document.getElementById('restart');
    const gameBackground = document.getElementById('game-background');
    
    // Iniciar com o Sonic parado
    dino.classList.add('idle');
    
    // Sound effects
    const jumpSound = new Audio('../static/sounds/jump.mp3');
    const hitSound = new Audio('../static/sounds/hit.mp3');
    
    let isJumping = false;
    let isGameOver = false;
    let gameStarted = false;
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let gravity = 0.9;
    let position = 0;
    let upTime = 0;
    let downTime = 0;
    let obstacleInterval;
    let powerUpInterval;
    let gameSpeed = 1;
    let dayNightCycle;
    let isNightMode = false;
    let lives = 3;
    let invincible = false;
    
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    
    // Criar elemento para exibir vidas
    const livesDisplay = document.createElement('div');
    livesDisplay.id = 'lives';
    livesDisplay.textContent = `Vidas: ${lives}`;
    livesDisplay.style.position = 'absolute';
    livesDisplay.style.top = '60px';
    livesDisplay.style.right = '10px';
    livesDisplay.style.fontSize = '28px';
    livesDisplay.style.fontWeight = 'bold';
    livesDisplay.style.color = '#fff';
    livesDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    livesDisplay.style.padding = '5px 10px';
    livesDisplay.style.borderRadius = '5px';
    livesDisplay.style.zIndex = '100';
    gameArea.parentNode.appendChild(livesDisplay);
    
    // Função para iniciar o jogo
    function startGame() {
        if (gameStarted) return;
        
        gameStarted = true;
        isGameOver = false;
        score = 0;
        gameSpeed = 1;
        lives = 3;
        position = -5; // Ajustado para -5px
        dino.style.bottom = '-5px'; // Ajustado para -5px
        updateScore();
        updateLives();
        gameOverDisplay.classList.add('hidden');
        startButton.disabled = true;
        dino.classList.remove('idle');
        dino.classList.add('running');
        dino.style.backgroundPosition = '-192px 0'; // Posição inicial de corrida
        
        // Iniciar a geração de obstáculos
        obstacleInterval = setInterval(createObstacle, 1500 / gameSpeed);
        
        // Iniciar a geração de power-ups
        powerUpInterval = setInterval(createPowerUp, 10000);
        
        // Iniciar a contagem de pontos
        scoreCounter = setInterval(() => {
            if (!isGameOver) {
                score++;
                updateScore();
                
                // Aumentar dificuldade a cada 100 pontos
                if (score % 100 === 0) {
                    gameSpeed += 0.1;
                    clearInterval(obstacleInterval);
                    obstacleInterval = setInterval(createObstacle, 1500 / gameSpeed);
                }
            }
        }, 100);
        
        // Iniciar ciclo dia/noite
        startDayNightCycle();
    }
    
    function updateLives() {
        livesDisplay.textContent = `Vidas: ${lives}`;
    }
    
    function startDayNightCycle() {
        dayNightCycle = setInterval(() => {
            isNightMode = !isNightMode;
            
            if (isNightMode) {
                gameArea.style.backgroundImage = 'linear-gradient(to bottom, #0d1259, #1a237e)';
            } else {
                gameArea.style.backgroundImage = 'linear-gradient(to bottom, #1a237e, #303f9f)';
            }
            
            // Efeito de transição suave
            gameArea.style.transition = 'background-image 3s';
        }, 30000); // Alternar a cada 30 segundos
    }
    
    function updateScore() {
        // Garantir que o elemento score esteja visível
        scoreDisplay.style.display = 'block';
        scoreDisplay.textContent = `Score: ${score}`;
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreDisplay.textContent = `High Score: ${highScore}`;
        }
    }
    
    // Função para fazer o dinossauro pular
    function jump() {
        if (isJumping || isGameOver) return;
        
        jumpSound.currentTime = 0;
        jumpSound.play();
        
        isJumping = true;
        dino.classList.remove('running');
        dino.classList.remove('hit');  // Remover animação de hit se estiver ativa
        dino.classList.add('jumping');
        
        // Usar o frame de pulo (6º frame na primeira linha)
        dino.style.backgroundPosition = '-240px 0';
        
        // Ajustar a posição inicial do pulo para compensar o deslocamento do personagem
        position = -5; // Começar do ajuste de -5px
        
        upTime = setInterval(() => {
            // Movimento para cima
            if (position >= 180) {
                clearInterval(upTime);
                
                // Movimento para baixo
                downTime = setInterval(() => {
                    if (position <= -5) { // Ajustado para -5px
                        clearInterval(downTime);
                        isJumping = false;
                        position = -5; // Manter na posição ajustada
                        dino.classList.remove('jumping');
                        dino.classList.add('running');
                        dino.style.backgroundPosition = '-192px 0';
                    } else {
                        position -= 6;
                        dino.style.bottom = position + 'px';
                    }
                }, 20);
            } else {
                position += 30;
                position = position * gravity;
                dino.style.bottom = position + 'px';
            }
        }, 20);
    }
    
    // Função para criar obstáculos
    function createObstacle() {
        if (isGameOver) return;
        
        const obstacle = document.createElement('div');
        
        // Criar diferentes tipos de obstáculos
        const obstacleType = Math.random() > 0.7 ? 'bird' : 'cactus';
        obstacle.classList.add(obstacleType);
        
        if (obstacleType === 'bird') {
            // Buzz Bomber voa em diferentes alturas
            const height = Math.random() > 0.5 ? 80 : 150;
            obstacle.style.bottom = `${height}px`;
            obstacle.style.height = '64px';
            obstacle.style.width = '64px';
        } else {
            // Crabmeat - inimigo terrestre
            // Não precisa de ajustes adicionais, pois o CSS já define o tamanho e a animação
        }
        
        gameArea.appendChild(obstacle);
        
        let obstaclePosition = gameArea.offsetWidth;
        obstacle.style.left = obstaclePosition + 'px';
        
        let obstacleTimer = setInterval(() => {
            if (obstaclePosition < -40) {
                // Remover obstáculo quando sair da tela
                clearInterval(obstacleTimer);
                gameArea.removeChild(obstacle);
            } else if (
                obstaclePosition > 40 && 
                obstaclePosition < 90 && 
                ((obstacleType === 'cactus' && position < 32) || 
                 (obstacleType === 'bird' && 
                  ((obstacle.style.bottom === '80px' && position > 60 && position < 150) || 
                   (obstacle.style.bottom === '150px' && position > 130 && position < 220))))
            ) {
                // Colisão detectada
                if (!invincible) {
                    hitSound.play();
                    
                    lives--;
                    updateLives();
                    
                    if (lives <= 0) {
                        gameOver();
                    } else {
                        // Breve invencibilidade após perder uma vida
                        invincible = true;
                        
                        // Usar apenas o frame 7 da linha 5 para o hit
                        dino.classList.remove('running');
                        dino.classList.add('hit');
                        
                        setTimeout(() => {
                            invincible = false;
                            dino.classList.remove('hit');
                            
                            // Restaurar animação de corrida se não estiver pulando
                            if (!isJumping) {
                                dino.classList.add('running');
                                dino.style.backgroundPosition = '-192px 0';
                            }
                        }, 1500);
                    }
                    
                    // Remover o obstáculo após a colisão
                    clearInterval(obstacleTimer);
                    gameArea.removeChild(obstacle);
                }
            } else {
                // Mover obstáculo com velocidade baseada no gameSpeed
                obstaclePosition -= 10 * gameSpeed;
                obstacle.style.left = obstaclePosition + 'px';
            }
        }, 20);
    }
    
    // Função para criar power-ups
    function createPowerUp() {
        if (isGameOver) return;
        
        const powerUp = document.createElement('div');
        powerUp.classList.add('power-up');
        
        // Diferentes tipos de power-ups
        const powerUpType = Math.random() > 0.5 ? 'shield' : 'life';
        powerUp.dataset.type = powerUpType;
        
        if (powerUpType === 'shield') {
            powerUp.style.backgroundColor = '#3498db';
        } else {
            powerUp.style.backgroundColor = '#e74c3c';
        }
        
        powerUp.style.position = 'absolute';
        powerUp.style.width = '25px';
        powerUp.style.height = '25px';
        powerUp.style.borderRadius = '50%';
        powerUp.style.bottom = `${Math.random() * 150 + 50}px`;
        
        gameArea.appendChild(powerUp);
        
        let powerUpPosition = gameArea.offsetWidth;
        powerUp.style.left = powerUpPosition + 'px';
        
        let powerUpTimer = setInterval(() => {
            if (powerUpPosition < -20) {
                // Remover power-up quando sair da tela
                clearInterval(powerUpTimer);
                gameArea.removeChild(powerUp);
            } else if (
                powerUpPosition > 40 && 
                powerUpPosition < 90 && 
                position > 60 && 
                position < 100
            ) {
                // Power-up coletado
                clearInterval(powerUpTimer);
                gameArea.removeChild(powerUp);
                
                if (powerUpType === 'shield') {
                    // Ativar escudo (invencibilidade)
                    invincible = true;
                    dino.classList.add('invincible');
                    
                    setTimeout(() => {
                        invincible = false;
                        dino.classList.remove('invincible');
                        
                        // Restaurar animação de corrida se não estiver pulando
                        if (!isJumping && !dino.classList.contains('hit')) {
                            dino.style.backgroundPosition = '-192px 0';
                        }
                    }, 5000);
                } else {
                    // Ganhar vida extra
                    if (lives < 5) {
                        lives++;
                        updateLives();
                    }
                }
            } else {
                // Mover power-up
                powerUpPosition -= 8 * gameSpeed;
                powerUp.style.left = powerUpPosition + 'px';
            }
        }, 20);
    }
    
    // Função para finalizar o jogo
    function gameOver() {
        isGameOver = true;
        gameStarted = false;
        clearInterval(obstacleInterval);
        clearInterval(powerUpInterval);
        clearInterval(scoreCounter);
        clearInterval(dayNightCycle);
        
        dino.classList.remove('running');
        dino.classList.remove('jumping');
        dino.classList.add('idle');
        dino.style.backgroundPosition = '0 0'; // Posição de parado
        dino.style.bottom = '-5px'; // Manter ajustado ao chão
        position = -5; // Atualizar a variável de posição
        dino.style.boxShadow = 'none';
        
        // Remover todos os obstáculos e power-ups
        document.querySelectorAll('.cactus, .bird, .power-up').forEach(element => {
            element.remove();
        });
        
        gameOverDisplay.classList.remove('hidden');
        startButton.disabled = false;
    }
    
    // Event listeners
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (!gameStarted) {
                startGame();
            } else {
                jump();
            }
            // Prevenir que a página role
            e.preventDefault();
        } else if (e.code === 'KeyP') {
            // Pausar/Retomar o jogo
            if (gameStarted && !isGameOver) {
                if (document.body.classList.contains('paused')) {
                    document.body.classList.remove('paused');
                    dino.classList.add('running');
                    gameArea.style.animationPlayState = 'running';
                    gameBackground.style.animationPlayState = 'running';
                    document.querySelectorAll('.cactus, .bird, .power-up, .cloud').forEach(element => {
                        element.style.animationPlayState = 'running';
                    });
                } else {
                    document.body.classList.add('paused');
                    dino.classList.remove('running');
                    gameArea.style.animationPlayState = 'paused';
                    gameBackground.style.animationPlayState = 'paused';
                    document.querySelectorAll('.cactus, .bird, .power-up, .cloud').forEach(element => {
                        element.style.animationPlayState = 'paused';
                    });
                }
            }
        }
    });
    
    document.addEventListener('touchstart', (e) => {
        if (!gameStarted) {
            startGame();
        } else {
            jump();
        }
        // Prevenir que a página role
        e.preventDefault();
    });
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});
    // Função para criar estrelas no fundo (efeito de paralaxe)
    function createStar() {
        if (isGameOver) return;
        
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.position = 'absolute';
        star.style.width = '2px';
        star.style.height = '2px';
        star.style.backgroundColor = '#ffffff';
        star.style.borderRadius = '50%';
        
        // Posição aleatória
        const height = Math.random() * 300 + 20;
        star.style.bottom = `${height}px`;
        
        gameArea.appendChild(star);
        
        let starPosition = gameArea.offsetWidth;
        star.style.left = starPosition + 'px';
        
        // Velocidade mais lenta que os obstáculos (efeito de paralaxe)
        const starSpeed = 1 + Math.random() * 3;
        
        let starTimer = setInterval(() => {
            if (starPosition < -5) {
                clearInterval(starTimer);
                gameArea.removeChild(star);
            } else {
                starPosition -= starSpeed * gameSpeed;
                star.style.left = starPosition + 'px';
            }
        }, 20);
    }
    
    // Iniciar geração de estrelas
    setInterval(createStar, 500);
    
    // Adicionar linha do chão
    const groundLine = document.createElement('div');
    groundLine.classList.add('ground-line');
    gameArea.appendChild(groundLine);
    
    // Função para criar projétil do Buzz Bomber
    function createBuzzbomberProjectile(startX, startY) {
        if (isGameOver) return;
        
        const projectile = document.createElement('div');
        projectile.classList.add('buzzbomber-projectile');
        projectile.style.left = startX + 'px';
        projectile.style.bottom = startY + 'px';
        
        gameArea.appendChild(projectile);
        
        let projectilePosition = startX;
        
        let projectileTimer = setInterval(() => {
            if (projectilePosition < -20) {
                clearInterval(projectileTimer);
                gameArea.removeChild(projectile);
            } else if (
                projectilePosition > 40 && 
                projectilePosition < 90 && 
                position >= -5 && position < 50
            ) {
                // Colisão com projétil
                if (!invincible) {
                    hitSound.play();
                    
                    lives--;
                    updateLives();
                    
                    if (lives <= 0) {
                        gameOver();
                    } else {
                        invincible = true;
                        dino.classList.remove('running');
                        dino.classList.add('hit');
                        
                        setTimeout(() => {
                            invincible = false;
                            dino.classList.remove('hit');
                            
                            if (!isJumping) {
                                dino.classList.add('running');
                                dino.style.backgroundPosition = '-192px 0';
                            }
                        }, 1500);
                    }
                    
                    clearInterval(projectileTimer);
                    gameArea.removeChild(projectile);
                }
            } else {
                projectilePosition -= 15 * gameSpeed;
                projectile.style.left = projectilePosition + 'px';
            }
        }, 20);
    }