/**
 * Sherwood Chat — Мировой чат
 */

Sherwood.Chat = {
    _messages: [],
    _maxMessages: 100,
    _connected: false,
    _socket: null,
    _username: '',

    init: function() {
        const player = Sherwood.getPlayer();
        this._username = player.name || 'Охотник';
        this._loadMessages();
        
        // Заглушка — локальный чат
        this._connected = true;
        this._addSystemMessage('Добро пожаловать в чат Шервуда!');
    },

    _loadMessages: function() {
        const saved = localStorage.getItem('sherwood_chat_messages');
        if (saved) {
            try {
                this._messages = JSON.parse(saved);
                if (this._messages.length > this._maxMessages) {
                    this._messages = this._messages.slice(-this._maxMessages);
                }
            } catch(e) {
                this._messages = [];
            }
        }
    },

    _saveMessages: function() {
        localStorage.setItem('sherwood_chat_messages', JSON.stringify(this._messages.slice(-this._maxMessages)));
    },

    _addSystemMessage: function(text) {
        this._messages.push({
            id: Date.now(),
            sender: 'Система',
            text: text,
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            isSystem: true
        });
        if (this._messages.length > this._maxMessages) {
            this._messages = this._messages.slice(-this._maxMessages);
        }
        this._saveMessages();
    },

    sendMessage: function(text) {
        if (!text || !text.trim()) return { success: false, reason: 'Пустое сообщение' };
        
        const msg = {
            id: Date.now(),
            sender: this._username,
            text: text.trim(),
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            isSystem: false
        };
        
        this._messages.push(msg);
        if (this._messages.length > this._maxMessages) {
            this._messages = this._messages.slice(-this._maxMessages);
        }
        this._saveMessages();
        
        return { success: true, message: msg };
    },

    getMessages: function() {
        return this._messages;
    },

    getRecentMessages: function(count) {
        count = count || 50;
        return this._messages.slice(-count);
    },

    setUsername: function(name) {
        if (name && name.trim()) {
            this._username = name.trim();
            const player = Sherwood.getPlayer();
            player.name = this._username;
            Sherwood.saveGame();
        }
    },

    getUsername: function() {
        return this._username;
    },

    isConnected: function() {
        return this._connected;
    }
};
