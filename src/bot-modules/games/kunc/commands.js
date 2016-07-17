/**
 * Commands File
 */

'use strict';

const Path = require('path');
const Translator = Tools.get('translate.js');
const Text = Tools.get('text.js');

const Kunc = require(Path.resolve(__dirname, 'kunc.js'));
const translator = new Translator(Path.resolve(__dirname, 'commands.translations'));
const trigger = require(Path.resolve(__dirname, 'cmd-trigger.js'));

module.exports = {
	kunc: function () {
		if (!this.can('games')) return this.replyAccessDenied('games');
		if (!this.arg) {
			return this.errorReply(this.usage({desc: 'games'}, {desc: 'max points', optional: true},
				{desc: 'seconds to answer', optional: true}));
		}
		let args = this.args;
		if (this.getRoomType(this.room) !== 'chat') return this.errorReply(translator.get('nochat', this.lang));
		let games = parseInt(args[0]);
		if (Text.toId(args[0]) === 'inf' || Text.toId(args[0]) === 'infinite') {
			games = 0;
		}
		let points = parseInt(args[1] || "0");
		if (Text.toId(args[1]) === 'inf' || Text.toId(args[1]) === 'infinite') {
			points = 0;
		}
		let ansTime = parseInt(args[2] || "30");
		if (isNaN(ansTime) || ansTime < 10 || ansTime > 300) {
			return this.errorReply(translator.get(0, this.lang));
		}
		if (games < 0 || points < 0) {
			return this.errorReply(this.usage({desc: 'games'}, {desc: 'max points', optional: true},
				{desc: 'seconds to answer', optional: true}));
		}
		let kunc = new Kunc(this.room, games, points, ansTime * 1000);
		if (!App.modules.games.system.createGame(this.room, kunc, trigger)) {
			return this.errorReply(translator.get(1, this.lang));
		}
	},
};