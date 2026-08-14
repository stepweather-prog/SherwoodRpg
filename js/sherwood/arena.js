// ===== АРЕНА =====
arena: function() {
    this._playSound('click');
    if (!Sherwood.Arena) { this._showPlaceholder('Арена', 'arena'); return; }
    if (Sherwood.Arena.isInMatch()) { this._showArenaBattle(); return; }
    
    var stats = Sherwood.Arena.getStats();
    var h = '';
    
    h += '<div style="text-align:center;">';
    h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:4px;">' + stats.rank + '</div>';
    h += '<div style="color:#aaa;font-size:0.8em;margin-bottom:30px;">Побед: ' + stats.wins + ' | Поражений: ' + stats.losses + '</div>';
    h += '<img src="assets/interface/blades_arena.png" style="width:240px;height:240px;object-fit:contain;display:block;margin:0 auto 30px;">';
    h += '<button onclick="SherwoodUI._startArenaBattle()" style="background:#c9a040;border:none;border-radius:8px;padding:14px 40px;color:#000;font-weight:bold;cursor:pointer;font-size:1em;">В бой</button>';
    h += '</div>';
    
    var bgImage = 'assets/interface/section_arena.png';
    
    if (this._screenLayer) { 
        this._screenLayer.innerHTML = '<div style="height:100%;background:url(\'' + bgImage + '\') center/cover no-repeat;display:flex;flex-direction:column;overflow:hidden;"><div style="display:flex;align-items:center;gap:12px;padding:12px;flex-shrink:0;"><button onclick="SherwoodUI.loadHome()" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;flex-shrink:0;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;flex-shrink:0;">Арена</span></div><div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px;">' + h + '</div></div>'; 
        this._screenLayer.style.display = 'block'; 
    }
},

_startArenaBattle: function() {
    this._stopMusic();
    Sherwood.Arena.refreshOpponents();
    var opps = Sherwood.Arena.getOpponents();
    if (opps.length < 3) {
        this._showToast('Недостаточно противников');
        return;
    }
    this._currentArenaOpponents = [opps[0], opps[1], opps[2]];
    this._currentArenaOpponentIndex = 0;
    this._showArenaBattle();
},

_showArenaBattle: function() {
    if (!this._currentArenaOpponents || this._currentArenaOpponentIndex >= this._currentArenaOpponents.length) {
        this._arenaVictory();
        return;
    }
    
    var aliveOpponents = this._currentArenaOpponents.filter(function(o) { return o.stats.hp > 0; });
    if (aliveOpponents.length === 0) {
        this._arenaVictory();
        return;
    }
    
    if (this._currentArenaOpponents[this._currentArenaOpponentIndex].stats.hp <= 0) {
        this._currentArenaOpponentIndex = this._currentArenaOpponents.indexOf(aliveOpponents[0]);
    }
    
    var opp = this._currentArenaOpponents[this._currentArenaOpponentIndex];
    var skinFile = opp.skin || 'assets/hero_skins/skin1_01.png';
    
    // Сбрасываем заряд
    this._arenaCharge = 0;
    this._arenaChargeMax = 5000;
    this._arenaChargeStart = null;
    if (this._arenaChargeInterval) {
        clearInterval(this._arenaChargeInterval);
        this._arenaChargeInterval = null;
    }
    
    // Кнопка вызывает _arenaAttack
    this._showArenaBattleScreen(
        { name: opp.name, image: skinFile, hp: opp.stats.hp, maxHp: opp.stats.maxHp },
        'SherwoodUI._arenaAttack()',
        'SherwoodUI._arenaFlee()'
    );
    
    // Запускаем заряд автоматически
    this._arenaStartCharge();
    
    // Добавляем кнопку смены цели
    var self = this;
    setTimeout(function() {
        self._addArenaSwitchButton();
    }, 100);
},

_showArenaBattleScreen: function(enemyData, onAttack, onFlee) {
    var e = enemyData, p = Sherwood.getPlayer();
    var ehp = e.maxHp > 0 ? Math.round((e.hp / e.maxHp) * 100) : 100;
    var php = p.stats.maxHp > 0 ? Math.round((p.stats.hp / p.stats.maxHp) * 100) : 100;
    var activeSkin = p.activeSkin || 'skin1_01';
    var imgPath = e.image;
    
    var h = '<div style="text-align:center;display:flex;flex-direction:column;height:100%;overflow:hidden;">';
    
    // 1. СТАТЫ — САМЫЙ ВЕРХ
    h += '<div style="display:flex;justify-content:center;gap:12px;margin-bottom:2px;flex-shrink:0;">';
    h += '<div style="display:flex;align-items:center;gap:2px;"><img src="assets/interface/icon_power.png" style="width:24px;height:24px;"><span style="color:#fff;font-size:0.75em;font-weight:bold;">' + p.stats.attack + '</span></div>';
    h += '<div style="display:flex;align-items:center;gap:2px;"><img src="assets/interface/icon_defense.png" style="width:24px;height:24px;"><span style="color:#fff;font-size:0.75em;font-weight:bold;">' + p.stats.defense + '</span></div>';
    h += '<div style="display:flex;align-items:center;gap:2px;"><img src="assets/interface/icon_health.png" style="width:24px;height:24px;"><span style="color:#fff;font-size:0.75em;font-weight:bold;">' + p.stats.hp + '/' + p.stats.maxHp + '</span></div>';
    h += '</div>';
    
    // 2. ВРАГ И ЕГО ШКАЛА
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:2px;flex-shrink:0;">';
    h += '<div style="width:40px;height:40px;border-radius:50%;border:2px solid #f44336;overflow:hidden;flex-shrink:0;"><img src="' + imgPath + '" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display=&quot;none&quot;"></div>';
    h += '<div style="position:relative;width:250px;height:120px;">';
    h += '<img src="assets/interface/life_scale.png" style="width:100%;height:155%;position:absolute;top:0;left:0;z-index:1;">';
    h += '<div style="position:absolute;top:80px;left:23px;right:23px;bottom:12px;overflow:hidden;z-index:0;">';
    h += '<div id="enemy-hp-bar" style="background:url(assets/interface/filling_the_poisoned_health_bar.jpeg) left/auto 100%;height:100%;width:' + ehp + '%;transition:width 0.5s ease-out;"></div>';
    h += '</div>';
    h += '<span id="enemy-hp-text" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.65em;z-index:2;text-shadow:0 0 6px #000;font-weight:bold;">' + e.hp + '/' + e.maxHp + '</span></div>';
    h += '</div>';
    
    // 3. КАРТА ВРАГА
    h += '<div style="position:relative;display:inline-block;margin:0 auto;flex-shrink:0;">';
    h += '<img src="' + imgPath + '" id="enemy-card" style="width:150px;height:150px;object-fit:contain;position:relative;z-index:1;border-radius:16px;transition:filter 0.15s;" onerror="this.style.display=&quot;none&quot;">';
    h += '<div id="enemy-hit-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;pointer-events:none;display:none;"></div>';
    h += '<div id="damage-numbers" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:3;pointer-events:none;"></div>';
    h += '</div>';
    
    // 4. КНОПКА АТАКИ — НАД HP ГЕРОЯ
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:4px;margin:2px 0;flex-shrink:0;">';
    h += '<button id="attack-btn" onclick="' + onAttack + '" style="background:url(assets/skills/skill_shot_normal.png) center/contain no-repeat;width:60px;height:60px;border:3px solid #c9a040;border-radius:50%;cursor:pointer;transition:filter 0.3s, box-shadow 0.3s;"></button>';
    h += '</div>';
    
    // 5. ШКАЛА ЖИЗНИ ИГРОКА
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin:2px 0;flex-shrink:0;">';
    h += '<div id="player-avatar" style="width:40px;height:40px;border-radius:50%;border:2px solid #c9a040;overflow:hidden;flex-shrink:0;position:relative;">';
    h += '<img src="assets/hero_skins/' + activeSkin + '.png" style="width:100%;height:100%;object-fit:contain;position:relative;z-index:1;">';
    h += '<div id="player-hit-anim" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;display:none;"></div>';
    h += '</div>';
    h += '<div style="position:relative;width:250px;height:120px;">';
    h += '<img src="assets/interface/life_scale.png" style="width:100%;height:155%;position:absolute;top:0;left:0;z-index:1;">';
    h += '<div style="position:absolute;top:80px;left:23px;right:23px;bottom:12px;overflow:hidden;z-index:0;">';
    h += '<div id="player-hp-bar" style="background:url(assets/interface/life_interface_asset_horizontal_progress_bar.jpeg) left/auto 100%;height:100%;width:' + php + '%;transition:width 0.5s ease-out;"></div>';
    h += '</div>';
    h += '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.65em;z-index:2;text-shadow:0 0 6px #000;font-weight:bold;">HP ' + p.stats.hp + '/' + p.stats.maxHp + '</span></div>';
    h += '</div>';
    
    // 6. ЛОГ БОЯ — ПОД ШКАЛОЙ ИГРОКА
    h += '<div id="battle-dialog" style="background:rgba(0,0,0,0.75);border:1px solid #555;border-radius:8px;padding:5px;margin:2px 4%;min-height:40px;max-height:40px;overflow-y:auto;color:#aaa;font-size:0.6em;text-align:left;line-height:1.3;flex-shrink:0;"></div>';
    
    h += '</div>';
    
    this._openScreen('', 'arena', h);
},

_addArenaSwitchButton: function() {
    var oldBtn = document.getElementById('arena-switch-btn');
    if (oldBtn) oldBtn.remove();
    
    var btn = document.createElement('button');
    btn.id = 'arena-switch-btn';
    btn.style.cssText = 'position:absolute;bottom:120px;left:10px;z-index:100;background:rgba(0,0,0,0.7);border:2px solid #c9a040;border-radius:50%;cursor:pointer;padding:0;width:44px;height:44px;display:flex;align-items:center;justify-content:center;';
    btn.innerHTML = '<span style="color:#ffd700;font-size:1.2em;">⇄</span>';
    btn.onclick = function(e) { 
        e.stopPropagation(); 
        SherwoodUI._arenaSwitchTarget(); 
    };
    this._screenLayer.appendChild(btn);
},

_arenaStartCharge: function() {
    if (this._arenaChargeStart) return;
    this._arenaChargeStart = Date.now();
    
    if (this._arenaChargeInterval) {
        clearInterval(this._arenaChargeInterval);
    }
    
    this._arenaChargeInterval = setInterval(function() {
        SherwoodUI._updateArenaCharge();
    }, 100);
},

_updateArenaCharge: function() {
    if (!this._arenaChargeStart) return;
    
    this._arenaCharge = Date.now() - this._arenaChargeStart;
    if (this._arenaCharge > this._arenaChargeMax) this._arenaCharge = this._arenaChargeMax;
    
    var chargePercent = this._arenaCharge / this._arenaChargeMax;
    
    var attackBtn = document.getElementById('attack-btn');
    if (attackBtn) {
        attackBtn.style.filter = 'brightness(' + (0.4 + chargePercent * 0.6) + ')';
    }
    
    if (this._arenaCharge >= this._arenaChargeMax) {
        clearInterval(this._arenaChargeInterval);
        this._arenaChargeInterval = null;
        
        var attackBtn = document.getElementById('attack-btn');
        if (attackBtn) {
            attackBtn.style.filter = 'brightness(1.3)';
            attackBtn.style.boxShadow = '0 0 20px rgba(255,215,0,0.8)';
        }
        
        this._showDialog('Полный заряд!', '#ffd700');
        this._playSound('levelup');
    }
},

_resetArenaCharge: function() {
    this._arenaChargeStart = null;
    this._arenaCharge = 0;
    if (this._arenaChargeInterval) {
        clearInterval(this._arenaChargeInterval);
        this._arenaChargeInterval = null;
    }
    
    var attackBtn = document.getElementById('attack-btn');
    if (attackBtn) {
        attackBtn.style.filter = '';
        attackBtn.style.boxShadow = '';
    }
},

_arenaAttack: function() {
    this._playHitSounds();
    
    if (!this._currentArenaOpponents || this._currentArenaOpponentIndex >= this._currentArenaOpponents.length) {
        this._arenaVictory();
        return;
    }
    
    var opp = this._currentArenaOpponents[this._currentArenaOpponentIndex];
    if (!opp || opp.stats.hp <= 0) {
        this._arenaSwitchTarget();
        return;
    }
    
    var player = Sherwood.getPlayer();
    
    var chargePercent = this._arenaCharge / this._arenaChargeMax;
    if (chargePercent < 0.05) chargePercent = 0.05; // Минимальный урон даже без заряда
    
    var minDamage = Math.max(1, Math.floor((player.stats.attack - opp.stats.defense) * 0.3));
    var maxDamage = Math.max(minDamage + 1, Math.floor((player.stats.attack - opp.stats.defense) * 1.2));
    var damage = Math.floor(minDamage + (maxDamage - minDamage) * chargePercent);
    
    if (damage < 1) damage = 1;
    
    var crit = chargePercent >= 1 && Math.random() * 100 < 20;
    if (crit) damage = Math.floor(damage * 1.8);
    
    opp.stats.hp -= damage;
    if (opp.stats.hp < 0) opp.stats.hp = 0;
    
    this._hitEnemyCard();
    this._showDamageNumber(damage, crit);
    if (crit) this._showCriticalHitAnim();
    this._updateEnemyHP(Math.max(0, opp.stats.hp), opp.stats.maxHp);
    
    this._showDialog(
        (crit ? 'CRIT! ' : '') + 'Урон: ' + damage + ' (заряд ' + Math.floor(chargePercent * 100) + '%)',
        crit ? '#ff6a00' : '#fff'
    );
    
    this._resetArenaCharge();
    
    if (opp.stats.hp <= 0) {
        this._showDialog(opp.name + ' повержен!', '#4caf50');
        if (Sherwood.Daily) Sherwood.Daily.updateProgress('arena_wins', 1);
        
        var aliveOpponents = this._currentArenaOpponents.filter(function(o) { return o.stats.hp > 0; });
        
        if (aliveOpponents.length === 0) {
            var self = this;
            setTimeout(function() { self._arenaVictory(); }, 1500);
            return;
        }
        
        this._currentArenaOpponentIndex = this._currentArenaOpponents.indexOf(aliveOpponents[0]);
        
        var self = this;
        setTimeout(function() { self._showArenaBattle(); }, 1500);
        return;
    }
    
    this._arenaBotsFight();
    
    var oppDamage = Math.max(1, Math.floor((opp.stats.attack - player.stats.defense) * 0.5 + Math.random() * 10));
    player.stats.hp = Math.max(0, player.stats.hp - oppDamage);
    
    this._showPlayerHitAnim();
    
    var self = this;
    setTimeout(function() {
        self._showDialog(opp.name + ' бьёт: ' + oppDamage + ' урона', '#f44336');
        SherwoodUI.updateDisplay();
        
        if (player.stats.hp <= 0) {
            self._arenaDefeat();
            return;
        }
        
        self._arenaStartCharge();
    }, 700);
    
    this.updateDisplay();
},

_arenaSwitchTarget: function() {
    if (!this._currentArenaOpponents) return;
    
    var aliveIndices = [];
    for (var i = 0; i < this._currentArenaOpponents.length; i++) {
        if (this._currentArenaOpponents[i].stats.hp > 0 && i !== this._currentArenaOpponentIndex) {
            aliveIndices.push(i);
        }
    }
    
    if (aliveIndices.length === 0) {
        this._showDialog('Нет других живых противников!', '#ff9800');
        return;
    }
    
    this._currentArenaOpponentIndex = aliveIndices[0];
    this._resetArenaCharge();
    this._showDialog('Цель сменена!', '#4caf50');
    
    var self = this;
    setTimeout(function() { self._showArenaBattle(); }, 300);
},

_arenaBotsFight: function() {
    if (!this._currentArenaOpponents) return;
    
    var player = Sherwood.getPlayer();
    var playerAlive = player.stats.hp > 0;
    
    for (var i = 0; i < this._currentArenaOpponents.length; i++) {
        var attacker = this._currentArenaOpponents[i];
        if (!attacker || attacker.stats.hp <= 0) continue;
        
        var targets = [];
        
        for (var j = 0; j < this._currentArenaOpponents.length; j++) {
            if (i !== j && this._currentArenaOpponents[j].stats.hp > 0) {
                targets.push({ type: 'bot', index: j });
            }
        }
        
        if (playerAlive) {
            targets.push({ type: 'player' });
        }
        
        if (targets.length === 0) continue;
        
        var target = targets[Math.floor(Math.random() * targets.length)];
        var botDamage = Math.max(1, Math.floor(attacker.stats.attack * 0.3 + Math.random() * 20));
        
        if (target.type === 'bot') {
            var targetBot = this._currentArenaOpponents[target.index];
            targetBot.stats.hp = Math.max(0, targetBot.stats.hp - botDamage);
        } else if (target.type === 'player') {
            player.stats.hp = Math.max(0, player.stats.hp - botDamage);
        }
    }
    
    this.updateDisplay();
    
    var aliveBots = this._currentArenaOpponents.filter(function(o) { return o.stats.hp > 0; });
    
    if (player.stats.hp <= 0) {
        this._arenaDefeat();
        return;
    }
    
    if (aliveBots.length === 0) {
        var self = this;
        setTimeout(function() { self._arenaVictory(); }, 1000);
    }
},

_arenaVictory: function() {
    this._stopMusic();
    this._resetArenaCharge();
    Sherwood.Arena._wins++;
    var exp = 150, gold = 80, silver = 200;
    Sherwood.addExp(exp);
    Sherwood.addResource('gold', gold);
    Sherwood.addResource('silver', silver);
    Sherwood.saveGame();
    SherwoodUI.updateDisplay();
    this._currentArenaOpponents = null;
    this._pendingRewards = { exp: exp, gold: gold, silver: silver };
    this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.arena(); };
    this._showVictoryScreen(this._pendingRewards);
},

_arenaDefeat: function() {
    this._stopMusic();
    this._resetArenaCharge();
    Sherwood.Arena._losses++;
    var player = Sherwood.getPlayer();
    player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.2));
    Sherwood.saveGame();
    this._currentArenaOpponents = null;
    this._pendingRewards = { exp: 20, silver: 50 };
    this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.arena(); };
    this._showDefeatScreen(this._pendingRewards);
},

_arenaFlee: function() { 
    this._stopMusic(); 
    this._resetArenaCharge();
    this._currentArenaOpponents = null; 
    Sherwood.Arena._losses++;
    this._playMusic('main_theme'); 
    this.arena(); 
},
