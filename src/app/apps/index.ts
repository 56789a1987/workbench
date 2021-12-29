import { AppBytebeat } from './bytebeat/bytebeat';
import { AppCalculator } from './calculator/calculator';
import { AppClock } from './clock/clock';
import { AppColors } from './colors/colors';
import { AppDesktopPony } from './desktop-pony/desktop-pony';
import { AppDrawer } from './drawer/drawer';
import { AppGameOfLife } from './game-of-life/game-of-life';
import { AppMatrix } from './matrix/matrix';
import { AppMessageBoard } from './message-board/message-board';
import { AppMinesweeper } from './minesweeper/minesweeper';
import { AppNotepad } from './notepad/notepad';
import { AppNyan } from './nyan/nyan';
import { AppPaint } from './paint/paint';
import { AppPointer } from './pointer/pointer';
import { AppPreferences } from './preferences/preferences';
import { AppRandStr } from './randstr/randstr';
import { AppSpeech } from './speech/speech';
import { AppTestWindow } from './test-window/test-window';

export {
	AppBytebeat,
	AppCalculator,
	AppClock,
	AppColors,
	AppDesktopPony,
	AppDrawer,
	AppGameOfLife,
	AppMatrix,
	AppMessageBoard,
	AppMinesweeper,
	AppNotepad,
	AppNyan,
	AppPaint,
	AppPointer,
	AppPreferences,
	AppRandStr,
	AppSpeech,
	AppTestWindow,
};

export const appComponents = [
	AppBytebeat,
	AppCalculator,
	AppClock,
	AppColors,
	AppDesktopPony,
	AppDrawer,
	AppGameOfLife,
	AppMatrix,
	AppMessageBoard,
	AppMinesweeper,
	AppNotepad,
	AppNyan,
	AppPaint,
	AppPointer,
	AppPreferences,
	AppRandStr,
	AppSpeech,
	AppTestWindow,
];

// allow at most one instance
export const noMultiple = [
	AppColors,
	AppDesktopPony,
	AppMessageBoard,
	AppPointer,
	AppPreferences,
];
