/**
 * Server Handler: Tour Command
 */

'use strict';

const Path = require('path');
const Text = Tools('text');
const check = Tools('check');
const Template = Tools('html-template');

const mainTemplate = new Template(Path.resolve(__dirname, 'template.html'));

exports.setup = function (App) {
	const Config = App.config.modules.tourcmd;

	/* Permissions */
	App.server.setPermission('tourcmd', 'Permission for changing the tour command configuration');

	/* Menu Options */
	App.server.setMenuOption('tourcmd', 'Tour&nbsp;Command', '/tourcmd/', 'tourcmd', -1);

	/* Handlers */
	App.server.setHandler('tourcmd', (context, parts) => {
		if (!context.user || !context.user.can('tourcmd')) {
			context.endWith403();
			return;
		}

		let ok = null, error = null;
		if (context.post.edit) {
			let format = Text.toId(context.post.format);
			let type = Text.toId(context.post.type);
			let users = parseInt(context.post.users);
			let time = parseInt(context.post.time);
			let autodq = parseFloat(context.post.autodq);
			let scout = Text.toId(context.post.scout);
			let msg = (context.post.creationmsg || "").trim();
			let aliases = (context.post.aliases || "").split('\n');

			try {
				check(format, "Invalid format.");
				check(type in {'elimination': 1, 'roundrobin': 1}, "Invalid tournament type.");
				check(!isNaN(users) && users >= 0, "Invalid users limit.");
				check(!isNaN(time) && time >= 0, "Invalid signups time.");
				check(!isNaN(autodq) && autodq >= 0, "Invalid autodq time.");
				check(scout in {'yes': 1, 'no': 1}, "Invalid scout mode.");
				check(msg.length <= 300, "Messages cannot be longer than 300 characters.");
			} catch (err) {
				error = err.message;
			}

			if (!error) {
				Config.format = format;
				Config.type = type;
				Config.maxUsers = users;
				Config.time = time * 1000;
				Config.autodq = autodq;
				Config.scoutProtect = (scout === 'no');
				Config.createMessage = msg;
				let aux = {};
				for (let i = 0; i < aliases.length; i++) {
					let spl = aliases[i].split(',');
					let id = Text.toId(spl[0]);
					let id2 = Text.toId(spl[1]);
					if (id && id2) {
						aux[id] = id2;
					}
				}
				Config.aliases = aux;
				App.db.write();
				App.logServerAction(context.user.id, "Changed tour cmd configuration");
				ok = "Tournament command configuration saved.";
			}
		}

		let htmlVars = {};

		htmlVars.format = Config.format;
		htmlVars.elimination = (Config.type === 'elimination' ? ' selected="selected"' : '');
		htmlVars.roundrobin = (Config.type === 'roundrobin' ? ' selected="selected"' : '');
		htmlVars.users = Config.maxUsers;
		htmlVars.time = Math.floor(Config.time / 1000);
		htmlVars.autodq = Config.autodq;
		htmlVars.scout_yes = (!Config.scoutProtect ? 'selected="selected"' : '');
		htmlVars.scout_no = (Config.scoutProtect ? 'selected="selected"' : '');
		htmlVars.creationmsg = Config.createMessage;

		let aliases = [];
		for (let format in Config.aliases) {
			aliases.push(format + ', ' + Config.aliases[format]);
		}
		htmlVars.aliases = aliases.join('\n');

		htmlVars.request_result = (ok ? 'ok-msg' : (error ? 'error-msg' : ''));
		htmlVars.request_msg = (ok ? ok : (error || ""));

		context.endWithWebPage(mainTemplate.make(htmlVars), {title: "Tour Command - Showdown ChatBot"});
	});
};
