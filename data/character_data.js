// const util = global.util;
const util = require('../lib/Util.js');	// test

/*
創立角色以角色模版為主，預設角色只需要填寫替換資料即可
※預設資料如果空白，表示為不明
*/

// 模板
const model = {
	"name": ""		// 角色名稱
	, "age": -1		// 外表年齡(以人類的審美標準為基礎)(預設年齡設為 -1，以供角色年齡設為 0 的判斷空間)
	, "age_t": -1	// 真實年齡(留白表示真實年齡與外表年齡相同)
	, "gender": ""	// 性別(0: 扶他, 1: 無性, 2: 女性, 3: 男性)
	, "race": []	// 種族([主要種族, 混血種族1, 混血種族2])
	, "race_r": 60	// 主要種族權重
	, "soul": [0]	// 靈魂(0 表示自身靈魂，如果陣列為空表示驅體目前不存在靈魂)
	, "height": -1	// 身高
	, "weight": -1	// 體重
	, "body_b": -1	// 胸圍
	, "body_w": -1	// 腰圍
	, "body_h": -1	// 臀圍
	, "lv": 1		// 等級
	, "gold": 0		// 持有金錢
	, "hp": 100		// 生命
	, "sp": 100		// 耐力
	, "mp": 100		// 魔力
	, "str": 5		// 力量
	, "vit": 5		// 體力
	, "agi": 5		// 速度
	, "dex": 5		// 靈巧
	, "int": 5		// 智力
	, "sen": 5		// 感知
	, "fri": 5		// 魅力
	, "luc": 5		// 幸運
	, "alias": []	// 稱號
	, "guild": []	// 組織
	, "status": []	// 身份
	, "job": []		// 職業
	, "equip": {}	// 裝備
	, "item": {}	// 物品
	, "skill": []	// 技能、天賦、個性
	// 角色資料僅能設定技能，技能等級預設為 1
	// 初始化完成後，資料型別會更改為 Object
	// 如果存在互斥技能，會互相抵消
	, "addict": []	// 喜好屬性
	, "favorite": []	// 喜好物品
	// , "random_skill": false	// 取得隨機技能
	// , "reset_feature": false	// 重置角色外貌
};

// 角色列表
const char_data = {
	// 角色模版
	"0": Object.assign({}, model, {
		"random_skill": true,
		"reset_feature": true,
	}),

	// 緹亞
	"1": Object.assign({}, model, {
		"name": "緹亞"
		, "gender": 2
		, "age": 10
		, "age_t": "不明"
		, "race": [3000, 5990, 6800]
		, "skill": [8, 43000]
	}),
};

// 身體基礎資料
// 身高體重來源 - 台灣衛生服利部統計處 - 居民體位及肥胖症狀-身高、體重、身體質量指數(2013-2016)
const base_body_data = {
	"male": {
		"height": { 0: { "avg": 70.3, "sd": 1.3 }, 1: { "avg": 80.2, "sd": 1.0 }, 2: { "avg": 92.0, "sd": 0.8 }, 3: { "avg": 101.6, "sd": 1.2 }, 4: { "avg": 105.6, "sd": 0.9 }, 5: { "avg": 113.9, "sd": 0.7 }, 6: { "avg": 118.2, "sd": 1.5 }, 7: { "avg": 125.5, "sd": 1.0 }, 8: { "avg": 130.7, "sd": 1.0 }, 9: { "avg": 138.4, "sd": 1.5 }, 10: { "avg": 142.5, "sd": 1.2 }, 11: { "avg": 148.8, "sd": 1.2 }, 12: { "avg": 154.6, "sd": 0.9 }, 13: { "avg": 162.9, "sd": 1.0 }, 14: { "avg": 166.7, "sd": 0.8 }, 15: { "avg": 169.7, "sd": 1.1 }, 16: { "avg": 169.2, "sd": 1.4 }, 17: { "avg": 171.1, "sd": 0.9 }, 18: { "avg": 173.3, "sd": 1.4 }, 19: { "avg": 171.6, "sd": 0.4 }, 45: { "avg": 166.6, "sd": 0.4 }, 65: { "avg": 163.1, "sd": 0.3 }, },
		"weight": { 0: { "avg": 8.5, "sd": 0.2 }, 1: { "avg": 11.1, "sd": 0.4 }, 2: { "avg": 14.1, "sd": 1.0 }, 3: { "avg": 15.6, "sd": 0.4 }, 4: { "avg": 17.4, "sd": 0.5 }, 5: { "avg": 20.4, "sd": 0.7 }, 6: { "avg": 21.9, "sd": 1.2 }, 7: { "avg": 27.5, "sd": 1.3 }, 8: { "avg": 29.4, "sd": 1.4 }, 9: { "avg": 36.6, "sd": 1.5 }, 10: { "avg": 40.4, "sd": 2.6 }, 11: { "avg": 44.6, "sd": 1.9 }, 12: { "avg": 50.1, "sd": 2.0 }, 13: { "avg": 54.0, "sd": 1.6 }, 14: { "avg": 56.0, "sd": 1.0 }, 15: { "avg": 61.9, "sd": 2.0 }, 16: { "avg": 57.1, "sd": 1.0 }, 17: { "avg": 65.1, "sd": 3.6 }, 18: { "avg": 67.1, "sd": 4.2 }, 19: { "avg": 72.3, "sd": 0.8 }, 45: { "avg": 69.4, "sd": 0.5 }, 65: { "avg": 66.0, "sd": 0.6 }, },
	},
	"female": {
		"height": { 0: { "avg": 70.3, "sd": 0.5 }, 1: { "avg": 81.5, "sd": 1.1 }, 2: { "avg": 91.4, "sd": 0.7 }, 3: { "avg": 96.8, "sd": 0.3 }, 4: { "avg": 104.4, "sd": 0.7 }, 5: { "avg": 112.4, "sd": 0.5 }, 6: { "avg": 119.4, "sd": 0.7 }, 7: { "avg": 124.6, "sd": 0.9 }, 8: { "avg": 131.7, "sd": 0.9 }, 9: { "avg": 135.5, "sd": 1.3 }, 10: { "avg": 142.4, "sd": 1.0 }, 11: { "avg": 149.5, "sd": 1.2 }, 12: { "avg": 155.2, "sd": 0.8 }, 13: { "avg": 156.9, "sd": 0.8 }, 14: { "avg": 158.6, "sd": 0.6 }, 15: { "avg": 160.5, "sd": 0.7 }, 16: { "avg": 158.5, "sd": 0.7 }, 17: { "avg": 157.5, "sd": 0.8 }, 18: { "avg": 160.7, "sd": 0.9 }, 19: { "avg": 159.4, "sd": 0.3 }, 45: { "avg": 155.6, "sd": 0.4 }, 65: { "avg": 150.9, "sd": 0.4 }, },
		"weight": { 0: { "avg": 7.5, "sd": 0.3 }, 1: { "avg": 11.2, "sd": 0.2 }, 2: { "avg": 13.2, "sd": 0.3 }, 3: { "avg": 14.6, "sd": 0.2 }, 4: { "avg": 17.2, "sd": 0.8 }, 5: { "avg": 19.5, "sd": 0.3 }, 6: { "avg": 21.7, "sd": 0.7 }, 7: { "avg": 25.1, "sd": 0.7 }, 8: { "avg": 30.0, "sd": 0.9 }, 9: { "avg": 30.1, "sd": 1.1 }, 10: { "avg": 36.3, "sd": 1.4 }, 11: { "avg": 44.4, "sd": 2.1 }, 12: { "avg": 51.8, "sd": 2.7 }, 13: { "avg": 52.4, "sd": 1.7 }, 14: { "avg": 49.8, "sd": 0.9 }, 15: { "avg": 52.4, "sd": 1.2 }, 16: { "avg": 52.3, "sd": 1.2 }, 17: { "avg": 55.0, "sd": 1.2 }, 18: { "avg": 62.6, "sd": 4.2 }, 19: { "avg": 58.4, "sd": 0.8 }, 45: { "avg": 58.1, "sd": 0.6 }, 65: { "avg": 56.2, "sd": 0.5 }, },
	},
}

module.exports = {
	getData: function (char_no) {
		return JSON.parse(JSON.stringify(char_data[char_no] || char_data[0]));	// 深拷貝以避免更動到原資料；如果查無角色資料，回傳角色模板
	},

	getBaseBodyData: function (item, gender, age) {
		let tmp_data_list = base_body_data[gender][item];

		// 如果沒有符合年齡的資料，則從下往上尋找最相近的資料
		let data_list;
		if (tmp_data_list[age]) {
			data_list = tmp_data_list[age];
		} else {
			let age_list = Object.keys(tmp_data_list).sort(function (a, b) { return b * 1 - a * 1; });

			for (let tmp_age of age_list) {
				if (age > tmp_age) {
					data_list = tmp_data_list[tmp_age];
					break;
				}
			}
		}

		let avg = data_list.avg * 1;
		let sd = data_list.sd * 1;

		let true_data_list = new Object();
		true_data_list[25] = [avg + sd * 0.32, avg - sd * 0.32];
		true_data_list[25] = [avg + sd * 0.67, avg - sd * 0.67];
		true_data_list[18] = [avg + sd * 0.99, avg - sd * 0.99];
		true_data_list[12] = [avg + sd * 1.28, avg - sd * 1.28];
		true_data_list[10] = [avg + sd * 1.64, avg - sd * 1.64];
		true_data_list[5] = [avg + sd * 1.96, avg - sd * 1.96];
		true_data_list[4] = [avg + sd * 2.58, avg - sd * 2.58];
		true_data_list[0.9] = [avg + sd * 3.29, avg - sd * 3.29];

		let random_value = util.getRandomListValue(true_data_list);
		random_value = Math.round(random_value * 10) / 10;

		return random_value;
	}
}