const util = global.util;

module.exports = {
	// 初始化
	init: function () {
		util.pl();
		util.log("eraRM 0.0.01");
		util.pl();
		util.log("[0] 舊的故事");
		util.log("[1] 新的冒險");

		util.getCode(this.exeCode);
	},

	// 執行指令
	exeCode: function (code) {
		if (code == "0") {
			util.pl();
			// TO-DO 建立魔王 角色編號0
			// 開始遊戲
		} else if (code == "1") {
			util.pl();
			// 呼叫讀檔介面
		} else {
			util.getCode(this.exeCode);
		}
	}
}