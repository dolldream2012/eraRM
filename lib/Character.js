global.util = require('../lib/Util.js');	// test
global.char_data = require('../data/character_data.js');

const util = global.util;
const char_data = global.char_data;

const char_name = require('../data/character_name.js');
const skill_data = require('../data/skill_data.js');
const race_data = require('../data/race_data.js');

let char_list = new Array();	// 角色列表

module.exports = {
	// 取得角色列表
	getCharList: function () {
		console.table(char_list);
	},

	// 製作新角色
	newChar: function (char_no, data) {
		let char = char_data.getData(char_no);

		for (let key in data) {	// 覆蓋角色資料
			if (key == "skill") {	// 技能
				// 技能整合
				char.skill = char.skill.concat(data.skill);
			} else {
				char[key] = data[key];
			}
		}

		// 補充、修正角色資料
		if (true) {
			// 種族
			char.race = char.race.filter(function (race_id) {	// 移除不存在之種族
				return race_data.contains(race_id);
			});
			if (char.race.length == 0) {	// 無種族時從隨機種族列表中挑選
				let base_race_list = race_data.getBaseData();
				let race_1 = util.getRandomListValue(base_race_list);
				char.race.push(race_1);

				if (Math.random() * 10 < 1) {
					let race_2 = util.getRandomListValue(base_race_list);
					if (race_1 != race_2) char.race.push(race_2);
				}
			}
			// 移除無繁衍能力之種族的混血種族
			if (race_data.getData(char.race[0], "gender")[1] == 100) {
				char.race.length = 1;
			} else {
				char.race = char.race.filter(function (race_id) {
					return race_data.getData(race_id, "gender")[1] != 100;
				});
			}

			// 重置種族權重(只計算主要種族及混血種族1)
			if (char.race.length < 2) {
				char.race_r = 100;
			} else {
				let rate = char.race_r;

				if (rate == 0 || rate == 100) {
				} else {
					let race_r = race_data.getData(char.race[0], "rate");	// 主要種族權重
					let race_mr = race_data.getData(char.race[1], "rate");	// 混血種族權重

					if (race_mr == 0) {
						rate = race_r;
					} else if (race_r == 0) {
						rate = race_mr;
					} else {
						let r = race_r * rate / 100;	// 主要種族加權
						let mr = race_mr * (1 - rate / 100);	// 混血種族加權

						rate = Math.round(r / (r + mr) * 100);
					}
				}

				if (rate < 0) rate = 0;
				if (rate > 100) rate = 100;

				char.race_r = rate;
			}

			// 決定角色性別
			if (char.gender === "" || race_data.getData(char.race[0])["gender"][char.gender] == 0) {	// 未指定性別 / 該種族無指定指性別
				if (char.race.length > 1) {
					char.gender = util.getRandomWeightedValue(race_data.getData(char.race[0], "gender"), race_data.getData(char.race[1], "gender"), char.race_r);
				} else {
					char.gender = util.getRandomWeightedValue(race_data.getData(char.race[0], "gender"));
				}
			}

			// 決定角色名字
			if (char.name == "") {	// 角色名字以填寫的主要種族為優先
				char.name = util.getRandomData(char_name.getData(char.gender, ...char.race));
			}

			// 隨機生成技能
			if (char.random_skill) {
				delete char.random_skill;
				let base_skill_list = skill_data.getBaseData();

				for (let skill_group of base_skill_list) {
					if (skill_data.chkEnableSkill(char, null, skill_group.flag)) {	// 符合起始技能獲取條件
						let skill_no = util.getRandomListValue(skill_group.skill_rate);

						if (skill_no != "") {
							if (skill_data.chkEnableSkill(char, skill_no)) char.skill.push(skill_no);	// 符合技能獲取條件
						}
					}
				}

				if (char.race.length > 1) this.getRaceRandomSkill(char, 1, 100 - char.race_r);	// 取得混血種族1隨機技能
				this.getRaceRandomSkill(char, 0, char.race_r);	// 取得主要種族隨機技能
			}

			// 技能初始化
			let skill_list = char.skill;
			char.skill = new Object();
			for (let skill_no of skill_list) char.skill[skill_no] = skill_data.initSkill(skill_no);

			// 技能升級、消除衝突技能
			skill_data.upgSkill(char);
		}

		if (true) {	// 未完成
			// 取得影響角色素質技能
			let talent_skill_data = new Object();
			for (let skill_id in char.skill) {
				if (skill_data.getData(skill_id, "action").includes(10)) {
					if (skill_data.getData(skill_id, "effect")["char"]) talent_skill_data[skill_id] = skill_data.getData(skill_id, "effect")["char"];
				}
			}

			// console.table(talent_skill_data);

			// 決定角色真實年齡
			if (char.age == -1 || char.age_t == -1) {
				// 取得種族壽命
				let lifespan = this.getRaceValue(char, "lifespan");

				// 計算真實年齡
				if (char.age_t == -1) {
					let age = char.age;	// 取得基礎年齡(以外表年齡為基準推算種族加權年齡)
					if (age < 0) age = Math.floor(Math.random() * 30) + 10;	// 隨機取得角色外表年齡

					age = skill_data.setStatusByTalent(char, talent_skill_data, age, "age_inside");	// 依角色心理、生理狀態(age_inside)調整角色外表年齡
					age = age * lifespan / race_data.getData(0, "lifespan");	// 計算種族加權(以外表年齡和種族壽命計算出真實年齡)
					age = skill_data.setStatusByTalent(char, talent_skill_data, age, "age_exp");	// 以角色經歷(age_exp)調整角色真實年齡

					char.age_t = Math.round(age);
				}

				// 決定角色外表年齡
				if (char.age == -1) {
					let age = char.age_t;

					age = age * race_data.getData(0, "lifespan") / lifespan;	// 以真實年齡和種族壽命計算並重置外表年齡
					age = skill_data.setStatusByTalent(char, talent_skill_data, age, "age_outside");	// 以角色外貌(age_outside)調整角色外表年齡

					char.age = Math.round(age);
				}
			}

			// 決定角色身高體重三圍
			if (char.height == -1 || char.weight == -1 || char.body_b == -1 || char.body_w == -1 || char.body_h == -1) {
				let height, weight, body_b, body_b_u, body_w, body_h;

				// 以外表年齡決定角色基礎身高體重
				let tmp_gender = (char.gender == "3") ? "male" : "female";	// 男性以外性別以女性素質為基礎
				height = char_data.getBaseBodyData("height", tmp_gender, char.age);
				weight = char_data.getBaseBodyData("weight", tmp_gender, char.age);

				// 依據屬性調整身高體重
				height = skill_data.setStatusByTalent(char, talent_skill_data, height, "height");
				weight = skill_data.setStatusByTalent(char, talent_skill_data, weight, "weight");

				// 依據種族平均值調整身高體重
				let race_height = this.getRaceValue(char, "height");
				let race_weight = this.getRaceValue(char, "weight");
				height = height * race_height / race_data.getData(0, "height");
				weight = weight * race_weight / race_data.getData(0, "weight");

				// 以身高決定基礎三圍
				if (char.gender == "3") {
					body_b = height * 0.5176;
					body_b_u = height * 0.5176;
					body_w = height * 0.4279;
					body_h = height * 0.5207;
				} else {
					body_b = height * 0.5235;
					body_b_u = height * 0.4310;
					body_w = height * 0.4134;
					body_h = height * 0.5778;
				}

				// 依據屬性調整三圍
				body_b = skill_data.setStatusByTalent(char, talent_skill_data, body_b, "body_b");
				body_b_u = skill_data.setStatusByTalent(char, talent_skill_data, body_b_u, "body_b_u");
				body_w = skill_data.setStatusByTalent(char, talent_skill_data, body_w, "body_w");
				body_h = skill_data.setStatusByTalent(char, talent_skill_data, body_h, "body_h");

				if (char.height == -1) char.height = Math.round(height * 10 + 0.1) / 10;
				if (char.weight == -1) char.weight = Math.round(weight * 10 + 0.1) / 10;
				if (char.body_b == -1) char.body_b = Math.round(body_b * 10 + 0.1) / 10;
				if (char.body_b_u == -1) char.body_b_u = Math.round(body_b_u * 10 + 0.1) / 10;
				if (char.body_w == -1) char.body_w = Math.round(body_w * 10 + 0.1) / 10;
				if (char.body_h == -1) char.body_h = Math.round(body_h * 10 + 0.1) / 10;
			}

			// 技能升級、消除衝突技能
			skill_data.upgSkill(char);
		}

		return char_list.push(char) - 1;
	},


	// 取得種族隨機技能(由於會先移除指定群組技能，因此優先級更高的種族需推遲處理順序)
	getRaceRandomSkill: function (char, race_index, race_r) {
		let base_race_skill_list = race_data.getData(char.race[race_index], "skill");
		for (let skill_group of base_race_skill_list) {
			let remove_skill_id = null;

			if (Object.keys(char.skill) > 0) {
				if (group_f = skill_group["group_f"]) {	// 判斷種族技能前，先移除指定群組技能以避免影響判斷
					for (let key in char.skill) {
						let skill_id = char.skill[key];

						if (skill_data.getData(skill_id, "group_f").split("|").includes(group_f)) {
							remove_skill_id = skill_id;
							char.skill.splice(key, 1);
						}
					}
				}
			}

			if (skill_data.chkEnableSkill(char, null, skill_group.flag)) {	// 符合起始技能獲取條件
				let skill_no = util.getRandomListValue(skill_group.skill_rate, race_r);	// 隨機取得技能

				if (skill_no != "") {
					if (skill_data.chkEnableSkill(char, skill_no)) char.skill.push(skill_no);	// 符合技能獲取條件
				}
			}

			if (remove_skill_id != null && skill_data.chkEnableSkill(char, remove_skill_id)) char.skill.push(remove_skill_id);	// 回填移除技能
		}
	},

	// 取得種族屬性
	getRaceValue: function (char, item) {
		let value = race_data.getData(char.race[0], item);
		if (char.race.length > 1) value = (value * char.race_r + race_data.getData(char.race[1], item) * (100 - char.race_r)) / 100;
		return value;
	},

	// 顯示資料: 資料, 項目, 顯示隱藏資料
	tranCharData: function (char, item, showHidden) {
		let str = "";

		if (item == "gender") {	// 性別
			let gender_list = ["扶他", "無", "女性", "男性"];

			str = gender_list[char.gender];
		} else if (item == "age" && showHidden) {	// 年齡
			str = char.age;
			if (Math.abs(char.age - char.age_t) > 5) str += " (真實年齡 : " + char.age_t + ")";
		} else if (item == "race") {	// 種族
			let race = char.race[0];	// 主要種族
			let race_m = char.race[1];	// 混血種族1

			if (race_m == null) {	// 無混血
				str = race_data.getData(race, "name");
			} else {
				if (char.race_r > 80) {	// 主要種族權重壓過混血種族
					str = race_data.getData(race, "name");
				} else {
					let race_sub = (char.race_r >= 50) ? race : race_m;
					let race_sub_2 = (char.race_r >= 50) ? race_m : race;

					if (race_data.getData(race_sub, "rate") >= 70 || race_data.getData(race_sub_2, "rate") >= 70) {
						let tmp_race_sub = (race_data.getData(race_sub, "rate") >= 70) ? race_sub : race_sub_2;

						str += "半";
						let tmp_race = Math.floor(tmp_race_sub / 10) * 10;	// 顯示混血特徵時僅顯示種族，不顯示亞種
						str += race_data.getData((race_data.contains(tmp_race)) ? tmp_race : tmp_race_sub, "name");
					} else {	// 權重較低(特徵不明顯的種族)不會被視為混血
						str = race_data.getData(race_sub, "name");
					}
				}
			}
		} else if (item == "feature" || item == "personality" || item == "experience" || item == "talent" || item == "skill") {	// 特徵, 個性, 經歷, 能力, 技能
			let type_list = { "feature": [0], "personality": [9], "experience": [8], "talent": [1], "skill": [2, 3] };
			let skill_list = skill_data.getListByTypeFromList(char.skill, ...type_list[item]);

			if (skill_list.length > 0) {
				for (let skill_no of skill_list) {

					str += "[";
					str += skill_data.getData(skill_no, "name");
					if (item == "talent" || item == "skill") {
						let max_lv = skill_data.getData(skill_no, "max_lv");
						if (max_lv != 1) str += "Lv" + ((char.skill[skill_no].lv == max_lv) ? "Max" : char.skill[skill_no].lv);
					}
					str += "]";
				}
			} else {
				str = "無";
			}
		} else if (item == "body") {
			str += "B " + char.body_b;

			// 非男性 計算罩杯
			if (char.gender != "3") {
				let bust_value = Math.round((char.body_b - char.body_b_u) / 2.5);
				str += "("
				if (bust_value == 0) str += "-";
				else if (bust_value == 1) str += "AAA";
				else if (bust_value == 2) str += "AA";
				else if (bust_value >= 30) str += "Z";
				else str += String.fromCharCode(61 + bust_value);
				str += ")";
			}

			str += " W " + char.body_w;
			str += " H " + char.body_h;
		} else {
			str = char[item];
		}

		if (str == "" || typeof str == "undefined") {
			str = "不明";
		}

		return str;
	},

	// 顯示角色資料
	disCharData: function (id) {
		let char = char_list[id];

		util.log("姓名 : " + this.tranCharData(char, "name"));
		util.log("種族 : " + this.tranCharData(char, "race"));
		util.log("性別 : " + this.tranCharData(char, "gender"));
		util.log("年齡 : " + this.tranCharData(char, "age", true));
		util.log("身高 : " + this.tranCharData(char, "height") + " cm");
		util.log("體重 : " + this.tranCharData(char, "weight") + " kg");
		if (char.gender != "3") util.log("三圍 : " + this.tranCharData(char, "body"));
		util.log("特徵 : " + this.tranCharData(char, "feature"));
		util.log("個性 : " + this.tranCharData(char, "personality"));
		util.log("經歷 : " + this.tranCharData(char, "experience"));
		util.log("能力 : " + this.tranCharData(char, "talent"));
		util.log("技能 : " + this.tranCharData(char, "skill"));
	},
}

// test
let data = {
	random_skill: false,
	// race: [5990],
	skill: [0],
}

let char_id = module.exports.newChar(0, data);
// let char_id = module.exports.newChar(1);
console.log();
// console.log(char_list[char_id]);
module.exports.disCharData(char_id);
process.exit();