import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const desktopSource = path.resolve("apps/desktop/src");
const attributeNames = new Set([
	"alt",
	"aria-label",
	"description",
	"label",
	"placeholder",
	"text",
	"title",
]);
const messages = new Set();
const dialogFunctions = new Set(["ask", "confirm", "message"]);
const toastFunctions = new Set(["error", "loading", "success"]);

function addMessage(value) {
	const normalized = value.replace(/\s+/g, " ").trim();
	if (normalized.length > 1 && /[A-Za-z]/.test(normalized))
		messages.add(normalized);
}

function visitFile(filePath) {
	const sourceText = fs.readFileSync(filePath, "utf8");
	const sourceFile = ts.createSourceFile(
		filePath,
		sourceText,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);

	function visit(node) {
		if (ts.isJsxText(node)) addMessage(node.text);

		if (ts.isJsxAttribute(node) && attributeNames.has(node.name.text)) {
			if (node.initializer && ts.isStringLiteral(node.initializer)) {
				addMessage(node.initializer.text);
			}
			if (
				node.initializer &&
				ts.isJsxExpression(node.initializer) &&
				node.initializer.expression &&
				ts.isStringLiteralLike(node.initializer.expression)
			) {
				addMessage(node.initializer.expression.text);
			}
		}

		if (ts.isCallExpression(node)) {
			const callee = node.expression;
			const isDialogCall =
				(ts.isIdentifier(callee) && dialogFunctions.has(callee.text)) ||
				(ts.isPropertyAccessExpression(callee) &&
					dialogFunctions.has(callee.name.text));
			const isToastCall =
				ts.isPropertyAccessExpression(callee) &&
				callee.expression.getText(sourceFile) === "toast" &&
				toastFunctions.has(callee.name.text);

			if (isDialogCall || isToastCall) {
				function collectCallText(callNode) {
					if (ts.isStringLiteralLike(callNode)) addMessage(callNode.text);
					if (ts.isTemplateExpression(callNode)) {
						addMessage(callNode.head.text);
						for (const span of callNode.templateSpans) {
							addMessage(span.literal.text);
						}
					}
					ts.forEachChild(callNode, collectCallText);
				}

				if (node.arguments[0]) collectCallText(node.arguments[0]);
				if (isDialogCall && node.arguments[1])
					collectCallText(node.arguments[1]);
			}
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
}

function walk(directory) {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) walk(entryPath);
		else if (/\.(ts|tsx)$/.test(entry.name)) visitFile(entryPath);
	}
}

walk(desktopSource);

const sortedMessages = [...messages].sort();
if (process.argv[2] !== "--check") {
	process.stdout.write(`${sortedMessages.join("\n")}\n`);
	process.exit(0);
}

const catalogPath = path.resolve(
	process.argv[3] ?? "apps/desktop/src/i18n/zh-CN.ts",
);
const catalogText = fs.readFileSync(catalogPath, "utf8");
const catalogFile = ts.createSourceFile(
	catalogPath,
	catalogText,
	ts.ScriptTarget.Latest,
	true,
	ts.ScriptKind.TS,
);
const catalogKeys = new Set();

function collectCatalogKeys(node) {
	if (ts.isPropertyAssignment(node)) {
		if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
			catalogKeys.add(node.name.text);
		}
	}
	ts.forEachChild(node, collectCatalogKeys);
}

collectCatalogKeys(catalogFile);
const missingMessages = sortedMessages.filter(
	(message) => !catalogKeys.has(message),
);
if (missingMessages.length > 0) {
	process.stderr.write(
		`Missing ${missingMessages.length} desktop translations:\n${missingMessages.join("\n")}\n`,
	);
	process.exit(1);
}

process.stdout.write(
	`Desktop Chinese catalog covers all ${sortedMessages.length} extracted messages.\n`,
);
