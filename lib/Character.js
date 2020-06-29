// const util = global.util;
const util = require('../lib/Util.js');	// test

const character_data = require('../data/character_data.js');
const skill_data = require('../data/skill_data.js');

var char_list = new Array();	// 角色列表
var gender_list = ["扶他", "無", "女性", "男性"];

module.exports = {
	// 取得角色列表
	getCharList: function () {
		console.table(char_list);
	},

	// 製作新角色
	newChar: function (char_no, data) {
		// 建立角色
		var char = Object.assign(character_data["char_0"], character_data["char_" + char_no] || {});

		// 加入指定角色設定
		if (default_char = character_data["char_" + char_no]) {
			for (var key in default_char) char[key] = default_char[key];
		}

		for (var key in data) {	// 覆蓋角色資料
			if (key == "skill") {
				char[key] = this.chkSkill(char[key], data[key]);
			} else {
				char[key] = data[key];
			}
		}

		return char_list.push(char) - 1;
	},

	// 合併技能
	chkSkill: function () {
		var skill_list = null;

		// 合併技能資料
		for (var data of arguments) {
			if (skill_list == null) {
				var skill_list = data;
			} else {
				for (var key in data) {
					if (skill_list[key]) {
						skill_list[key] = Math.max(skill_list[key], data[key]);	// 相同技能取等級較高者
					} else {
						skill_list[key] = data[key];
					}
				}
			}
		}

		// 移除下位技能
		// for (var key in skill_list) {
		// 	for (var skill_id of skill_data[key]["up_list"]) {
		// 		if (skill_list[skill_id]) delete skill_list[key];
		// 	}
		// }

		return skill_list;
	},

	// 顯示角色資料
	disCharData: function (id) {
		var char = char_list[id];

		util.log("姓名 : " + char.name);
		// util.log("種族 : " + race_data[char.race].name);
		util.log("性別 : " + gender_list[char.gender]);
	},
}

var data = {
	"skill": {
		1: 1,
	}
}

var char_id = module.exports.newChar(1, data);
module.exports.disCharData(char_id);