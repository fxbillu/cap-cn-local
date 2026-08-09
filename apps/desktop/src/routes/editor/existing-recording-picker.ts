import type { OsType } from "@tauri-apps/plugin-os";
import type { OpenDialogOptions } from "~/utils/dialog";

export const getExistingRecordingPickerOptions = (
	platform: OsType,
	defaultPath: string,
): OpenDialogOptions => {
	if (platform === "windows") {
		return {
			defaultPath,
			directory: true,
			multiple: false,
		};
	}

	return {
		defaultPath,
		filters: [{ name: "Cap Recording", extensions: ["cap"] }],
		multiple: false,
	};
};
