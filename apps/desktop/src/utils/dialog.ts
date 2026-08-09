import type {
	ConfirmDialogOptions,
	MessageDialogOptions,
	OpenDialogOptions,
	SaveDialogOptions,
} from "@tauri-apps/plugin-dialog";
import {
	ask as nativeAsk,
	confirm as nativeConfirm,
	message as nativeMessage,
	open as nativeOpen,
	save as nativeSave,
} from "@tauri-apps/plugin-dialog";

import { translateDesktopText } from "~/i18n";

export * from "@tauri-apps/plugin-dialog";

type DialogOptions = ConfirmDialogOptions | MessageDialogOptions;

function translateDialogOptions<T extends string | DialogOptions | undefined>(
	options: T,
): T {
	if (typeof options === "string") return translateDesktopText(options) as T;
	if (!options) return options;

	const objectOptions = options as DialogOptions;
	const translated = {
		...objectOptions,
		title: objectOptions.title
			? translateDesktopText(objectOptions.title)
			: objectOptions.title,
	};
	if ("okLabel" in translated && translated.okLabel) {
		translated.okLabel = translateDesktopText(translated.okLabel);
	}
	if ("cancelLabel" in translated && translated.cancelLabel) {
		translated.cancelLabel = translateDesktopText(translated.cancelLabel);
	}
	if (
		"buttons" in translated &&
		translated.buttons &&
		typeof translated.buttons === "object"
	) {
		translated.buttons = Object.fromEntries(
			Object.entries(translated.buttons).map(([key, label]) => [
				key,
				typeof label === "string" ? translateDesktopText(label) : label,
			]),
		) as typeof translated.buttons;
	}

	return translated as T;
}

function translateFileOptions<
	T extends OpenDialogOptions | SaveDialogOptions | undefined,
>(options: T): T {
	if (!options) return options;
	return {
		...options,
		title: options.title ? translateDesktopText(options.title) : options.title,
		filters: options.filters?.map((filter) => ({
			...filter,
			name: translateDesktopText(filter.name),
		})),
	} as T;
}

export const ask: typeof nativeAsk = (message, options) =>
	nativeAsk(translateDesktopText(message), translateDialogOptions(options));

export const confirm: typeof nativeConfirm = (message, options) =>
	nativeConfirm(translateDesktopText(message), translateDialogOptions(options));

export const message: typeof nativeMessage = (dialogMessage, options) =>
	nativeMessage(
		translateDesktopText(dialogMessage),
		translateDialogOptions(options),
	);

export const open: typeof nativeOpen = (options) =>
	nativeOpen(translateFileOptions(options));

export const save: typeof nativeSave = (options?: SaveDialogOptions) =>
	nativeSave(translateFileOptions(options));
