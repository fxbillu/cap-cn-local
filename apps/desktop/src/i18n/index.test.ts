import { describe, expect, it } from "vitest";

import { translateDesktopText } from "./index";

describe("desktop Chinese localization", () => {
	it("translates catalog messages", () => {
		expect(translateDesktopText("Start Recording")).toBe("开始录制");
		expect(translateDesktopText("Cap Server URL")).toBe("Cap 服务器地址");
	});

	it("translates messages containing runtime values", () => {
		expect(translateDesktopText('Added "Daily review"')).toBe(
			"已添加“Daily review”",
		);
		expect(
			translateDesktopText("Failed to take screenshot: access denied"),
		).toBe("截图失败：access denied");
	});

	it("preserves unknown content", () => {
		expect(translateDesktopText("recording-2026-08-09.cap")).toBe(
			"recording-2026-08-09.cap",
		);
	});
});
