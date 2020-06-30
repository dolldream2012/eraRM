/*
創立角色以角色模版為主，預設角色只需要填寫替換資料即可
※預設資料如果空白，表示為不明
*/

// 模板
const model = {
	name: "",	// 角色名稱
	age: "",	// 外表年齡(以人類的審美標準為基礎)
	age_t: "",	// 真實年齡(留白表示真實年齡與外表年齡相同)
	gender: "",	// 性別(0: 多性, 1:無性, 2:女性, 3:男性)
	race: 5990,	// 種族
	race_m: 0,	// 種族(混血)
	race_r:	60,	// 主要種族權重
	soul: [0],	// 靈魂(非 0 表示其他角色靈魂)
	hight: 160,	// 身高
	weight: 50,	// 體重
	b: 60,		// 胸圍
	w: 60,		// 腰圍
	h: 60,		// 臀圍
	hp: 100,	// 生命
	sp: 100,	// 耐力
	mp: 100,	// 魔力
	str: 5,		// 力量
	vit: 5,		// 體力
	agi: 5,		// 速度
	dex: 5,		// 靈巧
	int: 5,		// 智力
	sen: 5,		// 感知
	fri: 5,		// 魅力
	luc: 5,		// 幸運
	alias: [],	// 稱號
	guild: [],	// 組織
	feature: [],	// 特質
	status: [],	// 身份
	job: [],	// 職業
	skill: { 0: 1, },	// 技能
	equip: {},	// 裝備
	item: {},	// 物品
};

module.exports = {
	// 角色模版
	0: Object.assign({}, model),
	// 緹亞
	1: Object.assign({}, model, {
		name: "緹亞",
		gender: 2,
		age: 10,
		age_t: "不明",
		race_m: 3001,
		race: 5990,
		skill: { 2: 1 },	// 技能
	}),
}