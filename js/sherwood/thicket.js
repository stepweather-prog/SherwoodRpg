    showUI: function() {
        if (typeof UI === 'undefined') return;
        UI._playSound('click');

        var self = this;
        var chapters = {};
        for (var i = 0; i < this.NODES.length; i++) {
            var n = this.NODES[i];
            if (!chapters[n.chapter]) chapters[n.chapter] = { name: n.chapterName, nodes: [] };
            chapters[n.chapter].nodes.push(n);
        }

        var chapterKeys = Object.keys(chapters).sort(function(a, b) { return parseInt(a) - parseInt(b); });
        var selectedChapter = this._selectedChapter || 1;

        // Простая обертка
        var h = '<div style="width:100%;max-width:350px;margin:0 auto;padding:10px;box-sizing:border-box;">';
        
        // Кнопки глав
        h += '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:5px;margin-bottom:15px;">';
        for (var c = 0; c < chapterKeys.length; c++) {
            var chId = parseInt(chapterKeys[c]);
            var isActive = (chId === selectedChapter);
            h += '<div onclick="Sherwood.Thicket._selectChapter(' + chId + ')" style="cursor:pointer;padding:5px 8px;border:1px solid ' + (isActive ? '#c9a040' : '#333') + ';background:' + (isActive ? '#3a2a10' : '#111') + ';color:' + (isActive ? '#ffd27a' : '#888') + ';font:bold 11px serif;border-radius:4px;">' + (chId === 0 ? 'Рейд' : 'Гл. ' + chId) + '</div>';
        }
        h += '</div>';

        var chData = chapters[selectedChapter];
        if (chData) {
            h += '<div style="color:#c8a050;text-align:center;margin-bottom:10px;font-weight:bold;font-size:13px;">' + chData.name + '</div>';
            
            // СПИСОК (строго друг под другом)
            h += '<div style="display:flex;flex-direction:column;gap:5px;">';

            for (var ni = 0; ni < chData.nodes.length; ni++) {
                var node = chData.nodes[ni];
                var cups = this.getCups(node.id);
                var available = this.isNodeAvailable(node.id, 1);
                var border = cups >= 3 ? '#ffd700' : (available ? '#c9a040' : '#333');

                // Карточка-строка
                h += '<div onclick="Sherwood.Thicket._showNodePanel(' + node.id + ')" style="cursor:pointer;background:#111;border:1px solid ' + border + ';border-radius:6px;padding:6px;display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;opacity:' + (available ? 1 : 0.4) + ';">';
                
                // Иконка
                h += '<img src="' + node.imagePath + '" style="width:36px;height:36px;object-fit:contain;flex-shrink:0;background:#000;border-radius:4px;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
                
                // Текст
                h += '<div style="flex:1;overflow:hidden;">';
                h += '<div style="color:#fff;font-size:11px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + node.name + '</div>';
                h += '<div style="color:#888;font-size:9px;">#' + node.id + (node.isBoss ? ' БОСС' : '') + '</div>';
                h += '</div>';
                
                // Кубки
                h += '<div style="display:flex;gap:2px;flex-shrink:0;">';
                for (var k = 1; k <= 3; k++) {
                    h += '<div style="width:6px;height:6px;border-radius:50%;border:1px solid ' + (cups >= k ? '#ffd700' : '#444') + ';background:' + (cups >= k ? '#ffd700' : 'transparent') + ';"></div>';
                }
                h += '</div>';
                
                h += '</div>';
            }
            h += '</div>';
        }

        h += '</div>';

        UI._screenLayer.innerHTML = '';
        var bgStyle = 'background-image:url(\'' + (UI._bg.quests || '') + '\');background-size:cover;background-position:center;background-repeat:no-repeat;';
        
        UI._screenLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;' + bgStyle + 'display:flex;flex-direction:column;overflow:hidden;z-index:100;';
        UI._screenLayer.innerHTML = 
            '<div style="position:absolute;top:0;left:0;right:0;height:50px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(0,0,0,0.9),transparent);z-index:10;">' +
                '<button onclick="UI.loadHome()" style="position:absolute;left:10px;top:10px;background:transparent;border:none;color:#e0c080;font-size:18px;cursor:pointer;">←</button>' +
                '<span style="color:#e0c080;font-size:16px;font-weight:bold;">🌲 Шервудская чащоба</span>' +
            '</div>' +
            '<div style="flex:1;overflow-y:auto;padding:60px 10px 20px;display:flex;justify-content:center;-webkit-overflow-scrolling:touch;">' + h + '</div>';
        
        UI._screenLayer.style.display = 'block';
    },
