import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import type { RecentFile } from '../types';

export async function readFile(path: string): Promise<string> {
  return invoke<string>('read_file', { path });
}

export async function writeFile(path: string, content: string): Promise<void> {
  return invoke<void>('write_file', { path, content });
}

export async function getRecentFiles(): Promise<RecentFile[]> {
  return invoke<RecentFile[]>('get_recent_files');
}

export async function addRecentFile(file: RecentFile): Promise<void> {
  return invoke<void>('add_recent_file', { file });
}

export async function copyImage(sourcePath: string, targetDir: string): Promise<string> {
  return invoke<string>('copy_image', { sourcePath, targetDir });
}

export async function scanMarkdownFiles(dir: string): Promise<string[]> {
  return invoke<string[]>('scan_markdown_files', { dir });
}

export async function toggleFullScreen(): Promise<boolean> {
  const win = getCurrentWindow();
  const isFullscreen = await win.isFullscreen();
  await win.setFullscreen(!isFullscreen);
  return !isFullscreen;
}
