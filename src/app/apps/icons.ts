import { openLink } from 'src/utils';
import { AppPortalsService } from '../services/app-portals.service';
import * as apps from './index';

export interface AppIcon {
	label: string;
	icon?: string;
	activeIcon?: string;
	connectDir?: AppIcon[];
	noMove?: boolean;
	execute: (appPortal: AppPortalsService) => void;
}

export function openDrawer(portals: AppPortalsService, caption: string, icons: AppIcon[], disk?: boolean) {
	portals.openComponent(apps.AppDrawer, drawer => {
		drawer.caption = caption;
		drawer.icons = icons;
		drawer.value = disk ? 100 : -1;
	});
}

export function openNotepad(portals: AppPortalsService, ...text: string[]) {
	portals.openComponent(apps.AppNotepad, notepad => {
		for (let i = 0; i < text.length; i++) {
			notepad.text[i] = text[i];
		}
	});
}

const preferenceIcons: AppIcon[] = [
	{
		label: 'Preferences',
		icon: 'prefs',
		execute: portals => portals.openComponent(apps.AppPreferences),
	},
	{
		label: 'Palette',
		icon: 'palette',
		execute: portals => portals.openComponent(apps.AppColors),
	},
	{
		label: 'Pointer',
		icon: 'pointer',
		execute: portals => portals.openComponent(apps.AppPointer),
	},
];

const utilitiesIcons: AppIcon[] = [
	{
		label: 'Prefs',
		icon: 'folder-pref',
		activeIcon: 'folder-pref-open',
		execute: portals => openDrawer(portals, 'Prefs', preferenceIcons, false),
		connectDir: preferenceIcons,
	},
	{
		label: 'Notepad',
		icon: 'note',
		execute: portals => portals.openComponent(apps.AppNotepad),
	},
	{
		label: 'Paint',
		icon: 'paint',
		execute: portals => portals.openComponent(apps.AppPaint),
	},
	{
		label: 'Clock',
		icon: 'clock',
		execute: portals => portals.openComponent(apps.AppClock),
	},
	{
		label: 'Calculator',
		icon: 'calc',
		execute: portals => portals.openComponent(apps.AppCalculator),
	},
	{
		label: 'Random Text',
		icon: 'randstr',
		execute: portals => portals.openComponent(apps.AppRandStr),
	},
	{
		label: 'Speech',
		icon: 'speech',
		execute: portals => portals.openComponent(apps.AppSpeech),
	},
];

const demoIcons: AppIcon[] = [
	{
		label: 'Bytebeat',
		icon: 'bytebeat',
		execute: portals => portals.openComponent(apps.AppBytebeat),
	},
	{
		label: 'Pony',
		icon: 'pony',
		activeIcon: 'pony-active',
		execute: portals => portals.openComponent(apps.AppDesktopPony),
	},
	{
		label: 'Flappy Pony',
		icon: 'lollipop',
		execute: () => window.playFlappyGame(),
	},
	{
		label: 'Minesweeper',
		icon: 'minesweeper',
		execute: portals => portals.openComponent(apps.AppMinesweeper),
	},
	{
		label: 'Matrix',
		icon: 'matrix',
		execute: portals => portals.openComponent(apps.AppMatrix),
	},
	{
		label: 'Nyan Cat',
		icon: 'nyan',
		execute: portals => portals.openComponent(apps.AppNyan),
	},
	{
		label: 'Game Of Life',
		icon: 'game-of-life',
		execute: portals => portals.openComponent(apps.AppGameOfLife),
	},
	{
		label: 'MsgBox',
		icon: 'default',
		execute: portals => {
			portals.openComponent(apps.AppTestWindow);
			document.getElementById('background')?.classList.toggle('lol');
		},
	},
];

const favMyIcons: AppIcon[] = [
	{
		label: 'v1',
		icon: 'file-link',
		execute: () => openLink('https://v1.polyethylene.app/'),
	},
	{
		label: 'v2',
		icon: 'file-link',
		execute: () => openLink('https://v2.polyethylene.app/'),
	},
	{
		label: 'CANVAS!',
		icon: 'file-link',
		execute: () => openLink('https://polyethylene.app/canvas/'),
	},
	{
		label: 'Town',
		icon: 'file-link',
		execute: () => openLink('https://town.polyethylene.app/'),
	},
	{
		label: 'GitHub Pages',
		icon: 'file-link',
		execute: () => openLink('https://56789a1987.github.io/'),
	},
];

const favPonyTownIcons: AppIcon[] = [
	{
		label: 'pony.town',
		icon: 'file-link',
		execute: () => openLink('https://pony.town/'),
	},
	{
		label: 'event.pony.town',
		icon: 'file-link',
		execute: () => openLink('https://event.pony.town/'),
	},
	{
		label: 'breezy.pony.town',
		icon: 'file-link',
		execute: () => openLink('https://breezy.pony.town/'),
	},
	{
		label: 'ashes.town',
		icon: 'file-link',
		execute: () => openLink('https://ashes.town/'),
	},
	{
		label: 'pixel.horse',
		icon: 'file-link',
		execute: () => openLink('https://pixel.horse/'),
	},
	{
		label: 'test.pixel.horse',
		icon: 'file-link',
		execute: () => openLink('https://test.pixel.horse/'),
	},
	{
		label: 'mysticalmeadows.co.uk',
		icon: 'file-link',
		execute: () => openLink('https://mysticalmeadows.co.uk/'),
	},
	{
		label: 'luminouskingdom.com',
		icon: 'file-link',
		execute: () => openLink('https://luminouskingdom.com/'),
	},
	{
		label: 'Dannyballsub\'s Fansite',
		icon: 'file-link',
		execute: () => openLink('https://bauldwindaniel6.wixsite.com/ponytown-fansite'),
	},
];

const favVMIcons: AppIcon[] = [
	{
		label: 'TAWS',
		icon: 'file-link',
		execute: () => openLink('https://taws.ch/WB.html'),
	},
	{
		label: 'Windows 93',
		icon: 'file-link',
		execute: () => openLink('http://windows93.net/'),
	},
	{
		label: '98.js',
		icon: 'file-link',
		execute: () => openLink('https://98.js.org/'),
	},
	{
		label: 'WinXP',
		icon: 'file-link',
		execute: () => openLink('https://winxp.vercel.app/'),
	},
	{
		label: 'Win11React',
		icon: 'file-link',
		execute: () => openLink('https://win11.blueedge.me/'),
	},
];

const favoritesIcons: AppIcon[] = [
	{
		label: 'My',
		icon: 'folder',
		activeIcon: 'folder-open',
		execute: portals => openDrawer(portals, 'My', favMyIcons, false),
		connectDir: favMyIcons,
	},
	{
		label: 'VM',
		icon: 'folder-pc',
		activeIcon: 'folder-pc-open',
		execute: portals => openDrawer(portals, 'VM', favVMIcons, false),
		connectDir: favVMIcons,
	},
	{
		label: 'Pony Town',
		icon: 'folder-apple',
		activeIcon: 'folder-apple-open',
		execute: portals => openDrawer(portals, 'Pony Town', favPonyTownIcons, false),
		connectDir: favPonyTownIcons,
	},
	{
		label: 'View on GitHub',
		icon: 'file-link',
		execute: () => openLink('https://github.com/56789a1987/workbench/'),
	},
];

const socialIcons: AppIcon[] = [
	{
		label: 'QQ',
		icon: 'qq',
		execute: portals => openNotepad(portals, `QQ chat groups

Polyethylene's Server:
950872085

Pony Town Custom Servers Lounge:
734700233
`),
	},
	{
		label: 'Bilibili',
		icon: 'bilibili',
		execute: () => openLink('https://space.bilibili.com/456643'),
	},
	{
		label: 'GitHub',
		icon: 'github',
		execute: () => openLink('https://github.com/56789a1987'),
	},
	{
		label: 'Discord',
		icon: 'discord',
		execute: portals => openNotepad(portals, `
For my Discord, please note that I don't respond to friend requests unless I know you well enough :T

│ See next page
▼ if you still want it.
`, `
Discord Tag:

Polyethylene#9926
`),
	},
	{
		label: 'Twitter',
		icon: 'twitter',
		execute: () => openLink('https://twitter.com/56789a1987'),
	},
];

const ramDisk: AppIcon[] = [];

export const desktopIcons: AppIcon[] = [
	{
		label: 'RAM DISK',
		icon: 'disk',
		execute: portals => openDrawer(portals, 'RAM DISK', ramDisk, true),
		connectDir: ramDisk,
		noMove: true,
	},
	{
		label: 'Utilities',
		icon: 'disk',
		execute: portals => openDrawer(portals, 'Utilities', utilitiesIcons, true),
		connectDir: utilitiesIcons,
		noMove: true,
	},
	{
		label: 'Demos',
		icon: 'disk',
		execute: portals => openDrawer(portals, 'Demos', demoIcons, true),
		connectDir: demoIcons,
		noMove: true,
	},
	{
		label: 'Favorites',
		icon: 'folder',
		activeIcon: 'folder-open',
		execute: portals => openDrawer(portals, 'Favorites', favoritesIcons, false),
		connectDir: favoritesIcons,
	},
	{
		label: 'Social sites',
		icon: 'folder',
		activeIcon: 'folder-open',
		execute: portals => openDrawer(portals, 'Social sites', socialIcons, false),
		connectDir: socialIcons,
	},
	{
		label: 'Message Board',
		icon: 'note-dialog',
		execute: portals => portals.openComponent(apps.AppMessageBoard),
	}
];
