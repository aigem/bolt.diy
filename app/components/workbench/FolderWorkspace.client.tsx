import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLoaderData } from '@remix-run/react';
import { workbenchStore } from '~/lib/stores/workbench';
import { webcontainer } from '~/lib/webcontainer';
import { Workbench } from './Workbench.client';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export function FolderWorkspace() {
    const { previewUrl } = useLoaderData<{ previewUrl: string | null }>();

    useEffect(() => {
        // 初始化工作区
        workbenchStore.setShowWorkbench(true);

        // 监听 WebContainer 初始化
        webcontainer.then(async (wc) => {
            try {
                // 读取本地文件夹内容
                const localFolder = process.env.LOCAL_FOLDER || './';
                const files: Record<string, any> = {};

                async function readDir(dir: string) {
                    const entries = await fs.readdir(dir, { withFileTypes: true });

                    for (const entry of entries) {
                        const fullPath = path.join(dir, entry.name);
                        const relativePath = path.relative(localFolder, fullPath);

                        if (entry.isDirectory()) {
                            await readDir(fullPath);
                        } else {
                            const content = await fs.readFile(fullPath, 'utf-8');
                            files[relativePath] = {
                                file: {
                                    contents: content
                                }
                            };
                        }
                    }
                }

                await readDir(localFolder);

                // 挂载文件到工作目录
                await wc.mount(files);

                // 如果有预览URL，打开预览
                if (previewUrl) {
                    const terminal = workbenchStore.boltTerminal;
                    if (terminal) {
                        await terminal.write(`curl ${previewUrl}\n`);
                    }
                }

                toast.success('工作区初始化成功！');
            } catch (error) {
                console.error('工作区初始化失败:', error);
                toast.error('工作区初始化失败');
            }
        }).catch((error) => {
            console.error('WebContainer 初始化失败:', error);
            toast.error('WebContainer 初始化失败');
        });
    }, [previewUrl]);

    return <Workbench chatStarted={true} />;
} 