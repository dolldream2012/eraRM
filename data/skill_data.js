/*
name: 技能名稱
max_lv: 技能等級上限
up_list: 上位技能
race: 可學習種族
race_f: 無法學習種族
flag: 獲得條件
※判斷可否學習邏輯: 先挑選可學習種族，再剔除無法學習種族
*/
module.exports = {
	// 再生: 每回合恢復HP 10 ~ 100
	0: { name: "再生", max_lv: 10, up_list: [1, 2], race: [], race_f: [], flag: {} },
	// 高速再生: 每回合恢復HP 6% ~ 15%／再生(0) lv6、HP > 1000
	1: { name: "高速再生", max_lv: 10, up_list: [2], race: [], race_f: [], flag: { "skill_0":">5", "hp":">1000"} },
	// 超速再生: 每回合恢復HP 16% ~ 20% 或恢復HP 至 20 ~ 50%／高速再生(1) lv6／限定不死系魔物、鳳凰可學習
	2: { name: "超速再生", max_lv: 5, up_list: [], race: [], race_f: [] },
}