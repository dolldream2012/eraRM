/*
判斷可否學習邏輯: 先挑選可學習種族，再剔除無法學習種族
*/

// 模版
const model = {
	name: "",	// 技能名稱
	type: "",	// 類型(0:被動, 1:攻擊, 2:輔助)
	max_lv: 1,	// 技能等級上限
	up_list: [],	// 上位技能
	race: [],	// 可學習種族
	race_f: [],	// 無法學習種族
	flag: {},	// 獲得條件
	cost: {},	// 消耗
	effect: {},	// 效果
}

module.exports = {
	// 再生: 每回合恢復HP 10 ~ 100
	0: Object.assign({}, model, { name: "再生", max_lv: 10, up_list: [1, 2] }),
	// 高速再生: 每回合恢復HP 6% ~ 15%／再生(0) lv6、HP > 1000
	1: Object.assign({}, model, { name: "高速再生", max_lv: 10, up_list: [2], flag: { "skill_0": ">5", "hp": ">1000" } }),
	// 超速再生: 每回合恢復HP 16% ~ 20% 或恢復HP 至 20 ~ 50%／高速再生(1) lv6／限定不死系魔物可學習
	2: Object.assign({}, model, { name: "超速再生", max_lv: 5, race: [6800], flag: { "skill_1": ">5" } }),
}