import { zhCN } from "./zh-CN";

const translations = zhCN as Readonly<Record<string, string>>;
const translatedAttributes = [
	"alt",
	"aria-label",
	"placeholder",
	"title",
] as const;

const dynamicTranslations: ReadonlyArray<readonly [RegExp, string]> = [
	[/^Error\n(.+)$/s, "错误\n$1"],
	[/^Current version: v(.+)$/, "当前版本：v$1"],
	[/^Recovery failed:\s*(.+)$/, "恢复失败：$1"],
	[/^Added "(.+)"$/, "已添加“$1”"],
	[/^Saved settings to "(.+)"$/, "设置已保存到“$1”"],
	[/^Captions saved as (.+)$/, "字幕已保存为 $1"],
	[/^(.+) clips imported$/, "已导入 $1 个片段"],
	[/^Video exported to clipboard$/, "视频已导出到剪贴板"],
	[/^Video exported to file$/, "视频已导出到文件"],
	[/^Screenshot exported to clipboard$/, "截图已导出到剪贴板"],
	[/^Screenshot exported to file$/, "截图已导出到文件"],
	[/^Failed to add clip:\s*(.+)$/, "添加片段失败：$1"],
	[/^Failed to import clip:\s*(.+)$/, "导入片段失败：$1"],
	[/^Failed to generate captions:\s*(.+)$/, "生成字幕失败：$1"],
	[/^Failed to start recording:\s*(.+)$/, "开始录制失败：$1"],
	[/^Failed to stop recording:\s*(.+)$/, "停止录制失败：$1"],
	[/^Failed to take screenshot:\s*(.+)$/, "截图失败：$1"],
	[
		/^Version (.+) of Cap is available, would you like to install it\?$/,
		"Cap $1 版可用，是否安装？",
	],
	[
		/^Are you sure you want to change the server URL to '(.+)'\? You will need to sign in again\.$/,
		"确定要将服务器地址更改为“$1”吗？你需要重新登录。",
	],
	[
		/^Move your (.+) to the new location\? Recordings stay in your library either way\.$/,
		"要将你的$1移动到新位置吗？无论选择哪种方式，录制都会保留在资料库中。",
	],
	[/^Moving (.+)…$/, "正在移动 $1……"],
	[/^Minimum size is\s*(.+)$/, "最小尺寸为 $1"],
	[/^(.+) is too small$/, "$1 太小"],
	[/^Dropped:\s*(.+)$/, "已丢弃：$1"],
	[/^Remaining\s*(.+)$/, "剩余 $1"],
	[/^From\s*(.+)$/, "从 $1"],
	[/^To\s*(.+)$/, "到 $1"],
	[/^(.+) clips?$/, "$1 个片段"],
	[/^(.+) frames?$/, "$1 帧"],
	[/^(.+) recordings?$/, "$1 个录制"],
	[/^(.+) screenshots?$/, "$1 张截图"],
];

export function translateDesktopText(value: string) {
	const direct = translations[value];
	if (direct) return direct;

	for (const [pattern, replacement] of dynamicTranslations) {
		if (pattern.test(value)) return value.replace(pattern, replacement);
	}

	return value;
}

function translateTextNode(node: Text) {
	const value = node.data;
	const match = value.match(/^(\s*)(.*?)(\s*)$/s);
	if (!match || !match[2]) return;
	const translated = translateDesktopText(match[2]);
	if (translated !== match[2])
		node.data = `${match[1]}${translated}${match[3]}`;
}

function translateElement(element: Element) {
	for (const attribute of translatedAttributes) {
		const value = element.getAttribute(attribute);
		if (!value) continue;
		const translated = translateDesktopText(value);
		if (translated !== value) element.setAttribute(attribute, translated);
	}
}

function translateTree(root: Node) {
	if (root.nodeType === Node.TEXT_NODE) {
		translateTextNode(root as Text);
		return;
	}

	if (
		root.nodeType !== Node.ELEMENT_NODE &&
		root.nodeType !== Node.DOCUMENT_NODE
	)
		return;

	if (root.nodeType === Node.ELEMENT_NODE) translateElement(root as Element);
	const walker = document.createTreeWalker(
		root,
		NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
	);
	let node = walker.nextNode();
	while (node) {
		if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text);
		else translateElement(node as Element);
		node = walker.nextNode();
	}
}

export function startChineseDesktopLocalization() {
	document.documentElement.lang = "zh-CN";
	translateTree(document.documentElement);

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type === "characterData") {
				translateTextNode(mutation.target as Text);
				continue;
			}

			if (mutation.type === "attributes") {
				translateElement(mutation.target as Element);
				continue;
			}

			for (const node of mutation.addedNodes) translateTree(node);
		}
	});

	observer.observe(document.documentElement, {
		attributeFilter: [...translatedAttributes],
		attributes: true,
		characterData: true,
		childList: true,
		subtree: true,
	});

	return () => observer.disconnect();
}
