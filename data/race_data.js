/*
編號規則:
	千位數為屬性
	十位數為種族
	個位數為亞種
*/

// 模版
const model = {
	"name": ""	// 種族名稱
	, "rate": 0	// 種族權重(越高越容易影響特徵)
	, "gender": [1, 1, 49, 49]	// 種族性別比例(0: 多性, 1:無性, 2:女性, 3:男性)
	, "lifespan": 100	// 種族壽命
	, "skill": []	// 起始技能獲取條件及獲得機率列表(空白列表表示不獲取技能的機率)(group_f 為判斷種族獲得技能機率前，需先清空的技能群組)
};

// 種族列表
const race_data = {
	// 0 ~ 999 古族
	"0": Object.assign({}, model, { "name": "古族", "gender": [0, 100, 0, 0] }),
	"990": Object.assign({}, model, { "name": "威爾德", "rate": 20, "gender": [10, 10, 40, 40] }),
	// 1000 ~ 1999 風神眷族
	"2000": Object.assign({}, model, { "name": "哈比", "rate": 100 }),
	// 2000 ~ 2999 水神眷族
	// 3000 ~ 3999 火神眷族
	"3000": Object.assign({}, model, {
		"name": "精靈"
		, "rate": 100
		, "lifespan": 1500
		, "skill": [
			{ "group_f": "height", skill_rate: { 60: [0], 40: [] } },	// 身高
			{ "group_f": "weight", skill_rate: { 70: [2], 30: [] } },	// 體重
			{ "flag": { "gender": "==2" }, skill_rate: { 80: [2031], 20: [] } },	// 女性 下體
		]
	}),
	"3001": Object.assign({}, model, {
		"name": "黑精靈"
		, "rate": 95
		, "lifespan": 1500
		, "skill": [
			{ "group_f": "height", skill_rate: { 60: [0], 40: [] } },	// 身高
			{ "group_f": "weight", skill_rate: { 70: [2], 30: [] } },	// 體重
			{ "flag": { "gender": "==2" }, skill_rate: { 80: [2031], 20: [] } },	// 女性 下體
		]
	}),
	// 4000 ~ 4999 地神眷族
	"4000": Object.assign({}, model, { "name": "矮人", "rate": 100 }),
	// 5000 ~ 5999 獸神眷族
	"5990": Object.assign({}, model, { "name": "人類", "rate": 40 }),
	"5991": Object.assign({}, model, { "name": "異人", "rate": 40 }),
	"5992": Object.assign({}, model, { "name": "耶畢特人", "rate": 40 }),
	// 6000 ~ 6999 魔物
	"6800": Object.assign({}, model, { "name": "不死系魔物" }),
};

// 隨機種族及權重列表
const base_race_data = {	// 權重: [種族1, 種族2, ...]
	5: [2000, 3000, 3001],
	20: [4000, 5991],
	40: [5990],
}

module.exports = {
	// 回傳種族資料
	getData: function (race_no, item) {
		if (item == null) {
			return JSON.parse(JSON.stringify(race_data[race_no]));
		} else {
			return race_data[race_no][item];
		}
	},

	// 確認是否為有效的種族編號
	contains: function (race_no) {
		return (race_data[race_no]);
	},

	// 取得起始種族列表
	getBaseData: function () {
		return base_race_data;
	},
}